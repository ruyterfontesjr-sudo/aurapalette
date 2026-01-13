import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Prompt do especialista em colorimetria
const COLORIMETRY_EXPERT_PROMPT = `Você é um ESPECIALISTA CERTIFICADO em colorimetria pessoal com mais de 15 anos de experiência analisando a coloração de pessoas.

ANALISE A FOTO COM EXTREMA PRECISÃO, observando:

1. **TOM DE PELE**: Observe a pele nas áreas sem maquiagem (testa, pescoço, mãos se visíveis)
2. **SUBTOM**: Analise as veias, como a pele reage à luz, reflexos naturais
3. **COR DOS OLHOS**: Tonalidade exata, profundidade, padrões da íris
4. **COR DO CABELO NATURAL**: Considere a raiz se estiver colorido
5. **CONTRASTE GERAL**: Diferença entre pele, olhos e cabelo

Com base na análise REAL da foto, determine:

### CLASSIFICAÇÃO SAZONAL (Seja MUITO específico):
- **Primavera Clara**: Pele clara rosada/pêssego, cabelos loiros dourados/ruivos claros, olhos claros brilhantes
- **Primavera Quente**: Pele dourada clara a média, sardas, cabelos dourados, olhos quentes
- **Primavera Intensa**: Alto contraste, cores vivas, cabelos dourados médios, olhos brilhantes
- **Verão Claro**: Pele clara acinzentada, cabelos loiros acinzentados, olhos cinza/azul suave
- **Verão Suave**: Cores neutras suaves, baixo contraste, cabelos castanhos acinzentados
- **Verão Frio**: Pele rosada, cabelos castanhos frios, olhos azuis/cinza escuros
- **Outono Suave**: Cores quentes suaves, baixo contraste, cabelos castanhos dourados
- **Outono Quente**: Pele dourada, sardas, cabelos ruivos/castanhos quentes, olhos âmbar/verdes
- **Outono Profundo**: Cores quentes intensas, alto contraste, cabelos escuros quentes
- **Inverno Claro**: Pele clara contrastante, cabelos escuros frios, olhos claros intensos
- **Inverno Frio**: Pele fria rosada/oliva, cabelos pretos/castanhos escuros frios, olhos escuros
- **Inverno Profundo**: Alto contraste, pele média a escura, cabelos muito escuros, olhos intensos

Retorne um JSON com a estrutura EXATA abaixo. 
Seja ESPECÍFICO e PERSONALIZADO para esta pessoa.
Use cores que REALMENTE combinam com a coloração observada.

{
  "temperature": "Quente" ou "Fria",
  "undertone": "Dourado/Pêssego/Oliva/Rosado/Neutro-Quente/Neutro-Frio",
  "season": "Nome completo da estação (ex: Outono Quente, Inverno Profundo)",
  "seasonEmoji": "emoji da estação (🌸🌻🍂❄️)",
  "contrast": "Baixo/Médio/Alto",
  "skinDescription": "Descrição detalhada do tom de pele observado",
  "eyeColor": "Cor exata dos olhos",
  "fullAnalysis": {
    "summary": "Parágrafo de 3-4 frases explicando a colorimetria da pessoa de forma personalizada e encorajadora",
    "bestColors": [
      {"name": "Nome da cor", "hex": "#CODIGO", "description": "Onde usar esta cor"},
      // Forneça 12 cores ideais, variando de neutros a vibrantes
    ],
    "avoidColors": [
      {"name": "Nome da cor", "hex": "#CODIGO", "reason": "Por que evitar"},
      // Forneça 5 cores a evitar
    ],
    "neutrals": [
      {"name": "Neutro ideal", "hex": "#CODIGO"}
      // 4 neutros (tons para bases do guarda-roupa)
    ],
    "metals": {
      "best": "Dourado/Prateado/Rose Gold",
      "why": "Explicação de por que este metal realça você",
      "jewelry": ["Lista de tipos de joias recomendadas"],
      "accessoryColors": ["Cores de bolsas, cintos, sapatos"]
    },
    "makeup": {
      "foundation": "Tom de base recomendado (ex: bege dourado médio)",
      "lipsticks": [
        {"name": "Cor do batom", "hex": "#CODIGO", "occasion": "Dia/Noite/Trabalho"}
      ],
      "eyeshadows": [
        {"name": "Cor de sombra", "hex": "#CODIGO"}
      ],
      "blush": {"name": "Cor de blush", "hex": "#CODIGO"},
      "bronzer": "Se combina ou não, e qual tom",
      "tips": "Dicas específicas de maquiagem para esta pessoa"
    },
    "hair": {
      "bestColors": ["Lista de 5 cores de cabelo ideais"],
      "highlights": "Tipos de mechas/luzes que funcionam",
      "avoid": ["Cores de cabelo a evitar"],
      "currentAssessment": "Avaliação da cor atual se visível na foto",
      "tips": "Dicas de coloração"
    },
    "fashion": {
      "capsuleColors": ["5 cores essenciais para guarda-roupa"],
      "accentColors": ["3 cores para peças statement"],
      "patterns": "Estampas que funcionam bem",
      "fabricFinishes": "Tecidos brilhantes ou foscos?",
      "tips": "Dicas de estilo personalizadas"
    },
    "dosDonts": {
      "do": ["5 dicas do que fazer/usar"],
      "dont": ["5 coisas a evitar"]
    }
  }
}

IMPORTANTE: 
- Analise a foto REAL - não use respostas genéricas
- Seja PRECISO nas cores hex - use valores corretos
- Personalize cada recomendação para a pessoa da foto
- Se a foto tiver baixa qualidade ou iluminação ruim, ainda faça a melhor análise possível
- Retorne APENAS o JSON, sem markdown, sem texto adicional`;

