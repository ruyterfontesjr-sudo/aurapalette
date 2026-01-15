import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Prompt do especialista em colorimetria
const COLORIMETRY_EXPERT_PROMPT = `Você é um ESPECIALISTA CERTIFICADO em colorimetria pessoal com mais de 15 anos de experiência.
Sua reputação depende de análises precisas e honestas.

ETAPA 1: VALIDAÇÃO DA IMAGEM (Seja flexível)
O objetivo é TENTAR analisar a imagem, rejeitando apenas casos impossíveis.
1. Existe um rosto humano visível? (Aceite mesmo se não estiver perfeitamente centralizado. Rejeite apenas se não houver rosto ou se estiver muito longe/borrado).
2. É possível ver a pele? (Aceite iluminação caseira. Rejeite apenas se estiver breu total ou estourada a ponto de não ver cor).
3. Maquiagem/Filtros: ACEITE maquiagem leve ou filtros suaves. Rejeite apenas se houver filtros artísticos pesados (ex: desenho, preto e branco) ou maquiagem que cubra 100% da pele como uma máscara.

SE A IMAGEM FOR COMPLETAMENTE IMPOSSÍVEL DE ANALISAR:
Retorne APENAS este JSON de erro:
{
  "error": "INVALID_IMAGE",
  "reason": "Explique o motivo (ex: não é uma pessoa, foto preto e branco)"
}

ETAPA 2: ANÁLISE PROFUNDA (Apenas se passar na validação)
Analise com precisão cirúrgica:
1. **TOM DE PELE**: Observe a pele nas áreas sem maquiagem (testa, pescoço). Descreva o que vê.
2. **SUBTOM**: Analise as veias, reação à luz. É quente (dourado/amarelo) ou frio (rosa/azul)?
3. **CONTRASTE**: Diferença entre cabelo, olhos e pele.

Com base na análise REAL da foto, determine a estação e gere um relatório 100% personalizado.
IMPORTANTE: Para provar que a análise é real, na seção "summary", você DEVE citar uma característica específica visualizada na foto (ex: "Notei que seus olhos castanhos têm um brilho dourado..." ou "Sua pele tem sardas que indicam...").

Retorne a análise neste formato JSON EXATO (não altere chaves):
{
  "temperature": "Quente" ou "Fria",
  "undertone": "Dourado/Pêssego/Oliva/Rosado/Neutro-Quente/Neutro-Frio",
  "season": "Nome completo da estação",
  "seasonEmoji": "emoji da estação",
  "contrast": "Baixo/Médio/Alto",
  "skinDescription": "Descrição detalhada do tom de pele observado",
  "eyeColor": "Cor exata dos olhos",
  "fullAnalysis": {
    "summary": "Texto personalizado citando características visuais da foto. Fale diretamente com a usuária.",
    "bestColors": [
      {"name": "Nome", "hex": "#HEX", "description": "Uso"} // 12 cores
    ],
    "avoidColors": [
      {"name": "Nome", "hex": "#HEX", "reason": "Motivo"} // 5 cores
    ],
    "makeup": {
      "overview": "Visão geral da maquiagem ideal",
      "base": { "undertone": "Subtom", "finish": "Acabamento", "tips": "Dicas" },
      "blush": { "colors": ["Cor 1", "Cor 2"], "application": "Como aplicar" },
      "lipstick": { 
        "dayColors": ["Cor Dia 1", "Cor Dia 2"], 
        "nightColors": ["Cor Noite 1"], 
        "finishes": ["Matte/Cremoso"], 
        "tips": "Dicas" 
      },
      "eyeshadow": { 
        "neutrals": ["Cor neutra 1"], 
        "accents": ["Cor destaque 1"], 
        "avoid": ["Cor a evitar"], 
        "tips": "Dicas" 
      },
      "eyeliner": { "colors": ["Cor 1"], "styles": "Estilo do traço" },
      "bronzer": { "shade": "Tom", "application": "Aplicação" },
      "mascara": { "color": "Cor", "tips": "Dicas" }
    },
    "hair": {
      "overview": "Visão geral do cabelo ideal",
      "coloring": { 
        "baseColors": ["Cor base 1"], 
        "highlights": ["Cor mechas"], 
        "avoid": ["Cor evitar"], 
        "tips": "Dicas" 
      },
      "cuts": { "recommended": ["Corte 1", "Corte 2"], "tips": "Dicas" },
      "styling": { "products": ["Produto 1"], "techniques": ["Técnica 1"] }
    },
    "fashion": {
      "overview": "Visão geral do estilo",
      "essentials": ["Peça essencial 1", "Peça essencial 2"],
      "fabrics": ["Tecido 1"],
      "patterns": ["Estampa 1"],
      "occasions": { "casual": "Dica casual", "work": "Dica trabalho", "evening": "Dica noite" }
    },
    "accessories": {
      "overview": "Visão geral acessórios",
      "metals": { "best": [{"name": "Ouro", "hex": "#FFD700"}], "avoid": [{"name": "Prata", "hex": "#C0C0C0"}], "tips": "Dicas metais" },
      "jewelry": { 
        "necklaces": ["Tipo colar"], 
        "earrings": ["Tipo brinco"], 
        "bracelets": ["Tipo pulseira"], 
        "rings": ["Tipo anel"] 
      },
      "glasses": { "frames": ["Formato armação"], "colors": ["Cor armação"] },
      "bags": { "colors": ["Cor bolsa"], "materials": ["Material bolsa"] },
      "scarves": { "colors": ["Cor lenço"], "patterns": ["Estampa lenço"] },
      "watches": { "styles": ["Estilo relógio"], "metals": ["Metal relógio"] }
    },
    "tips": {
      "fashion": "Dica final moda",
      "makeup": "Dica final make",
      "accessories": "Dica final acessórios",
      "hair": "Dica final cabelo"
    }
  },
  "seasonTrends": {
    "colors": [{"name": "Cor Tendência", "hex": "#HEX", "description": "Descrição"}],
    "makeup": [{"title": "Trend Make", "description": "Desc", "icon": "💄"}],
    "hair": [{"title": "Trend Hair", "description": "Desc", "icon": "💇"}],
    "accessories": [{"title": "Trend Acessório", "description": "Desc", "icon": "💎"}]
  }
}`;

