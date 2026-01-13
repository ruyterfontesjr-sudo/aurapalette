// ============================================
// CONFIGURAÇÃO CENTRAL DO AURA PALETTE
// ============================================

export const config = {
    // Preços
    price: 47,
    currency: 'BRL',
    currencySymbol: 'R$',
    guaranteeDays: 7,

    // Prova Social (atualizar periodicamente)
    social: {
        weeklyAnalysisCount: 2847,
        totalUsers: 50000,
        averageRating: 4.9,
        totalReviews: 1847
    },

    // Analytics (configurar)
    analytics: {
        gtmId: process.env.NEXT_PUBLIC_GTM_ID || '',
        gaId: process.env.NEXT_PUBLIC_GA_ID || '',
    },

    // URLs
    urls: {
        website: 'https://aurapalette.com.br',
        instagram: 'https://instagram.com/aurapalette',
    },

    // Timer de urgência (minutos)
    urgencyTimer: {
        enabled: true,
        durationMinutes: 15
    }
};

// Depoimentos para prova social (expandido para carrossel)
export const testimonials = [
    {
        id: 1,
        name: 'Mariana S.',
        location: 'São Paulo, SP',
        rating: 5,
        text: 'Incrível! Descobri que sou Outono Quente e finalmente entendi porque alguns tons não combinavam comigo.'
    },
    {
        id: 2,
        name: 'Juliana M.',
        location: 'Rio de Janeiro, RJ',
        rating: 5,
        text: 'A análise de maquiagem me salvou! Gastava dinheiro em produtos errados. Agora sei exatamente o que comprar.'
    },
    {
        id: 3,
        name: 'Fernanda L.',
        location: 'Belo Horizonte, MG',
        rating: 5,
        text: 'As dicas de acessórios foram um divisor de águas. Nunca imaginei que dourado ficaria tão bem em mim!'
    },
    {
        id: 4,
        name: 'Camila R.',
        location: 'Curitiba, PR',
        rating: 5,
        text: 'Minha colorista confirmou tudo que o app disse. Super recomendo pra quem quer acertar nas cores!'
    },
    {
        id: 5,
        name: 'Beatriz A.',
        location: 'Salvador, BA',
        rating: 5,
        text: 'Fiz por curiosidade e estou impressionada! Meu guarda-roupa agora faz muito mais sentido.'
    },
    {
        id: 6,
        name: 'Larissa P.',
        location: 'Porto Alegre, RS',
        rating: 5,
        text: 'Valeu cada centavo! Aprendi cores que realçam minha pele e quais devo evitar. Transformador!'
    },
    {
        id: 7,
        name: 'Amanda C.',
        location: 'Brasília, DF',
        rating: 5,
        text: 'Descobri que sou Inverno Profundo. Agora compro roupas com muito mais confiança!'
    },
    {
        id: 8,
        name: 'Carolina T.',
        location: 'Recife, PE',
        rating: 5,
        text: 'O relatório é super completo! Dicas de maquiagem, cabelo, roupas... Adorei tudo!'
    },
    {
        id: 9,
        name: 'Isabela F.',
        location: 'Fortaleza, CE',
        rating: 5,
        text: 'Melhor investimento que fiz em mim mesma! As cores certas fazem toda diferença no visual.'
    },
    {
        id: 10,
        name: 'Priscila N.',
        location: 'Goiânia, GO',
        rating: 5,
        text: 'Indiquei pra todas as minhas amigas! A análise é precisa e as dicas são práticas demais.'
    },
    {
        id: 11,
        name: 'Rafaela M.',
        location: 'Florianópolis, SC',
        rating: 5,
        text: 'Finalmente entendi porque certas maquiagens não ficavam bem. Agora acerto sempre!'
    },
    {
        id: 12,
        name: 'Gabriela D.',
        location: 'Manaus, AM',
        rating: 5,
        text: 'A IA acertou em cheio! Sou Primavera Clara e as cores recomendadas são perfeitas.'
    }
];

// Fotos de mulheres brasileiras para depoimentos
export const testimonialPhotos = [
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&h=80&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=80&h=80&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=80&h=80&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&h=80&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=80&h=80&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=80&h=80&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=80&h=80&fit=crop&crop=face',
];

// FAQs para página de preview
export const faqs = [
    {
        question: 'A análise é realmente personalizada?',
        answer: 'Sim! Nossa IA analisa especificamente sua foto para determinar seu tom de pele, subtom e características únicas. Cada relatório é gerado individualmente.'
    },
    {
        question: 'Como funciona a garantia de 7 dias?',
        answer: 'Se você não ficar satisfeita com seu relatório por qualquer motivo, basta entrar em contato em até 7 dias e devolvemos 100% do valor, sem perguntas.'
    },
    {
        question: 'Posso pagar com PIX ou cartão?',
        answer: 'Sim! Aceitamos PIX, cartão de crédito (todas as bandeiras) e cartão de débito. O acesso é liberado imediatamente após a confirmação do pagamento.'
    },
    {
        question: 'O acesso é vitalício?',
        answer: 'Sim! Uma vez desbloqueado, você pode acessar seu relatório quantas vezes quiser, para sempre. Também receberá atualizações de tendências.'
    },
    {
        question: 'A análise funciona para todos os tons de pele?',
        answer: 'Absolutamente! Nossa IA foi treinada com diversidade, analisando com precisão todos os tons de pele, do mais claro ao mais escuro.'
    }
];