export async function POST(request: NextRequest) {
    try {
        const { image, quizData } = await request.json();

        if (!image) {
            return NextResponse.json(
                { error: 'Image is required' },
                { status: 400 }
            );
        }

        // Check if OpenAI API key is configured
        if (!process.env.OPENAI_API_KEY) {
            console.log('⚠️ OPENAI_API_KEY não configurada - retornando dados de demonstração');
            return NextResponse.json(getMockAnalysis());
        }

        console.log('🔍 Iniciando análise com GPT-4 Vision...');

        // Adicionar contexto do quiz se disponível
        let quizContext = '';
        if (quizData) {
            quizContext = `\n\nDados adicionais do quiz do usuário (use para refinar a análise):
- Tom de pele selecionado: ${quizData['1'] || 'não informado'}
- Cor dos olhos: ${quizData['2'] || 'não informado'}  
- Cor do cabelo: ${quizData['3'] || 'não informado'}
- Reação ao sol: ${quizData['4'] || 'não informado'}
- Cor das veias: ${quizData['5'] || 'não informado'}`;
        }

        // Call OpenAI Vision API with enhanced prompt
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
                            image_url: {
                                url: image,
                                detail: 'high', // Alta resolução para melhor análise
                            },
                        },
                        {
                            type: 'text',
                            text: 'Analise minha colorimetria pessoal com base nesta foto. Seja o mais preciso e detalhado possível.',
                        },
                    ],
                },
            ],
            max_tokens: 4000,
            temperature: 0.3, // Mais determinístico para análises consistentes
        });

        const content = response.choices[0]?.message?.content;

        if (!content) {
            throw new Error('Sem resposta da OpenAI');
        }

        console.log('✅ Análise concluída com sucesso!');

        // Parse the JSON response
        let analysis;
        try {
            // Remove possíveis marcadores de código
            const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            analysis = JSON.parse(cleanContent);
        } catch (parseError) {
            console.error('Erro ao parsear resposta:', parseError);
            console.log('Resposta raw:', content);
            throw new Error('Erro ao processar resposta da IA');
        }

        return NextResponse.json(analysis);
    } catch (error) {
        console.error('❌ Erro na análise:', error);

        // Return mock data on error with message
        return NextResponse.json({
            ...getMockAnalysis(),
            _error: 'Usando dados de demonstração devido a erro na API',
        });
    }
}

