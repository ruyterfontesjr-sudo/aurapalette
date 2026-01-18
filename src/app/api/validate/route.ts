import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const VALIDATION_PROMPT = `Você é um validador de fotos para análise de colorimetria pessoal.
Precisamos ver: tom de pele, cor dos olhos, e cabelo.

REJEITE SE:
- Não há rosto humano (objeto, animal, paisagem, etc)
- Foto preto e branco ou sépia
- Pessoa usando QUALQUER tipo de óculos (de sol OU de grau) - precisamos ver os olhos sem obstáculos
- Máscara, celular ou objeto cobrindo o rosto
- Rosto não está visível na foto

ACEITE SE:
- Tem um rosto humano visível
- Dá para ver os olhos (sem óculos)
- Foto é colorida
- Qualidade pode ser baixa, iluminação pode não ser perfeita - desde que dê para ver o rosto

SEJA TOLERANTE com qualidade de foto. Não rejeite por estar um pouco escura ou não tão nítida.
O importante é: TEM ROSTO? DÁ PRA VER OS OLHOS? É COLORIDA? Se sim, ACEITE.

Responda APENAS com JSON:
{
  "valid": true/false,
  "error": "Mensagem curta e amigável em PT-BR (ex: 'Retire os óculos para vermos seus olhos', 'Envie uma foto colorida', 'Não encontramos um rosto na foto')"
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
