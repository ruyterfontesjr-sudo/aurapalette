import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const VALIDATION_PROMPT = `Você é um filtro de segurança para um app de colorimetria.
Sua única função é validar se a imagem enviada é adequada para análise.

CRITÉRIOS DE ACEITAÇÃO (Seja FLEXÍVEL):
1. Rosto Humano: Deve haver um rosto visível. (Aceite selfies, fotos de meio corpo, fotos em espelho se o rosto estiver claro).
2. Qualidade: Aceite iluminação caseira, maquiagem leve/média, filtros suaves.
3. Obstrução: O rosto não pode estar totalmente coberto (máscara, celular na frente do rosto todo).

CRITÉRIOS DE REJEIÇÃO (Seja RÁPIDO):
- Foto de objetos, paisagens, animais.
- Breu total (tudo preto).
- Desenhos ou pinturas.
- Foto de outra foto (tela de computador).

Responda APENAS com este JSON:
{
  "valid": true/false,
  "error": "Mensagem curta e amigável em PT-BR explicando o motivo se for false (ex: 'Não detectamos um rosto humano', 'A foto está muito escura')"
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