// Dados mock para demonstração quando API não está disponível
function getMockAnalysis() {
    return {
        temperature: 'Quente',
        undertone: 'Dourado',
        season: 'Outono Quente',
        seasonEmoji: '🍂',
        contrast: 'Médio-Alto',
        skinDescription: 'Tom de pele médio com subtom dourado/pêssego',
        eyeColor: 'Castanho médio com reflexos dourados',
        fullAnalysis: {
            summary: 'Sua colorimetria indica que você é uma pessoa de estação Outono Quente! Isso significa que cores ricas e terrosas realçam magnificamente sua beleza natural. Seu subtom dourado faz com que tons quentes iluminem seu rosto, enquanto cores muito frias podem apagar seu brilho natural.',
            bestColors: [
                { name: 'Terracota', hex: '#E2725B', description: 'Perfeito para blusas e vestidos' },
                { name: 'Mostarda', hex: '#D4A017', description: 'Ótimo para acessórios e casacos' },
                { name: 'Verde Oliva', hex: '#708238', description: 'Ideal para calças e saias' },
                { name: 'Marrom Chocolate', hex: '#7B3F00', description: 'Clássico para peças neutras' },
                { name: 'Coral Quente', hex: '#FF7F50', description: 'Lindo para verão' },
                { name: 'Dourado', hex: '#CFB53B', description: 'Para ocasiões especiais' },
                { name: 'Caramelo', hex: '#FFD59A', description: 'Neutro versátil' },
                { name: 'Pêssego', hex: '#FFCBA4', description: 'Suave e iluminador' },
                { name: 'Verde Floresta', hex: '#228B22', description: 'Sofisticado' },
                { name: 'Laranja Queimado', hex: '#CC5500', description: 'Impactante' },
                { name: 'Vinho', hex: '#722F37', description: 'Elegante para noite' },
                { name: 'Bege Quente', hex: '#C8AD7F', description: 'Base do guarda-roupa' },
            ],
            avoidColors: [
                { name: 'Rosa Choque', hex: '#FF69B4', reason: 'Muito frio para seu subtom' },
                { name: 'Azul Royal', hex: '#4169E1', reason: 'Cria contraste desfavorável' },
                { name: 'Prata Brilhante', hex: '#C0C0C0', reason: 'Apaga seu brilho natural' },
                { name: 'Preto Puro', hex: '#000000', reason: 'Muito duro, prefira marrom escuro' },
                { name: 'Fúcsia', hex: '#FF00FF', reason: 'Cor muito fria' },
            ],
            neutrals: [
                { name: 'Marrom Escuro', hex: '#3E2723' },
                { name: 'Bege', hex: '#C8AD7F' },
                { name: 'Off-White', hex: '#FAF9F6' },
                { name: 'Cáqui', hex: '#C3B091' },
            ],
            metals: {
                best: 'Dourado',
                why: 'O dourado complementa perfeitamente seu subtom quente, criando harmonia com sua pele',
                jewelry: ['Brincos de argola dourada', 'Colares delicados', 'Pulseiras finas', 'Anéis statement'],
                accessoryColors: ['Caramelo', 'Cognac', 'Nude quente', 'Marrom'],
            },
            makeup: {
                foundation: 'Base com subtom amarelado/dourado, tom médio',
                lipsticks: [
                    { name: 'Nude Pêssego', hex: '#FFCBA4', occasion: 'Dia a dia' },
                    { name: 'Coral', hex: '#FF7F50', occasion: 'Trabalho' },
                    { name: 'Terracota', hex: '#E2725B', occasion: 'Noite' },
                    { name: 'Vinho Quente', hex: '#722F37', occasion: 'Ocasiões especiais' },
                ],
                eyeshadows: [
                    { name: 'Bronze', hex: '#CD7F32' },
                    { name: 'Cobre', hex: '#B87333' },
                    { name: 'Marrom Dourado', hex: '#996515' },
                    { name: 'Verde Oliva', hex: '#708238' },
                ],
                blush: { name: 'Pêssego Quente', hex: '#FFCBA4' },
                bronzer: 'Sim! Use bronzer quente para realçar seu tom dourado natural',
                tips: 'Evite maquiagens muito rosadas ou acinzentadas. Prefira sempre tons com base amarela ou dourada.',
            },
            hair: {
                bestColors: ['Caramelo', 'Mel', 'Cobre', 'Castanho dourado', 'Ruivo natural'],
                highlights: 'Mechas em tons de caramelo, mel ou cobre. Babylights douradas ficam incríveis!',
                avoid: ['Loiro platinado', 'Preto azulado', 'Castanho acinzentado'],
                currentAssessment: 'Sua cor atual parece combinar bem com seu tom de pele',
                tips: 'Ao colorir, peça sempre tons quentes. Evite tonalizantes acinzentados.',
            },
            fashion: {
                capsuleColors: ['Marrom chocolate', 'Bege quente', 'Off-white', 'Terracota', 'Verde oliva'],
                accentColors: ['Mostarda', 'Coral', 'Dourado'],
                patterns: 'Estampas em tons terrosos, animal print, florais em cores quentes',
                fabricFinishes: 'Tecidos com brilho sutil como cetim e seda combinam muito bem',
                tips: 'Monte seu guarda-roupa com base em neutros quentes e adicione cor com acessórios e peças statement.',
            },
            dosDonts: {
                do: [
                    'Use dourado em joias e acessórios',
                    'Invista em tons terrosos e quentes',
                    'Experimente coral e pêssego nos lábios',
                    'Use bronzer para realçar seu brilho',
                    'Combine diferentes tons de marrom',
                ],
                dont: [
                    'Evite preto puro próximo ao rosto',
                    'Fuja de rosas muito vibrantes',
                    'Não use prata brilhante',
                    'Evite loiro platinado no cabelo',
                    'Não escolha maquiagens acinzentadas',
                ],
            },
        },
    };
}
