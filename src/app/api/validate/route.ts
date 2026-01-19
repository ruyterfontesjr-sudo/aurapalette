import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Mensagem de erro padrão
const DEFAULT_ERROR_MESSAGE = 'Não conseguimos processar sua foto. Por favor, tente com outra foto onde seu rosto esteja bem visível.';

const VALIDATION_PROMPT = `Analise esta foto e responda em JSON.

A foto mostra um rosto humano com olhos visíveis?

Responda APENAS:
{"valid": true} - se tem rosto humano visível (qualquer qualidade é OK)
{"valid": false, "reason": "no_face"} - se NÃO tem rosto humano
{"valid": false, "reason": "sunglasses"} - se tem óculos de sol escuros
{"valid": false, "reason": "black_white"} - se é preto e branco

IMPORTANTE: Se tem um rosto humano, responda {"valid": true}. Aceite fotos com qualidade ruim, iluminação ruim, óculos de grau, maquiagem, filtros.`;

// Mapeamento de razões para mensagens amigáveis
const ERROR_MESSAGES: Record<string, string> = {
    'no_face': 'Não encontramos um rosto na foto. Tire uma selfie olhando para a câmera.',
    'sunglasses': 'Por favor, retire os óculos de sol para vermos seus olhos.',
    'black_white': 'Precisamos de uma foto colorida para analisar suas cores.',
};

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

        // Se inválido, usa mensagem mapeada ou padrão
        const reason = result.reason || '';
        const friendlyMessage = ERROR_MESSAGES[reason] || DEFAULT_ERROR_MESSAGE;

        return NextResponse.json(
            { error: 'INVALID_IMAGE', message: friendlyMessage },
            { status: 422 }
        );

    } catch (error) {
        console.error('Validation error:', error);
        // Se a validação falhar tecnicamente, deixa passar para análise principal
        // (fail open para não bloquear usuários por erro técnico)
        return NextResponse.json({ valid: true });
    }
}