export async function POST(request: NextRequest) {
  try {
    const { image, quizData } = await request.json();

    if (!image) {
      return NextResponse.json({ error: 'Image is required' }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is missing');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    let quizContext = '';
    if (quizData) {
      quizContext = `\n\nDados reportados pela usuária (use para confirmar sua análise visual, mas confie mais na foto):
- Pele (auto-relato): ${quizData['1'] || 'N/A'}
- Olhos: ${quizData['2'] || 'N/A'}
- Cabelo: ${quizData['3'] || 'N/A'}
- Reação ao sol: ${quizData['4'] || 'N/A'}
- Veias: ${quizData['5'] || 'N/A'}`;
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: COLORIMETRY_EXPERT_PROMPT + quizContext,
        },
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: image, detail: 'high' },
            },
            {
              type: 'text',
              text: 'Analise minha foto. Se a foto for ruim ou não tiver rosto, me avise.',
            },
          ],
        },
      ],
      max_tokens: 4000,
      temperature: 0.2, // Baixa temperatura para seguir estritamente o formato JSON e validação
      response_format: { type: "json_object" } // Forçar JSON
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No response from AI');
    }

    const result = JSON.parse(content);

    // Check for validation error returned by the model
    if (result.error === 'INVALID_IMAGE') {
      return NextResponse.json(
        { error: 'INVALID_IMAGE', message: result.reason },
        { status: 422 } // Unprocessable Entity
      );
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze image. Please try again with a clearer photo.' },
      { status: 500 }
    );
  }
}
