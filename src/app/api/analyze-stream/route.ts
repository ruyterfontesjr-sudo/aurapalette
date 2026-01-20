import OpenAI from 'openai';
import { NextRequest } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const maxDuration = 60; // Extend timeout to 60 seconds

// Same colorimetry expert prompt from the original analyze route
const COLORIMETRY_EXPERT_PROMPT = `Você é um ESPECIALISTA CERTIFICADO em colorimetria pessoal com mais de 15 anos de experiência.

🚨 REGRA FUNDAMENTAL - PERSONALIZAÇÃO OBRIGATÓRIA:
CADA recomendação deve CITAR características específicas que você observou NA FOTO da pessoa.
O usuário PAGOU por uma análise PERSONALIZADA. Respostas genéricas são PROIBIDAS.

ANÁLISE VISUAL OBRIGATÓRIA (faça primeiro):
Examine a foto e identifique com PRECISÃO:
1. **TOM DE PELE**: Porcelana clara? Bege médio? Morena dourada? Pele negra? Descreva EXATAMENTE.
2. **COR DOS OLHOS**: Seja específico! (ex: "castanho mel com reflexos dourados", "verde acinzentado")
3. **COR DO CABELO**: Natural ou tingido? Tom exato?
4. **SUBTOM DA PELE**: Quente (dourado/pêssego) ou Frio (rosado/azulado)?
5. **NÍVEL DE CONTRASTE**: Alto, Médio ou Baixo?
6. **CARACTERÍSTICAS ÚNICAS**: Sardas? Bochechas rosadas?

🎯 REGRAS DE PERSONALIZAÇÃO:
- No SUMMARY: OBRIGATÓRIO citar cor dos olhos E tom de pele observados
- Em MAQUIAGEM: "Para realçar seus olhos [COR OBSERVADA]...", "Com seu subtom [QUENTE/FRIO]..."
- Em CABELO: "Para harmonizar com seu tom de pele [DESCRIÇÃO]..."
- Em ACESSÓRIOS: "Com seu subtom [QUENTE/FRIO], metais [TIPO] iluminam seu rosto"
- Em cada TIPS: Conectar a dica com uma característica observada

⚠️ PROIBIDO: Frases genéricas como "cores que combinam com você" sem citar características específicas.

✅ VOLUME MÍNIMO: 5+ itens por lista, 3+ frases por parágrafo, 12 bestColors, 6 avoidColors.

Retorne a análise neste formato JSON EXATO (não altere chaves):
{
  "temperature": "Quente" ou "Fria",
  "undertone": "Dourado/Pêssego/Oliva/Rosado/Neutro-Quente/Neutro-Frio",
  "season": "Nome completo da estação",
  "seasonEmoji": "emoji da estação",
  "contrast": "Baixo/Médio/Alto",
  "skinDescription": "Descrição detalhada do tom de pele observado NA FOTO (ex: 'pele morena dourada com subtom pêssego')",
  "eyeColor": "Descrição exata dos olhos observados (ex: 'castanho mel com reflexos dourados')",
  "fullAnalysis": {
    "summary": "OBRIGATÓRIO: Texto de 5+ frases citando 'seus olhos [COR]' e 'sua pele [DESCRIÇÃO]'. Exemplo: 'Com seus olhos castanho-esverdeados e pele morena dourada, você pertence à família Outono Quente...'",
    "bestColors": [
      {"name": "Nome", "hex": "#HEX", "description": "Por que essa cor realça as características DESTA pessoa"} // 12 cores
    ],
    "avoidColors": [
      {"name": "Nome", "hex": "#HEX", "reason": "Por que essa cor não funciona para o tom de pele/olhos DESTA pessoa"} // 6 cores
    ],
    "makeup": {
      "overview": "OBRIGATÓRIO citar: 'Para seu subtom [OBSERVADO] e olhos [COR]...' Visão geral conectando com características observadas.",
      "base": { "undertone": "Subtom que combina com a pele observada", "finish": "Acabamento", "tips": "OBRIGATÓRIO: 'Considerando seu tom de pele [DESC], escolha bases...' (min 2 frases)" },
      "blush": { "colors": ["Cor 1 que realça sua pele [DESC]", "Cor 2", "Cor 3", "Cor 4", "Cor 5"], "application": "Técnica considerando estrutura facial" },
      "lipstick": {
        "dayColors": ["Cor Dia 1", "Cor Dia 2", "Cor Dia 3", "Cor Dia 4"],
        "nightColors": ["Cor Noite 1", "Cor Noite 2", "Cor Noite 3", "Cor Noite 4"],
        "finishes": ["Matte", "Cremoso", "Gloss", "Tint"],
        "tips": "Dicas de como combinar com o resto da make"
      },
      "eyeshadow": {
        "neutrals": ["Cor neutra 1", "Cor neutra 2", "Cor neutra 3", "Cor neutra 4"],
        "accents": ["Cor destaque 1", "Cor destaque 2", "Cor destaque 3", "Cor destaque 4"],
        "avoid": ["Cor a evitar 1", "Cor a evitar 2"],
        "tips": "OBRIGATÓRIO: 'Para realçar seus olhos [COR OBSERVADA], use...' Dicas específicas para a cor dos olhos"
      },
      "eyeliner": { "colors": ["Cor 1", "Cor 2", "Cor 3"], "styles": "Estilo do traço ideal para o formato de olho" },
      "bronzer": { "shade": "Tom exato", "application": "Onde aplicar para valorizar o rosto" },
      "mascara": { "color": "Cor ideal", "tips": "Dicas de volume ou alongamento" }
    },
    "hair": {
      "overview": "OBRIGATÓRIO: 'Para harmonizar com sua pele [DESCRIÇÃO] e contraste [NÍVEL]...' Visão geral conectando com características.",
      "coloring": {
        "baseColors": ["Cor que harmoniza com pele [DESC]", "Cor 2", "Cor 3", "Cor 4", "Cor 5"],
        "highlights": ["Mechas que iluminam seu tom", "Mechas 2", "Mechas 3", "Mechas 4"],
        "avoid": ["Cor que compete com sua pele [DESC]", "Cor 2", "Cor 3"],
        "tips": "OBRIGATÓRIO: 'Considerando seu contraste [NÍVEL] e tom de pele...' Dicas específicas"
      },
      "cuts": { "recommended": ["Corte 1", "Corte 2", "Corte 3", "Corte 4", "Corte 5"], "tips": "Dicas de finalização e manutenção" },
      "styling": { "products": ["Produto 1", "Produto 2", "Produto 3"], "techniques": ["Técnica 1", "Técnica 2"] }
    },
    "fashion": {
      "overview": "Visão geral do estilo e como as cores influenciam a imagem pessoal.",
      "essentials": ["Peça 1", "Peça 2", "Peça 3", "Peça 4", "Peça 5", "Peça 6", "Peça 7"],
      "fabrics": ["Tecido 1", "Tecido 2", "Tecido 3", "Tecido 4"],
      "patterns": ["Estampa 1", "Estampa 2", "Estampa 3"],
      "occasions": { "casual": "Sugestão de look completo casual", "work": "Sugestão de look completo trabalho", "evening": "Sugestão de look completo noite" }
    },
    "accessories": {
      "overview": "OBRIGATÓRIO: 'Com seu subtom [QUENTE/FRIO], metais [TIPO] iluminam seu rosto...' Conectar com características.",
      "metals": {
        "best": [{"name": "Metal ideal para subtom [DESC]", "hex": "#HEX"}, {"name": "Metal 2", "hex": "#HEX"}, {"name": "Metal 3", "hex": "#HEX"}, {"name": "Metal 4", "hex": "#HEX"}, {"name": "Metal 5", "hex": "#HEX"}, {"name": "Metal 6", "hex": "#HEX"}],
        "avoid": [{"name": "Metal que apaga seu subtom [DESC]", "hex": "#HEX"}, {"name": "Metal 2", "hex": "#HEX"}],
        "tips": "OBRIGATÓRIO: 'Para seu subtom [DESC], prefira...' Por que esses metais funcionam"
      },
      "jewelry": {
        "necklaces": ["Tipo 1", "Tipo 2", "Tipo 3"],
        "earrings": ["Tipo 1", "Tipo 2", "Tipo 3", "Tipo 4"],
        "bracelets": ["Tipo 1", "Tipo 2", "Tipo 3"],
        "rings": ["Tipo 1", "Tipo 2", "Tipo 3"]
      },
      "glasses": { "frames": ["Formato 1", "Formato 2", "Formato 3"], "colors": ["Cor 1", "Cor 2", "Cor 3"] },
      "bags": { "colors": ["Cor 1", "Cor 2", "Cor 3", "Cor 4"], "materials": ["Material 1", "Material 2"] },
      "scarves": { "colors": ["Cor 1", "Cor 2", "Cor 3"], "patterns": ["Padronagem 1", "Padronagem 2"] },
      "watches": { "styles": ["Estilo 1", "Estilo 2"], "metals": ["Metal 1", "Metal 2"] }
    },
    "tips": {
      "fashion": "OBRIGATÓRIO citar característica: 'Com sua pele [DESC], invista em...' Dica personalizada",
      "makeup": "OBRIGATÓRIO citar: 'Para realçar seus olhos [COR]...' Dica conectando com características",
      "accessories": "OBRIGATÓRIO citar: 'Seu subtom [DESC] pede...' Dica personalizada para o subtom",
      "hair": "OBRIGATÓRIO citar: 'Considerando seu contraste [NÍVEL] e pele [DESC]...' Dica personalizada"
    }
  },
  "seasonTrends": {
    "colors": [{"name": "Cor Tendência 1", "hex": "#HEX", "description": "Desc"}, {"name": "Cor Tendência 2", "hex": "#HEX", "description": "Desc"}, {"name": "Cor Tendência 3", "hex": "#HEX", "description": "Desc"}],
    "makeup": [{"title": "Trend Make 1", "description": "Desc detalhada", "icon": "💄"}, {"title": "Trend Make 2", "description": "Desc detalhada", "icon": "✨"}],
    "hair": [{"title": "Trend Hair 1", "description": "Desc detalhada", "icon": "💇"}, {"title": "Trend Hair 2", "description": "Desc detalhada", "icon": "✂️"}],
    "accessories": [{"title": "Trend Acessório 1", "description": "Desc detalhada", "icon": "💎"}, {"title": "Trend Acessório 2", "description": "Desc detalhada", "icon": "👜"}]
  }
}`;

