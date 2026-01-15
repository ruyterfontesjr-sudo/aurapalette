import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const VALIDATION_PROMPT = `Você é um filtro de qualidade para um app de colorimetria.
Sua única função é validar se a imagem tem qualidade técnica suficiente.

CRITÉRIOS DE ACEITAÇÃO (Seja Razoável, mas Firme):
1. ROSTO VISÍVEL: O rosto deve estar descoberto, sem máscaras, sem celular cobrindo, sem óculos escuros grandes.
2. NITIDEZ: A foto NÃO pode estar borrada ou tremida. Os traços devem ser nítidos.
3. MAQUIAGEM: Aceite cara lavada ou maquiagem leve. REJEITE maquiagem pesada (reboco) que esconde a cor real da pele.
4. ILUMINAÇÃO: Evite breu total ou luz estourada.

CRITÉRIOS DE REJEIÇÃO IMEDIATA:
- Foto borrada/tremida (Impossível analisar).
- Foto de objetos, pets ou paisagens.
- Maquiagem artística ou filtro pesado do Instagram/TikTok que altera a cor.
- Foto preto e branco.

Responda APENAS com este JSON:
{
  "valid": true/false,
  "error": "Mensagem curta em PT-BR (ex: 'Foto muito borrada, tente firmar a mão', 'Maquiagem muito pesada', 'Rosto não encontrado')"
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
