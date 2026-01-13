// ============================================
// TENDÊNCIAS DE MODA 2026
// ============================================

export interface Trend {
    title: string;
    description: string;
    icon: string;
}

export interface ColorTrend {
    name: string;
    hex: string;
    description: string;
}

export interface SeasonTrends {
    colors: ColorTrend[];
    makeup: Trend[];
    hair: Trend[];
    accessories: Trend[];
}

// Cores do ano 2026 (baseado em tendências Pantone e fashion weeks)
export const trendingColors2026: ColorTrend[] = [
    {
        name: 'Mocha Mousse',
        hex: '#A47764',
        description: 'A cor do ano 2026! Um marrom sofisticado e acolhedor.'
    },
    {
        name: 'Butter Yellow',
        hex: '#F8E473',
        description: 'Amarelo suave e elegante, muito versátil.'
    },
    {
        name: 'Cherry Red',
        hex: '#9B2335',
        description: 'Vermelho cereja vibrante e impactante.'
    },
    {
        name: 'Digital Lavender',
        hex: '#E6E6FA',
        description: 'Lavanda digital, o tom que domina o digital em 2026.'
    },
    {
        name: 'Emerald Depths',
        hex: '#046307',
        description: 'Verde esmeralda profundo para looks sofisticados.'
    },
    {
        name: 'Sunset Coral',
        hex: '#FF6F61',
        description: 'Coral vibrante que transmite energia.'
    }
];

// Tendências por estação
export const trendsByseason: Record<string, SeasonTrends> = {
    'Primavera': {
        colors: [
            { name: 'Butter Yellow', hex: '#F8E473', description: 'Perfeito para sua paleta clara e vibrante' },
            { name: 'Sunset Coral', hex: '#FF6F61', description: 'Coral que ilumina peles de primavera' },
            { name: 'Peach Fuzz', hex: '#FFBE98', description: 'Tom pêssego delicado e atual' }
        ],
        makeup: [
            { title: 'Blush Luminoso', description: 'Blushes líquidos em tons pêssego e coral estão em alta', icon: '🌸' },
            { title: 'Glow Natural', description: 'Pele luminosa e fresh, menos matte, mais dewy', icon: '✨' },
            { title: 'Lip Gloss Comeback', description: 'Glosses com cor voltam com tudo em 2026', icon: '💋' }
        ],
        hair: [
            { title: 'Honey Blonde', description: 'Loiros mel e dourados são a tendência do momento', icon: '🍯' },
            { title: 'Babylights', description: 'Mechas superfinas para efeito natural', icon: '✨' },
            { title: 'Soft Layers', description: 'Camadas suaves e movimento natural', icon: '💇' }
        ],
        accessories: [
            { title: 'Ouro Amarelo', description: 'Joias em ouro amarelo polido dominam 2026', icon: '💛' },
            { title: 'Pérolas Modernas', description: 'Pérolas em designs contemporâneos', icon: '🤍' },
            { title: 'Óculos Transparentes', description: 'Armações claras e tons mel', icon: '👓' }
        ]
    },
    'Verão': {
        colors: [
            { name: 'Digital Lavender', hex: '#E6E6FA', description: 'Lavanda digital perfeita para sua paleta suave' },
            { name: 'Powder Blue', hex: '#B0E0E6', description: 'Azul powder super atual e elegante' },
            { name: 'Rose Quartz', hex: '#F7CAC9', description: 'Rosa quartzo atemporal e sofisticado' }
        ],
        makeup: [
            { title: 'Soft Glam', description: 'Maquiagem suave com tons rosados e malva', icon: '🌷' },
            { title: 'Silver Chrome', description: 'Sombras prateadas e metálicas para a noite', icon: '✨' },
            { title: 'Berry Lips', description: 'Batons em tons berry e amora são hit', icon: '💜' }
        ],
        hair: [
            { title: 'Mushroom Blonde', description: 'Loiro acinzentado e sofisticado', icon: '🍄' },
            { title: 'Cool Brunette', description: 'Castanhos frios e elegantes', icon: '🤎' },
            { title: 'Glass Hair', description: 'Cabelos ultrabrilhantes e lisos', icon: '✨' }
        ],
        accessories: [
            { title: 'Prata Polida', description: 'Joias em prata são estrela para verão', icon: '🤍' },
            { title: 'Ouro Branco', description: 'Ouro branco para sofisticação máxima', icon: '💎' },
            { title: 'Madrepérola', description: 'Acessórios com madrepérola são tendência', icon: '🐚' }
        ]
    },
    'Outono': {
        colors: [
            { name: 'Mocha Mousse', hex: '#A47764', description: 'A COR DO ANO 2026! Perfeita para você.' },
            { name: 'Cherry Red', hex: '#9B2335', description: 'Vermelho cereja impactante para outono' },
            { name: 'Burnt Sienna', hex: '#E97451', description: 'Terracota queimado super atual' }
        ],
        makeup: [
            { title: 'Brown Smokey', description: 'Olhos esfumados em tons marrons dominam', icon: '🤎' },
            { title: 'Terracotta Blush', description: 'Blushes terracota para glow natural', icon: '🧱' },
            { title: 'Spice Lips', description: 'Batons em tons especiados como canela e tijolo', icon: '🌶️' }
        ],
        hair: [
            { title: 'Copper Renaissance', description: 'Ruivos acobreados são febre em 2026', icon: '🔶' },
            { title: 'Expensive Brunette', description: 'Castanhos ricos com reflexos dourados', icon: '✨' },
            { title: 'Curtain Bangs', description: 'Franja cortina segue forte', icon: '💇' }
        ],
        accessories: [
            { title: 'Bronze Age', description: 'Bronze e cobre são os metais do momento', icon: '🥉' },
            { title: 'Ouro Rose', description: 'Rose gold segue em alta para outono', icon: '🌹' },
            { title: 'Tortoiseshell', description: 'Acessórios tartaruga são must-have', icon: '🐢' }
        ]
    },
    'Inverno': {
        colors: [
            { name: 'Emerald Depths', hex: '#046307', description: 'Verde esmeralda intenso para sua paleta' },
            { name: 'True Red', hex: '#FF0000', description: 'Vermelho puro e impactante' },
            { name: 'Royal Blue', hex: '#4169E1', description: 'Azul royal clássico e elegante' }
        ],
        makeup: [
            { title: 'Sharp Liner', description: 'Delineados gráficos precisos são trend', icon: '✏️' },
            { title: 'Bold Lip', description: 'Batons vibrantes em vermelho e vinho', icon: '💄' },
            { title: 'Porcelain Skin', description: 'Pele perfeita e porcelanizada', icon: '✨' }
        ],
        hair: [
            { title: 'Blue Black', description: 'Preto azulado para máximo impacto', icon: '🖤' },
            { title: 'Platinum Ice', description: 'Platinado gelado super atual', icon: '❄️' },
            { title: 'Sleek Bob', description: 'Bob curtinho e elegante', icon: '💇' }
        ],
        accessories: [
            { title: 'Platinum Power', description: 'Platina e ouro branco dominam', icon: '💎' },
            { title: 'Statement Silver', description: 'Prata em peças statement', icon: '🪩' },
            { title: 'Crystal Clear', description: 'Cristais e strass em alta', icon: '💠' }
        ]
    }
};