// SSE event types and step definitions
type SSEEventType = 'step' | 'insight' | 'complete' | 'error';

interface SSEEvent {
  type: SSEEventType;
  step?: string;
  progress?: number;
  field?: string;
  value?: string;
  result?: Record<string, unknown>;
  error?: { type: string; message: string };
}

// Analysis steps with progress ranges
const ANALYSIS_STEPS = [
  { id: 'detecting_face', label: 'Detectando seu rosto...', progressStart: 0, progressEnd: 15 },
  { id: 'analyzing_skin', label: 'Analisando tom de pele...', progressStart: 15, progressEnd: 30 },
  { id: 'analyzing_eyes', label: 'Identificando cor dos olhos...', progressStart: 30, progressEnd: 45 },
  { id: 'calculating_contrast', label: 'Calculando contraste pessoal...', progressStart: 45, progressEnd: 60 },
  { id: 'identifying_undertone', label: 'Identificando subtom...', progressStart: 60, progressEnd: 75 },
  { id: 'generating_palette', label: 'Gerando sua paleta...', progressStart: 75, progressEnd: 90 },
  { id: 'finalizing', label: 'Finalizando análise...', progressStart: 90, progressEnd: 100 },
] as const;

// Fields to extract as insights during streaming
const INSIGHT_FIELDS = ['skinDescription', 'eyeColor', 'undertone', 'temperature', 'contrast', 'season'] as const;

