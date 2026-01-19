import OpenAI from 'openai';
import { NextRequest } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Same colorimetry expert prompt from the original analyze route
const COLORIMETRY_EXPERT_PROMPT = `Você é um ESPECIALISTA CERTIFICADO em colorimetria pessoal com mais de 15 anos de experiência.
Sua análise deve ser ÚNICA e PERSONALIZADA para cada pessoa.

ANÁLISE VISUAL OBRIGATÓRIA:
Examine a foto com atenção e identifique:
1. **TOM DE PELE EXATO**: Porcelana? Bege? Morena? Negra? Descreva com precisão o que você VÊ.
2. **COR DOS OLHOS**: Qual a cor específica? Tem nuances? (ex: "castanho mel com reflexos dourados")
3. **COR DO CABELO**: Natural ou tingido? Qual tom exato?
4. **SUBTOM DA PELE**: Quente (veias verdes, tom dourado) ou Frio (veias azuis, tom rosado)?
5. **NÍVEL DE CONTRASTE**: A diferença entre pele, olhos e cabelo é alta, média ou baixa?
6. **CARACTERÍSTICAS ÚNICAS**: Sardas? Bochechas rosadas? Olheiras? Manchas?

REGRA DE OURO - PERSONALIZAÇÃO:
- Cada campo do relatório DEVE refletir a análise visual real
- No "summary", CITE características específicas que você observou na foto
- As cores recomendadas devem combinar com o tom ESPECÍFICO desta pessoa
- As dicas de maquiagem devem considerar a cor REAL dos olhos e pele desta pessoa
- NUNCA use textos genéricos - tudo deve ser personalizado

EXEMPLOS DE PERSONALIZAÇÃO:
- "Seus olhos castanho-esverdeados combinam perfeitamente com tons terrosos..."
- "Notei que sua pele tem um subtom dourado, o que significa que..."
- "As sardas no seu rosto indicam sensibilidade ao sol, então..."

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
                  image_url: { url: image, detail: 'low' },
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
          const result = JSON.parse(accumulatedContent);

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
        } catch {
          // JSON parsing failed
          controller.enqueue(encoder.encode(formatSSEEvent({
            type: 'error',
            error: { type: 'SERVER_ERROR', message: 'Erro ao processar resposta. Tente novamente.' }
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