// Tendências gerais de 2026 (para todos)
export const generalTrends2026 = {
    title: '🔥 Tendências 2026',
    subtitle: 'O que está em alta na moda e beleza este ano',
    highlights: [
        {
            icon: '🎨',
            title: 'Mocha Mousse é a Cor do Ano',
            description: 'O Pantone elegeu Mocha Mousse como cor de 2026. Um marrom aconchegante que funciona para todas as estações.'
        },
        {
            icon: '✨',
            title: 'Quiet Luxury',
            description: 'A tendência de luxo discreto continua: peças atemporais, tecidos nobres, menos logos.'
        },
        {
            icon: '💄',
            title: 'Clean Girl Aesthetic Evolui',
            description: 'A estética clean girl agora inclui mais cor: blush intenso, lábios glossy e pele dewy.'
        },
        {
            icon: '💇',
            title: 'Cabelos com Movimento',
            description: 'Cortes com camadas suaves e textura natural dominam os salões em 2026.'
        },
        {
            icon: '💎',
            title: 'Metais Misturados',
            description: 'Combinar ouro e prata não é mais tabu! A tendência é mix de metais com intenção.'
        }
    ]
};

// Função para obter tendências baseadas na estação
export function getTrendsForSeason(season: string): SeasonTrends | null {
    // Normalizar o nome da estação
    const normalizedSeason = season.split(' ')[0]; // "Outono Quente" -> "Outono"
    return trendsByseason[normalizedSeason] || null;
}
