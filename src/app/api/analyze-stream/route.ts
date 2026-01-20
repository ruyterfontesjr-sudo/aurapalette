import OpenAI from 'openai';
import { NextRequest } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Same colorimetry expert prompt from the original analyze route
const COLORIMETRY_EXPERT_PROMPT = `Você é um ESPECIALISTA CERTIFICADO em colorimetria pessoal com mais de 15 anos de experiência.
Sua análise deve ser ÚNICA, PROFUNDA e EXTENSAMENTE PERSONALIZADA para cada pessoa.
O usuário pagou caro por este relatório, então ele deve ser MUITO COMPLETO, detalhado e rico em informações.

ANÁLISE VISUAL OBRIGATÓRIA:
Examine a foto com atenção e identifique:
1. **TOM DE PELE EXATO**: Porcelana? Bege? Morena? Negra? Descreva com precisão o que você VÊ.
2. **COR DOS OLHOS**: Qual a cor específica? Tem nuances? (ex: "castanho mel com reflexos dourados")
3. **COR DO CABELO**: Natural ou tingido? Qual tom exato?
4. **SUBTOM DA PELE**: Quente (veias verdes, tom dourado) ou Frio (veias azuis, tom rosado)?
5. **NÍVEL DE CONTRASTE**: A diferença entre pele, olhos e cabelo é alta, média ou baixa?
6. **CARACTERÍSTICAS ÚNICAS**: Sardas? Bochechas rosadas? Olheiras? Manchas?

REGRA DE OURO - VOLUME E QUANTIDADE:
- NUNCA retorne listas curtas. Sempre forneça MÚLTIPLAS opções.
- Dicas devem ser parágrafos explicativos, não frases curtas.
- Seja verboso e educativo. Explique o "porquê".

EXEMPLOS DE QUANTIDADE MÍNIMA:
- Batons: Mínimo 6 cores (3 dia, 3 noite)
- Blushes: Mínimo 4 opções
- Cabelos: Mínimo 5 sugestões de cor e 4 de corte
- Look Essentials: Mínimo 6 peças chave
- Acessórios: Mínimo 6 tipos de metais/pedras

Retorne a análise neste formato JSON EXATO (não altere chaves):
{
  "temperature": "Quente" ou "Fria",
  "undertone": "Dourado/Pêssego/Oliva/Rosado/Neutro-Quente/Neutro-Frio",
  "season": "Nome completo da estação",
  "seasonEmoji": "emoji da estação",
  "contrast": "Baixo/Médio/Alto",
  "skinDescription": "Descrição detalhada do tom de pele observado (min 2 frases)",
  "eyeColor": "Cor exata dos olhos",
  "fullAnalysis": {
    "summary": "Texto personalizado citando características visuais da foto. Fale diretamente com a usuária. Mínimo 4 frases.",
    "bestColors": [
      {"name": "Nome", "hex": "#HEX", "description": "Uso específico"} // Mínimo 12 cores
    ],
    "avoidColors": [
      {"name": "Nome", "hex": "#HEX", "reason": "Motivo detalhado"} // Mínimo 6 cores
    ],
    "makeup": {
      "overview": "Visão geral detalhada da maquiagem ideal. Explique o conceito.",
      "base": { "undertone": "Subtom exato", "finish": "Acabamento (mate/glow)", "tips": "Dicas detalhadas de aplicação e escolha" },
      "blush": { "colors": ["Cor 1", "Cor 2", "Cor 3", "Cor 4", "Cor 5"], "application": "Técnica detalhada de aplicação" },
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
        "tips": "Dicas de esfumado e combinações"
      },
      "eyeliner": { "colors": ["Cor 1", "Cor 2", "Cor 3"], "styles": "Estilo do traço ideal para o formato de olho" },
      "bronzer": { "shade": "Tom exato", "application": "Onde aplicar para valorizar o rosto" },
      "mascara": { "color": "Cor ideal", "tips": "Dicas de volume ou alongamento" }
    },
    "hair": {
      "overview": "Visão geral do cabelo ideal e como ele harmoniza com a pele.",
      "coloring": {
        "baseColors": ["Cor base 1", "Cor base 2", "Cor base 3", "Cor base 4"],
        "highlights": ["Cor mechas 1", "Cor mechas 2", "Cor mechas 3", "Cor mechas 4"],
        "avoid": ["Cor evitar 1", "Cor evitar 2", "Cor evitar 3"],
        "tips": "Dicas técnicas para pedir ao cabeleireiro"
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
      "overview": "Como os acessórios completam o visual e iluminam o rosto.",
      "metals": {
        "best": [{"name": "Metal 1", "hex": "#HEX"}, {"name": "Metal 2", "hex": "#HEX"}, {"name": "Metal 3", "hex": "#HEX"}, {"name": "Metal 4", "hex": "#HEX"}],
        "avoid": [{"name": "Metal Evitar 1", "hex": "#HEX"}, {"name": "Metal Evitar 2", "hex": "#HEX"}],
        "tips": "Dicas de mix de metais e proporção"
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
      "fashion": "Dica de ouro sobre moda para esta estação",
      "makeup": "Dica de ouro sobre maquiagem para esta estação",
      "accessories": "Dica de ouro sobre acessórios para esta estação",
      "hair": "Dica de ouro sobre cabelo para esta estação"
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
