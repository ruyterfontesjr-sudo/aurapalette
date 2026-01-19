import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const VALIDATION_PROMPT = `Você é um validador de fotos para análise de colorimetria pessoal.
Precisamos ver claramente: tom de pele, cor dos olhos (essencial!), e cabelo.

CRITÉRIOS DE REJEIÇÃO (seja rigoroso):
1. **SEM ROSTO**: Foto de objeto, animal, paisagem, ou sem humano visível
2. **ÓCULOS DE QUALQUER TIPO**: 
   - Óculos de sol (SEMPRE rejeitar)
   - Óculos de grau (SEMPRE rejeitar - precisamos ver os olhos sem distorção)
   - Qualquer acessório cobrindo os olhos
3. **ROSTO COBERTO**: Máscara, celular, mão, cabelo cobrindo o rosto
4. **FOTO PRETO E BRANCO ou SÉPIA**: Não conseguimos analisar cores
5. **OLHOS NÃO VISÍVEIS**: Pessoa de olhos fechados, muito escuro, ou olhos cortados da foto

CRITÉRIOS DE ACEITAÇÃO (seja tolerante):
- Rosto humano visível com OLHOS À MOSTRA
- Foto colorida (mesmo com iluminação não ideal)
- Qualidade pode ser baixa, desde que dê para ver rosto e olhos
- Maquiagem leve é OK
- Cabelo pode estar preso ou solto

IMPORTANTE: Nossa análise depende CRITICAMENTE de ver os olhos naturais.
Óculos distorcem a cor real dos olhos e impedem a análise precisa.

Responda APENAS com JSON:
{
  "valid": true/false,
  "error": "Mensagem curta, amigável e específica em PT-BR. Exemplos:
    - 'Por favor, retire os óculos para vermos seus olhos naturais 👓'
    - 'Precisamos de uma foto colorida para analisar suas cores 🎨'
    - 'Não encontramos um rosto na foto. Tire uma selfie olhando para a câmera 📸'
    - 'Seus olhos parecem estar fechados ou cobertos. Olhe para a câmera 👀'"
}`;

export async function POST(request: NextRequest) {
    try {
        const { image } = await request.json();

        if (!image) {
            return NextResponse.json({ error: 'Image is required' }, { status: 400 });
        }

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini', // Much faster model for validation
            messages: [
                {
                    role: 'system',
                    content: VALIDATION_PROMPT,
                },
                {
                    role: 'user',
                    content: [
                        {
                            type: 'image_url',
                            image_url: { url: image, detail: 'low' }, // Low detail is fast and enough for detection
                        },
                    ],
                },
            ],
            max_tokens: 200,
            temperature: 0.1,
            response_format: { type: "json_object" }
        });

        const content = response.choices[0]?.message?.content;
        if (!content) throw new Error('No response from AI');

        const result = JSON.parse(content);

        // If valid, just return ok (we don't need detailed analysis yet)
        // If invalid, return 422
        if (!result.valid) {
            return NextResponse.json(
                { error: 'INVALID_IMAGE', message: result.error },
                { status: 422 }
            );
        }

        return NextResponse.json({ valid: true });

    } catch (error) {
        console.error('Validation error:', error);
        // If validation fails technically, we might want to fail open or closed.
        // Let's fail safe: allow it to proceed to full analysis if this fails, or block?
        // Block to avoid waiting 20s for an error.
        return NextResponse.json(
            { error: 'Failed to validate image' },
            { status: 500 }
        );
    }
}
