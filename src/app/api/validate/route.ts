import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const VALIDATION_PROMPT = `Você é um validador de fotos para análise de colorimetria pessoal.
Seu trabalho é APENAS rejeitar fotos que são IMPOSSÍVEIS de analisar.

REJEITAR APENAS SE:
1. **NÃO TEM ROSTO HUMANO**: Foto de objeto, animal, paisagem, meme, ou sem pessoa
2. **ÓCULOS DE SOL ESCUROS**: Que escondem completamente os olhos
3. **ROSTO TOTALMENTE COBERTO**: Máscara cobrindo tudo, rosto completamente no escuro
4. **FOTO PRETO E BRANCO**: Sem cores (sépia/P&B)

ACEITAR (mesmo se não for perfeita):
- Qualquer foto com rosto humano visível
- Óculos de grau transparentes = OK (dá para ver os olhos)
- Iluminação ruim, artificial, ou colorida = OK
- Foto escura mas dá para ver o rosto = OK
- Qualidade baixa, pixelada = OK
- Maquiagem pesada = OK
- Filtros leves = OK
- Ângulo estranho = OK
- Parte do rosto cortada mas olhos visíveis = OK

REGRA: Na dúvida, ACEITE. A análise principal vai lidar com fotos difíceis.

Responda APENAS com JSON:
{
  "valid": true/false,
  "error": "Mensagem curta se inválida. Exemplos:
    - 'Retire os óculos de sol para vermos seus olhos 👓'
    - 'Precisamos de uma foto colorida 🎨'
    - 'Não encontramos um rosto na foto 📸'"
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
