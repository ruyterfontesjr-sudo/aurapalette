import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Mensagem de erro fixa
const ERROR_MESSAGE = 'Sua imagem não atende aos requisitos mínimos de qualidade. Por favor, tire outra foto e tente novamente.';

const VALIDATION_PROMPT = `Analise esta foto e responda em JSON.

A foto mostra um rosto humano?

Responda APENAS:
{"valid": true} - se tem rosto humano visível
{"valid": false} - se NÃO tem rosto humano

IMPORTANTE: Se tem um rosto humano, responda {"valid": true}. Aceite fotos com qualquer qualidade, iluminação, óculos, maquiagem, filtros.`;

export async function POST(request: NextRequest) {
    try {
        const { image } = await request.json();

        if (!image) {
            return NextResponse.json({ error: 'Image is required' }, { status: 400 });
        }

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
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
                            image_url: { url: image, detail: 'low' },
                        },
                    ],
                },
            ],
            max_tokens: 100,
            temperature: 0,
            response_format: { type: "json_object" }
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
            // Se não conseguiu resposta, deixa passar para análise principal
            console.log('Validation: No response, allowing through');
            return NextResponse.json({ valid: true });
        }

        let result;
        try {
            result = JSON.parse(content);
        } catch {
            // Se JSON inválido, deixa passar
            console.log('Validation: Invalid JSON, allowing through');
            return NextResponse.json({ valid: true });
        }

        // Se válido, retorna ok
        if (result.valid === true) {
            return NextResponse.json({ valid: true });
        }

        // Se inválido, usa mensagem fixa
        return NextResponse.json(
            { error: 'INVALID_IMAGE', message: ERROR_MESSAGE },
            { status: 422 }
        );

    } catch (error) {
        console.error('Validation error:', error);
        // Se a validação falhar tecnicamente, deixa passar para análise principal
        // (fail open para não bloquear usuários por erro técnico)
        return NextResponse.json({ valid: true });
    }
}
