import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const VALIDATION_PROMPT = `Você é um validador de fotos para análise de colorimetria pessoal.
A análise precisa ver claramente: tom de pele, cor dos olhos, e cor do cabelo.

REJEITE SE:
- Não há rosto humano (objeto, animal, paisagem)
- Foto preto e branco ou com filtro que altera cores drasticamente
- Óculos de sol ou óculos escuros (precisamos ver a cor dos olhos)
- Rosto muito escuro/sombrio onde não dá para ver o tom de pele
- Foto extremamente borrada onde não dá para distinguir os traços
- Máscara ou objeto cobrindo o rosto

ACEITE SE:
- Rosto visível com olhos, pele e cabelo identificáveis
- Óculos de grau transparente (dá para ver os olhos)
- Maquiagem (leve ou pesada - a IA consegue analisar)
- Iluminação não perfeita mas ainda dá para ver as cores
- Qualquer ângulo desde que o rosto esteja visível

IMPORTANTE: Se der para identificar tom de pele, cor dos olhos e cabelo, ACEITE.

Responda APENAS com JSON:
{
  "valid": true/false,
  "error": "Mensagem amigável em PT-BR (ex: 'Retire os óculos de sol para vermos seus olhos', 'Precisamos de uma foto colorida', 'Não conseguimos identificar um rosto')"
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