function formatSSEEvent(event: SSEEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

// Parse partial JSON to extract fields as they become complete
function extractPartialInsights(partialJson: string): Record<string, string> {
  const insights: Record<string, string> = {};

  for (const field of INSIGHT_FIELDS) {
    // Try to match complete field values using regex
    const regex = new RegExp(`"${field}"\\s*:\\s*"([^"]+)"`, 'i');
    const match = partialJson.match(regex);
    if (match && match[1]) {
      insights[field] = match[1];
    }
  }

  return insights;
}

// Determine current step based on accumulated content
function determineStep(partialJson: string, extractedInsights: Record<string, string>): typeof ANALYSIS_STEPS[number] | null {
  const insightCount = Object.keys(extractedInsights).length;

  // Progress through steps based on extracted data
  if (partialJson.includes('"fullAnalysis"')) {
    if (partialJson.includes('"bestColors"')) return ANALYSIS_STEPS[5]; // generating_palette
    if (partialJson.includes('"summary"')) return ANALYSIS_STEPS[5];
    return ANALYSIS_STEPS[4]; // identifying_undertone
  }

  if (extractedInsights.undertone || partialJson.includes('"undertone"')) return ANALYSIS_STEPS[4];
  if (extractedInsights.contrast || partialJson.includes('"contrast"')) return ANALYSIS_STEPS[3];
  if (extractedInsights.eyeColor || partialJson.includes('"eyeColor"')) return ANALYSIS_STEPS[2];
  if (extractedInsights.skinDescription || partialJson.includes('"skinDescription"')) return ANALYSIS_STEPS[1];
  if (insightCount > 0 || partialJson.length > 50) return ANALYSIS_STEPS[1];

  return ANALYSIS_STEPS[0]; // detecting_face
}

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();
  let aborted = false;

  const stream = new ReadableStream({
    async start(controller) {
      // Cleanup function
      const cleanup = () => {
        aborted = true;
        try {
          controller.close();
        } catch {
          // Controller may already be closed
        }
      };

      // Setup timeout (60 seconds)
      const timeout = setTimeout(() => {
        if (!aborted) {
          const errorEvent = formatSSEEvent({
            type: 'error',
            error: { type: 'TIMEOUT_ERROR', message: 'A análise demorou mais que o esperado. Tente novamente.' }
          });
          controller.enqueue(encoder.encode(errorEvent));
          cleanup();
        }
      }, 60000);

      try {
        const { image, quizData } = await request.json();

        if (!image) {
          const errorEvent = formatSSEEvent({
            type: 'error',
            error: { type: 'VALIDATION_ERROR', message: 'Imagem é obrigatória.' }
          });
          controller.enqueue(encoder.encode(errorEvent));
          cleanup();
          clearTimeout(timeout);
          return;
        }

        if (!process.env.OPENAI_API_KEY) {
          const errorEvent = formatSSEEvent({
            type: 'error',
            error: { type: 'SERVER_ERROR', message: 'Erro de configuração do servidor.' }
          });
          controller.enqueue(encoder.encode(errorEvent));
          cleanup();
          clearTimeout(timeout);
          return;
        }

        // Build quiz context
        let quizContext = '';
        if (quizData) {
          quizContext = `\n\nDados do questionário (use para complementar sua análise visual):
- Tom de pele (auto-relato): ${quizData['1'] || 'N/A'}
- Cor dos olhos: ${quizData['2'] || 'N/A'}
- Cor do cabelo natural: ${quizData['3'] || 'N/A'}
- Reação ao sol: ${quizData['4'] || 'N/A'}
- Cor das veias: ${quizData['5'] || 'N/A'}
- Sardas/pintas: ${quizData['6'] || 'N/A'}
- Cor quando cora: ${quizData['7'] || 'N/A'}

IMPORTANTE: Combine os dados do quiz com sua análise visual da foto para máxima precisão.`;
        }

        // Send initial step
        controller.enqueue(encoder.encode(formatSSEEvent({
          type: 'step',
          step: 'detecting_face',
          progress: 5
        })));

        // Start streaming OpenAI request
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
                  image_url: { url: image, detail: 'auto' },
                },
                {
                  type: 'text',
                  text: 'Analise minha foto e forneça a análise completa de colorimetria.',
                },
              ],
            },
          ],
          max_tokens: 4000,
          temperature: 0.2,
          stream: true,
          response_format: { type: "json_object" },
        });

        let accumulatedContent = '';
        let extractedInsights: Record<string, string> = {};
        let sentInsights = new Set<string>();
        let lastStep: typeof ANALYSIS_STEPS[number] | null = null;

        for await (const chunk of response) {
          if (aborted) break;

          const content = chunk.choices[0]?.delta?.content;
          if (!content) continue;

          accumulatedContent += content;

          // Extract insights from partial JSON
          const newInsights = extractPartialInsights(accumulatedContent);

          // Send new insights
          for (const [field, value] of Object.entries(newInsights)) {
            if (!sentInsights.has(field)) {
              sentInsights.add(field);
              extractedInsights[field] = value;

              controller.enqueue(encoder.encode(formatSSEEvent({
                type: 'insight',
                field,
                value
              })));
            }
          }

          // Determine and send step updates
          const currentStep = determineStep(accumulatedContent, extractedInsights);
          if (currentStep && currentStep !== lastStep) {
            lastStep = currentStep;
            controller.enqueue(encoder.encode(formatSSEEvent({
              type: 'step',
              step: currentStep.id,
              progress: currentStep.progressStart + Math.floor((currentStep.progressEnd - currentStep.progressStart) / 2)
            })));
          }
        }

        if (aborted) {
          clearTimeout(timeout);
          return;
        }

        // Parse final result
        try {
          // Try to extract JSON from the response (may have extra text)
          let jsonContent = accumulatedContent.trim();

          // If response starts with text before JSON, try to find the JSON object
          const jsonStart = jsonContent.indexOf('{');
          const jsonEnd = jsonContent.lastIndexOf('}');

          if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
            jsonContent = jsonContent.slice(jsonStart, jsonEnd + 1);
          }

          const result = JSON.parse(jsonContent);

          // Send finalizing step
          controller.enqueue(encoder.encode(formatSSEEvent({
            type: 'step',
            step: 'finalizing',
            progress: 95
          })));

          // Small delay for visual feedback
          await new Promise(resolve => setTimeout(resolve, 200));

          // Send complete result (always accept, no validation)
          controller.enqueue(encoder.encode(formatSSEEvent({
            type: 'complete',
            progress: 100,
            result
          })));
        } catch (parseError) {
          // JSON parsing failed - log for debugging
          console.error('JSON parse error:', parseError);
          console.error('Accumulated content length:', accumulatedContent.length);
          console.error('Content preview:', accumulatedContent.slice(0, 500));

          controller.enqueue(encoder.encode(formatSSEEvent({
            type: 'error',
            error: { type: 'SERVER_ERROR', message: 'A IA não retornou uma análise válida. Tente com outra foto.' }
          })));
        }

        clearTimeout(timeout);
        cleanup();

      } catch (error) {
        clearTimeout(timeout);

        console.error('Streaming analysis error:', error);

        const errorMessage = error instanceof Error && error.message.includes('network')
          ? { type: 'NETWORK_ERROR', message: 'Erro de conexão. Verifique sua internet.' }
          : { type: 'SERVER_ERROR', message: 'Erro interno. Tente novamente.' };

        if (!aborted) {
          controller.enqueue(encoder.encode(formatSSEEvent({
            type: 'error',
            error: errorMessage
          })));
          cleanup();
        }
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
    },
  });
}
