'use client';

import { useEffect, useState } from 'react';
import styles from './page.module.css';
import Card from '@/components/Card';
import Logo from '@/components/Logo';
import Button from '@/components/Button';
import { getTrendsForSeason, generalTrends2026, type SeasonTrends } from '@/data/trends2026';

// ============================================
// INTERFACES EXPANDIDAS
// ============================================

interface MakeupDetails {
    overview: string;
    base: {
        undertone: string;
        finish: string;
        tips: string;
    };
    blush: {
        colors: string[];
        application: string;
    };
    lipstick: {
        dayColors: string[];
        nightColors: string[];
        finishes: string[];
        tips: string;
    };
    eyeshadow: {
        neutrals: string[];
        accents: string[];
        avoid: string[];
        tips: string;
    };
    eyeliner: {
        colors: string[];
        styles: string;
    };
    bronzer: {
        shade: string;
        application: string;
    };
    mascara: {
        color: string;
        tips: string;
    };
}

interface HairDetails {
    overview: string;
    coloring: {
        baseColors: string[];
        highlights: string[];
        avoid: string[];
        tips: string;
    };
    cuts: {
        recommended: string[];
        tips: string;
    };
    styling: {
        products: string[];
        techniques: string[];
    };
}

interface AccessoryDetails {
    overview: string;
    metals: {
        best: { name: string; hex: string }[];
        avoid: { name: string; hex: string }[];
        tips: string;
    };
    jewelry: {
        necklaces: string;
        earrings: string;
        bracelets: string;
        rings: string;
    };
    glasses: {
        frames: string[];
        colors: string[];
    };
    bags: {
        colors: string[];
        materials: string[];
    };
    scarves: {
        colors: string[];
        patterns: string[];
    };
    watches: {
        styles: string[];
        metals: string[];
    };
}

interface FashionDetails {
    overview: string;
    essentials: string[];
    fabrics: string[];
    patterns: string[];
    occasions: {
        casual: string;
        work: string;
        evening: string;
    };
}

interface FullAnalysis {
    summary: string;
    bestColors: { name: string; hex: string }[];
    avoidColors: { name: string; hex: string }[];
    makeup: MakeupDetails;
    hair: HairDetails;
    fashion: FashionDetails;
    accessories: AccessoryDetails;
    tips: {
        fashion: string;
        makeup: string;
        accessories: string;
        hair: string;
    };
}

interface AnalysisResult {
    temperature: string;
    undertone: string;
    season: string;
    contrast: string;
    fullAnalysis?: FullAnalysis;
}

// ============================================
// DADOS PADRÃO EXPANDIDOS
// ============================================

const getDefaultFullAnalysis = (season: string): FullAnalysis => ({
    summary: `Sua colorimetria indica que você é uma pessoa de estação ${season || 'Outono'}. Cores quentes e terrosas são suas melhores aliadas, trazendo luz e vitalidade ao seu visual.`,
    bestColors: [
        { name: 'Terracota', hex: '#E2725B' },
        { name: 'Mostarda', hex: '#FFDB58' },
        { name: 'Verde Oliva', hex: '#808000' },
        { name: 'Marrom Chocolate', hex: '#7B3F00' },
        { name: 'Laranja Queimado', hex: '#CC5500' },
        { name: 'Dourado', hex: '#FFD700' },
        { name: 'Coral', hex: '#FF7F50' },
        { name: 'Caramelo', hex: '#FFD59A' },
        { name: 'Vinho', hex: '#722F37' },
        { name: 'Bege Quente', hex: '#F5F5DC' },
        { name: 'Pêssego', hex: '#FFCBA4' },
        { name: 'Ferrugem', hex: '#B7410E' },
    ],
    avoidColors: [
        { name: 'Rosa Choque', hex: '#FF69B4' },
        { name: 'Azul Royal', hex: '#4169E1' },
        { name: 'Prata Puro', hex: '#C0C0C0' },
        { name: 'Fúcsia', hex: '#FF00FF' },
        { name: 'Branco Puro', hex: '#FFFFFF' },
    ],
    makeup: {
        overview: 'Para sua colorimetria quente, aposte em maquiagens com tons terrosos e dourados que realçam sua beleza natural.',
        base: {
            undertone: 'Amarelado ou Dourado',
            finish: 'Acetinado ou Luminoso',
            tips: 'Evite bases muito rosadas ou acinzentadas. Prefira fórmulas com partículas douradas sutis para um glow natural.'
        },
        blush: {
            colors: ['Pêssego', 'Coral', 'Terracota', 'Damasco', 'Bronze Rosado'],
            application: 'Aplique nas maçãs do rosto e esfume em direção às têmporas para um efeito sun-kissed.'
        },
        lipstick: {
            dayColors: ['Nude Pêssego', 'Coral Suave', 'Rose Terracota', 'Caramelo'],
            nightColors: ['Vermelho Tijolo', 'Vinho', 'Terracota Escuro', 'Marrom Avermelhado'],
            finishes: ['Acetinado', 'Cremoso', 'Gloss com Fundo Dourado'],
            tips: 'Evite tonalidades muito rosadas frias ou roxas. Prefira batons com undertone laranja ou marrom.'
        },
        eyeshadow: {
            neutrals: ['Bege Dourado', 'Champagne', 'Cobre', 'Bronze', 'Marrom Quente'],
            accents: ['Verde Oliva', 'Terracota', 'Dourado Intenso', 'Laranja Queimado'],
            avoid: ['Prata', 'Cinza Frio', 'Rosa Frio', 'Preto Intenso'],
            tips: 'Sombras metálicas douradas e acobreadas iluminam seu olhar. Use tons terrosos no côncavo para profundidade.'
        },
        eyeliner: {
            colors: ['Marrom Escuro', 'Bronze', 'Cobre', 'Verde Musgo'],
            styles: 'Linhas esfumadas ficam mais harmônicas que traços gráficos muito marcados. Considere delineadores em gel marrom.'
        },
        bronzer: {
            shade: 'Tom quente com subtom terracota ou dourado',
            application: 'Aplique em formato 3 (testa, maçãs e queixo) para um contorno natural e aquecido.'
        },
        mascara: {
            color: 'Preto ou Marrom Escuro',
            tips: 'Máscaras marrom-avermelhadas suavizam o olhar e são perfeitas para o dia.'
        }
    },
    hair: {
        overview: 'Tons quentes e luminosos valorizam seu visual, trazendo vida e movimento para os fios.',
        coloring: {
            baseColors: ['Castanho Dourado', 'Castanho Acobreado', 'Loiro Mel', 'Ruivo Natural', 'Chocolate Quente'],
            highlights: ['Caramelo', 'Mel', 'Cobre', 'Acobreado', 'Dourado', 'Bronze'],
            avoid: ['Loiro Platinado', 'Preto Azulado', 'Castanho Acinzentado', 'Tons Acinzentados'],
            tips: 'Mechas babylights em tons de mel e caramelo criam profundidade e luminosidade. Evite cores muito frias ou acinzentadas.'
        },
        cuts: {
            recommended: ['Camadas suaves para movimento', 'Long bob com pontas texturizadas', 'Franja cortina', 'Cortes que emolduram o rosto'],
            tips: 'Cortes com movimento favorecem seu tipo, evitando linhas muito retas e rígidas.'
        },
        styling: {
            products: ['Óleo de argan para brilho', 'Leave-in com proteção térmica', 'Spray de sal marinho para textura', 'Sérum iluminador'],
            techniques: ['Ondas naturais com babyliss', 'Escova modeladora', 'Secagem com difusor', 'Beach waves']
        }
    },
    fashion: {
        overview: 'Seu guarda-roupa ideal é composto por tons terrosos, quentes e naturais que transmitem sofisticação e autenticidade.',
        essentials: [
            'Blazer caramelo ou terracota',
            'Calça de alfaiataria em bege ou marrom',
            'Vestido midi em tons terrosos',
            'Camisa de seda em tons quentes',
            'Jeans em lavagem escura ou média',
            'Suéter mostarda ou laranja queimado'
        ],
        fabrics: ['Linho', 'Algodão', 'Seda', 'Cashmere', 'Veludo', 'Couro natural'],
        patterns: ['Listras em tons quentes', 'Animal print', 'Florais em tons terrosos', 'Xadrez em tons quentes', 'Geométricos em tons neutros quentes'],
        occasions: {
            casual: 'Combine jeans com blusas em tons terrosos e acessórios dourados. Tênis brancos ou botas caramelo completam.',
            work: 'Alfaiataria em bege, caramelo ou marrom chocolate. Camisas em tons neutros quentes e acessórios discretos.',
            evening: 'Vestidos em tons de vinho, terracota ou dourado. Tecidos com brilho sutil e joias statement em ouro.'
        }
    },
    accessories: {
        overview: 'Metais quentes como dourado e rose gold são seus maiores aliados, trazendo luminosidade e harmonia.',
        metals: {
            best: [
                { name: 'Dourado', hex: '#FFD700' },
                { name: 'Rose Gold', hex: '#B76E79' },
                { name: 'Bronze', hex: '#CD7F32' },
                { name: 'Cobre', hex: '#B87333' },
                { name: 'Champagne', hex: '#F7E7CE' },
                { name: 'Ouro Velho', hex: '#CFB53B' }
            ],
            avoid: [
                { name: 'Prata Puro', hex: '#C0C0C0' },
                { name: 'Prata Polido', hex: '#E8E8E8' },
                { name: 'Ródio', hex: '#D3D3D3' }
            ],
            tips: 'Se você ama prata, opte por peças em ouro branco ou champagne, que são mais quentes que a prata pura.'
        },
        jewelry: {
            necklaces: 'Correntes em ouro, gargantilhas com pedras âmbar, citrino ou coral. Colares longos em camadas.',
            earrings: 'Argolas douradas, brincos com pedras em tons terrosos (âmbar, topázio, cornalina). Evite prata muito brilhante.',
            bracelets: 'Pulseiras em ouro, braceletes em cobre ou bronze. Pulseiras com pedras naturais em tons quentes.',
            rings: 'Anéis em ouro amarelo ou rose gold. Pedras como citrino, topázio imperial, olho de tigre e coral.'
        },
        glasses: {
            frames: ['Tartaruga', 'Marrom', 'Dourado', 'Caramelo', 'Havana'],
            colors: ['Tons terrosos', 'Dourado fosco', 'Verde oliva', 'Coral', 'Laranja queimado']
        },
        bags: {
            colors: ['Caramelo', 'Marrom Chocolate', 'Bege', 'Terracota', 'Mostarda', 'Vinho'],
            materials: ['Couro natural', 'Camurça', 'Palha', 'Ráfia', 'Couro vegano texturizado']
        },
        scarves: {
            colors: ['Terracota', 'Mostarda', 'Verde Oliva', 'Coral', 'Creme', 'Caramelo'],
            patterns: ['Animal print', 'Paisley', 'Florais quentes', 'Geométricos em tons terrosos']
        },
        watches: {
            styles: ['Clássico', 'Minimalista', 'Vintage'],
            metals: ['Ouro', 'Rose Gold', 'Bronze', 'Pulseiras de couro marrom']
        }
    },
    tips: {
        fashion: 'Invista em peças em tons terrosos e quentes. Jeans em lavagem escura combina muito com você.',
        makeup: 'Prefira bases com subtom amarelado. Batons em tons de nude pêssego e coral ficam lindos.',
        accessories: 'Joias douradas realçam sua beleza. Óculos em tons marrons ou tartaruga são ideais.',
        hair: 'Mechas em tons de caramelo, mel ou cobre valorizam seu visual.',
    },
});

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function ResultPage() {
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
    const [userName, setUserName] = useState('');
    const [seasonTrends, setSeasonTrends] = useState<SeasonTrends | null>(null);

    useEffect(() => {
        // Ensure body is scrollable and scroll to top
        document.body.style.overflow = '';
        window.scrollTo({ top: 0, behavior: 'instant' });

        const storedAnalysis = localStorage.getItem('aurapalette_analysis');
        const storedUser = localStorage.getItem('aurapalette_user');

        if (storedAnalysis) {
            const parsed = JSON.parse(storedAnalysis);

            if (!parsed.fullAnalysis || !parsed.fullAnalysis.makeup?.base) {
                parsed.fullAnalysis = getDefaultFullAnalysis(parsed.season);
            }

            setAnalysis(parsed);

            const trends = getTrendsForSeason(parsed.season);
            setSeasonTrends(trends);
        }

        if (storedUser) {
            const user = JSON.parse(storedUser);
            setUserName(user.name);
        }
    }, []);

    const handleDownload = async () => {
        if (!analysis?.fullAnalysis) return;
        const fa = analysis.fullAnalysis;

        const { jsPDF } = await import('jspdf');
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 20;
        const contentWidth = pageWidth - margin * 2;
        let y = 25;

        const textDark: [number, number, number] = [40, 40, 40];
        const textGray: [number, number, number] = [100, 100, 100];

        // Helper: check new page
        const checkNewPage = () => {
            if (y > pageHeight - 25) {
                doc.addPage();
                y = 25;
            }
        };

        // Helper: add title
        const addTitle = (text: string) => {
            checkNewPage();
            y += 8;
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(80, 40, 120);
            doc.text(text, margin, y);
            y += 8;
        };

        // Helper: add subtitle
        const addSubtitle = (text: string) => {
            checkNewPage();
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...textDark);
            doc.text(text, margin, y);
            y += 6;
        };

        // Helper: add paragraph
        const addParagraph = (text: string) => {
            checkNewPage();
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...textDark);
            const lines = doc.splitTextToSize(text, contentWidth);
            doc.text(lines, margin, y);
            y += lines.length * 5 + 2;
        };

        // Helper: add bullet item
        const addBullet = (label: string, value: string) => {
            checkNewPage();
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...textDark);
            doc.text(`• ${label}:`, margin, y);
            doc.setFont('helvetica', 'normal');
            const lines = doc.splitTextToSize(value, contentWidth - 40);
            doc.text(lines, margin + 40, y);
            y += Math.max(lines.length * 5, 5) + 1;
        };

        // Helper: add simple list
        const addList = (items: string[]) => {
            items.forEach(item => {
                checkNewPage();
                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(...textDark);
                const lines = doc.splitTextToSize(`• ${item}`, contentWidth);
                doc.text(lines, margin, y);
                y += lines.length * 5;
            });
            y += 2;
        };

        // ========== HEADER ==========
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(80, 40, 120);
        doc.text('Aura Palette', pageWidth / 2, y, { align: 'center' });
        y += 8;

        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...textGray);
        doc.text('Relatório de Colorimetria Pessoal', pageWidth / 2, y, { align: 'center' });
        y += 12;

        // Divider
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, y, pageWidth - margin, y);
        y += 10;

        // User info
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...textDark);
        doc.text(`Nome: ${userName}`, margin, y);
        y += 10;

        // ========== RESULTADO ==========
        addTitle('RESULTADO DA ANÁLISE');
        addBullet('Estação', analysis.season);
        addBullet('Temperatura', analysis.temperature);
        addBullet('Subtom', analysis.undertone);
        addBullet('Contraste', analysis.contrast);
        y += 3;
        addParagraph(fa.summary);

        // ========== MELHORES CORES ==========
        addTitle('SUAS MELHORES CORES');
        addList(fa.bestColors.map(c => `${c.name} (${c.hex})`));

        // ========== CORES A EVITAR ==========
        addTitle('CORES A EVITAR');
        addList(fa.avoidColors.map(c => `${c.name} (${c.hex})`));

        // ========== GUIA DE MAQUIAGEM ==========
        addTitle('GUIA DE MAQUIAGEM');
        addParagraph(fa.makeup.overview);

        addSubtitle('Base');
        addBullet('Subtom', fa.makeup.base.undertone);
        addBullet('Acabamento', fa.makeup.base.finish);
        addParagraph(`Dica: ${fa.makeup.base.tips}`);

        addSubtitle('Blush');
        addBullet('Cores', fa.makeup.blush.colors.join(', '));
        addParagraph(`Aplicação: ${fa.makeup.blush.application}`);

        addSubtitle('Batom');
        addBullet('Dia', fa.makeup.lipstick.dayColors.join(', '));
        addBullet('Noite', fa.makeup.lipstick.nightColors.join(', '));
        addBullet('Acabamentos', fa.makeup.lipstick.finishes.join(', '));
        addParagraph(`Dica: ${fa.makeup.lipstick.tips}`);

        addSubtitle('Sombras');
        addBullet('Neutras', fa.makeup.eyeshadow.neutrals.join(', '));
        addBullet('Destaque', fa.makeup.eyeshadow.accents.join(', '));
        addBullet('Evitar', fa.makeup.eyeshadow.avoid.join(', '));
        addParagraph(`Dica: ${fa.makeup.eyeshadow.tips}`);

        addSubtitle('Delineador');
        addBullet('Cores', fa.makeup.eyeliner.colors.join(', '));
        addParagraph(`Estilo: ${fa.makeup.eyeliner.styles}`);

        addSubtitle('Bronzer');
        addBullet('Tom', fa.makeup.bronzer.shade);
        addParagraph(`Aplicação: ${fa.makeup.bronzer.application}`);

        // ========== GUIA DE CABELOS ==========
        addTitle('GUIA DE CABELOS');
        addParagraph(fa.hair.overview);

        addSubtitle('Coloração');
        addBullet('Cores base', fa.hair.coloring.baseColors.join(', '));
        addBullet('Mechas/Luzes', fa.hair.coloring.highlights.join(', '));
        addBullet('Evitar', fa.hair.coloring.avoid.join(', '));
        addParagraph(`Dica: ${fa.hair.coloring.tips}`);

        addSubtitle('Cortes Recomendados');
        addList(fa.hair.cuts.recommended);
        addParagraph(`Dica: ${fa.hair.cuts.tips}`);

        addSubtitle('Styling');
        addBullet('Produtos', fa.hair.styling.products.join(', '));
        addBullet('Técnicas', fa.hair.styling.techniques.join(', '));

        // ========== GUIA DE ACESSÓRIOS ==========
        addTitle('GUIA DE ACESSÓRIOS');
        addParagraph(fa.accessories.overview);

        addSubtitle('Metais');
        addBullet('Ideais', fa.accessories.metals.best.map(m => m.name).join(', '));
        addBullet('Evitar', fa.accessories.metals.avoid.map(m => m.name).join(', '));
        addParagraph(`Dica: ${fa.accessories.metals.tips}`);

        addSubtitle('Joias');
        addBullet('Colares', fa.accessories.jewelry.necklaces);
        addBullet('Brincos', fa.accessories.jewelry.earrings);
        addBullet('Pulseiras', fa.accessories.jewelry.bracelets);
        addBullet('Anéis', fa.accessories.jewelry.rings);

        addSubtitle('Óculos');
        addBullet('Armações', fa.accessories.glasses.frames.join(', '));
        addBullet('Cores', fa.accessories.glasses.colors.join(', '));

        addSubtitle('Bolsas');
        addBullet('Cores', fa.accessories.bags.colors.join(', '));
        addBullet('Materiais', fa.accessories.bags.materials.join(', '));

        addSubtitle('Lenços e Echarpes');
        addBullet('Cores', fa.accessories.scarves.colors.join(', '));
        addBullet('Estampas', fa.accessories.scarves.patterns.join(', '));

        addSubtitle('Relógios');
        addBullet('Estilos', fa.accessories.watches.styles.join(', '));
        addBullet('Metais', fa.accessories.watches.metals.join(', '));

        // ========== GUIA DE MODA ==========
        addTitle('GUIA DE MODA');
        addParagraph(fa.fashion.overview);

        addSubtitle('Peças Essenciais');
        addList(fa.fashion.essentials);

        addSubtitle('Tecidos Ideais');
        addList(fa.fashion.fabrics);

        addSubtitle('Estampas');
        addList(fa.fashion.patterns);

        addSubtitle('Looks por Ocasião');
        addBullet('Casual', fa.fashion.occasions.casual);
        addBullet('Trabalho', fa.fashion.occasions.work);
        addBullet('Noite', fa.fashion.occasions.evening);

        // ========== DICAS RÁPIDAS ==========
        addTitle('DICAS RÁPIDAS');
        addBullet('Moda', fa.tips.fashion);
        addBullet('Maquiagem', fa.tips.makeup);
        addBullet('Acessórios', fa.tips.accessories);
        addBullet('Cabelo', fa.tips.hair);

        // ========== FOOTER ==========
        const totalPages = doc.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text(`Aura Palette - Página ${i} de ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
        }

        doc.save(`aura-palette-${userName.toLowerCase().replace(/\s+/g, '-')}.pdf`);
    };

    if (!analysis) {
        return (
            <main className={styles.page}>
                <div className={styles.orbPrimary} />
                <div className={styles.orbSecondary} />
                <div className={styles.container}>
                    <div className={styles.header}>
                        <Logo />
                    </div>
                    <p>Carregando...</p>
                </div>
            </main>
        );
    }

    const fa = analysis.fullAnalysis;

    return (
        <main className={styles.page}>
            <div className={styles.orbPrimary} />
            <div className={styles.orbSecondary} />

            <div className={styles.container}>
                <div className={styles.header}>
                    <Logo />
                </div>

                {/* Hero */}
                <div className={styles.hero}>
                    <div className={styles.badge}>
                        <span className={styles.badgeIcon}>✓</span>
                        Pagamento confirmado
                    </div>
                    <h1 className={styles.title}>
                        {userName ? `${userName}, ` : ''}seu relatório está pronto!
                    </h1>
                    <p className={styles.subtitle}>
                        Confira sua análise de colorimetria completa e personalizada
                    </p>
                </div>

                {/* Season Card */}
                <Card className={styles.seasonCard}>
                    <div className={styles.seasonBadge}>
                        {analysis.season}
                    </div>
                    <p className={styles.seasonDescription}>
                        {fa?.summary}
                    </p>
                </Card>

                {/* Stats Grid */}
                <div className={styles.statsGrid}>
                    <Card className={styles.statCard}>
                        <div className={styles.statIconSvg}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M12 2a2 2 0 012 2v8.5a4 4 0 11-4 0V4a2 2 0 012-2z" stroke="url(#tempGrad)" strokeWidth="2" fill="none" />
                                <defs><linearGradient id="tempGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#F59E0B" /><stop offset="100%" stopColor="#EF4444" /></linearGradient></defs>
                            </svg>
                        </div>
                        <p className={styles.statLabel}>Temperatura</p>
                        <p className={styles.statValue}>{analysis.temperature}</p>
                    </Card>
                    <Card className={styles.statCard}>
                        <div className={styles.statIconSvg}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="8" stroke="url(#subGrad)" strokeWidth="2" fill="none" />
                                <circle cx="12" cy="12" r="3" fill="url(#subGrad)" />
                                <defs><linearGradient id="subGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#8B5CF6" /><stop offset="100%" stopColor="#EC4899" /></linearGradient></defs>
                            </svg>
                        </div>
                        <p className={styles.statLabel}>Subtom</p>
                        <p className={styles.statValue}>{analysis.undertone}</p>
                    </Card>
                    <Card className={styles.statCard}>
                        <div className={styles.statIconSvg}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M12 3l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6l2-6z" fill="url(#seasonGrad)" />
                                <defs><linearGradient id="seasonGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#F59E0B" /><stop offset="100%" stopColor="#D97706" /></linearGradient></defs>
                            </svg>
                        </div>
                        <p className={styles.statLabel}>Estação</p>
                        <p className={styles.statValue}>{analysis.season}</p>
                    </Card>
                    <Card className={styles.statCard}>
                        <div className={styles.statIconSvg}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <circle cx="8" cy="12" r="5" stroke="url(#contGrad)" strokeWidth="2" fill="none" />
                                <circle cx="16" cy="12" r="5" stroke="url(#contGrad)" strokeWidth="2" fill="none" />
                                <defs><linearGradient id="contGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#8B5CF6" /><stop offset="100%" stopColor="#EC4899" /></linearGradient></defs>
                            </svg>
                        </div>
                        <p className={styles.statLabel}>Contraste</p>
                        <p className={styles.statValue}>{analysis.contrast}</p>
                    </Card>
                </div>

                {/* Best Colors */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        <span className={styles.sectionIcon}>🎨</span>
                        Suas Melhores Cores
                    </h2>
                    <div className={styles.palette}>
                        {fa?.bestColors.map((color, index) => (
                            <div
                                key={index}
                                className={styles.colorCard}
                                style={{ backgroundColor: color.hex }}
                            >
                                <span className={styles.colorName}>{color.name}</span>
                                <span className={styles.colorHex}>{color.hex}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Avoid Colors */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        <span className={styles.sectionIcon}>🚫</span>
                        Cores a Evitar
                    </h2>
                    <div className={styles.avoidPalette}>
                        {fa?.avoidColors.map((color, index) => (
                            <div key={index} className={styles.avoidCard}>
                                <div
                                    className={styles.avoidSwatch}
                                    style={{ backgroundColor: color.hex }}
                                />
                                <span className={styles.avoidName}>{color.name}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ============================================ */}
                {/* SEÇÃO: MAQUIAGEM - SEMPRE ABERTA */}
                {/* ============================================ */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        <span className={styles.sectionIcon}>💄</span>
                        Guia Completo de Maquiagem
                    </h2>

                    <Card className={styles.overviewCard}>
                        <p className={styles.overviewText}>{fa?.makeup.overview}</p>
                    </Card>

                    <div className={styles.detailsGrid}>
                        {/* Base */}
                        <Card className={styles.detailCard}>
                            <div className={styles.detailHeader}>
                                <span className={styles.detailIcon}>🎨</span>
                                <h4 className={styles.detailTitle}>Base</h4>
                            </div>
                            <div className={styles.detailContent}>
                                <p><strong>Subtom:</strong> {fa?.makeup.base.undertone}</p>
                                <p><strong>Acabamento:</strong> {fa?.makeup.base.finish}</p>
                                <p className={styles.detailTip}>💡 {fa?.makeup.base.tips}</p>
                            </div>
                        </Card>

                        {/* Blush */}
                        <Card className={styles.detailCard}>
                            <div className={styles.detailHeader}>
                                <span className={styles.detailIcon}>🌸</span>
                                <h4 className={styles.detailTitle}>Blush</h4>
                            </div>
                            <div className={styles.detailContent}>
                                <p><strong>Cores:</strong></p>
                                <div className={styles.tagList}>
                                    {fa?.makeup.blush.colors.map((color, i) => (
                                        <span key={i} className={styles.tag}>{color}</span>
                                    ))}
                                </div>
                                <p className={styles.detailTip}>💡 {fa?.makeup.blush.application}</p>
                            </div>
                        </Card>

                        {/* Batom */}
                        <Card className={styles.detailCard}>
                            <div className={styles.detailHeader}>
                                <span className={styles.detailIcon}>💋</span>
                                <h4 className={styles.detailTitle}>Batom</h4>
                            </div>
                            <div className={styles.detailContent}>
                                <p><strong>Cores para o dia:</strong></p>
                                <div className={styles.tagList}>
                                    {fa?.makeup.lipstick.dayColors.map((color, i) => (
                                        <span key={i} className={styles.tag}>{color}</span>
                                    ))}
                                </div>
                                <p><strong>Cores para a noite:</strong></p>
                                <div className={styles.tagList}>
                                    {fa?.makeup.lipstick.nightColors.map((color, i) => (
                                        <span key={i} className={styles.tagDark}>{color}</span>
                                    ))}
                                </div>
                                <p><strong>Acabamentos:</strong> {fa?.makeup.lipstick.finishes.join(', ')}</p>
                                <p className={styles.detailTip}>💡 {fa?.makeup.lipstick.tips}</p>
                            </div>
                        </Card>

                        {/* Sombras */}
                        <Card className={styles.detailCard}>
                            <div className={styles.detailHeader}>
                                <span className={styles.detailIcon}>👁️</span>
                                <h4 className={styles.detailTitle}>Sombras</h4>
                            </div>
                            <div className={styles.detailContent}>
                                <p><strong>Tons neutros:</strong></p>
                                <div className={styles.tagList}>
                                    {fa?.makeup.eyeshadow.neutrals.map((color, i) => (
                                        <span key={i} className={styles.tag}>{color}</span>
                                    ))}
                                </div>
                                <p><strong>Cores de destaque:</strong></p>
                                <div className={styles.tagList}>
                                    {fa?.makeup.eyeshadow.accents.map((color, i) => (
                                        <span key={i} className={styles.tagAccent}>{color}</span>
                                    ))}
                                </div>
                                <p><strong>Evitar:</strong></p>
                                <div className={styles.tagList}>
                                    {fa?.makeup.eyeshadow.avoid.map((color, i) => (
                                        <span key={i} className={styles.tagAvoid}>{color}</span>
                                    ))}
                                </div>
                                <p className={styles.detailTip}>💡 {fa?.makeup.eyeshadow.tips}</p>
                            </div>
                        </Card>

                        {/* Delineador */}
                        <Card className={styles.detailCard}>
                            <div className={styles.detailHeader}>
                                <span className={styles.detailIcon}>✏️</span>
                                <h4 className={styles.detailTitle}>Delineador</h4>
                            </div>
                            <div className={styles.detailContent}>
                                <p><strong>Cores:</strong></p>
                                <div className={styles.tagList}>
                                    {fa?.makeup.eyeliner.colors.map((color, i) => (
                                        <span key={i} className={styles.tag}>{color}</span>
                                    ))}
                                </div>
                                <p className={styles.detailTip}>💡 {fa?.makeup.eyeliner.styles}</p>
                            </div>
                        </Card>

                        {/* Bronzer */}
                        <Card className={styles.detailCard}>
                            <div className={styles.detailHeader}>
                                <span className={styles.detailIcon}>☀️</span>
                                <h4 className={styles.detailTitle}>Bronzer</h4>
                            </div>
                            <div className={styles.detailContent}>
                                <p><strong>Tom:</strong> {fa?.makeup.bronzer.shade}</p>
                                <p className={styles.detailTip}>💡 {fa?.makeup.bronzer.application}</p>
                            </div>
                        </Card>
                    </div>
                </section>

                {/* ============================================ */}
                {/* SEÇÃO: CABELOS - SEMPRE ABERTA */}
                {/* ============================================ */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        <span className={styles.sectionIcon}>💇</span>
                        Guia Completo de Cabelos
                    </h2>

                    <Card className={styles.overviewCard}>
                        <p className={styles.overviewText}>{fa?.hair.overview}</p>
                    </Card>

                    <div className={styles.detailsGrid}>
                        {/* Coloração */}
                        <Card className={styles.detailCard}>
                            <div className={styles.detailHeader}>
                                <span className={styles.detailIcon}>🎨</span>
                                <h4 className={styles.detailTitle}>Coloração</h4>
                            </div>
                            <div className={styles.detailContent}>
                                <p><strong>Cores base ideais:</strong></p>
                                <div className={styles.tagList}>
                                    {fa?.hair.coloring.baseColors.map((color, i) => (
                                        <span key={i} className={styles.tag}>{color}</span>
                                    ))}
                                </div>
                                <p><strong>Mechas e luzes:</strong></p>
                                <div className={styles.tagList}>
                                    {fa?.hair.coloring.highlights.map((color, i) => (
                                        <span key={i} className={styles.tagAccent}>{color}</span>
                                    ))}
                                </div>
                                <p><strong>Evitar:</strong></p>
                                <div className={styles.tagList}>
                                    {fa?.hair.coloring.avoid.map((color, i) => (
                                        <span key={i} className={styles.tagAvoid}>{color}</span>
                                    ))}
                                </div>
                                <p className={styles.detailTip}>💡 {fa?.hair.coloring.tips}</p>
                            </div>
                        </Card>

                        {/* Cortes */}
                        <Card className={styles.detailCard}>
                            <div className={styles.detailHeader}>
                                <span className={styles.detailIcon}>✂️</span>
                                <h4 className={styles.detailTitle}>Cortes</h4>
                            </div>
                            <div className={styles.detailContent}>
                                <p><strong>Recomendados:</strong></p>
                                <div className={styles.tagList}>
                                    {fa?.hair.cuts.recommended.map((cut, i) => (
                                        <span key={i} className={styles.tag}>{cut}</span>
                                    ))}
                                </div>
                                <p className={styles.detailTip}>💡 {fa?.hair.cuts.tips}</p>
                            </div>
                        </Card>

                        {/* Styling */}
                        <Card className={styles.detailCard}>
                            <div className={styles.detailHeader}>
                                <span className={styles.detailIcon}>💫</span>
                                <h4 className={styles.detailTitle}>Styling</h4>
                            </div>
                            <div className={styles.detailContent}>
                                <p><strong>Produtos recomendados:</strong></p>
                                <div className={styles.tagList}>
                                    {fa?.hair.styling.products.map((product, i) => (
                                        <span key={i} className={styles.tag}>{product}</span>
                                    ))}
                                </div>
                                <p><strong>Técnicas:</strong></p>
                                <div className={styles.tagList}>
                                    {fa?.hair.styling.techniques.map((tech, i) => (
                                        <span key={i} className={styles.tagAccent}>{tech}</span>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    </div>
                </section>

                {/* ============================================ */}
                {/* SEÇÃO: ACESSÓRIOS - SEMPRE ABERTA */}
                {/* ============================================ */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        <span className={styles.sectionIcon}>💎</span>
                        Guia Completo de Acessórios
                    </h2>

                    <Card className={styles.overviewCard}>
                        <p className={styles.overviewText}>{fa?.accessories.overview}</p>
                    </Card>

                    {/* Metais - Destaque especial */}
                    <Card className={styles.metalsCard}>
                        <h3 className={styles.metalsTitle}>
                            <span>✨</span> Seus Metais Ideais
                        </h3>
                        <div className={styles.metalsPalette}>
                            {fa?.accessories.metals.best.map((metal, i) => (
                                <div
                                    key={i}
                                    className={styles.metalSwatch}
                                    style={{
                                        background: `linear-gradient(145deg, ${metal.hex}, ${adjustBrightness(metal.hex, -20)})`,
                                    }}
                                >
                                    <span className={styles.metalName}>{metal.name}</span>
                                </div>
                            ))}
                        </div>
                        <div className={styles.metalsAvoid}>
                            <p><strong>Evitar:</strong></p>
                            <div className={styles.avoidPalette}>
                                {fa?.accessories.metals.avoid.map((metal, i) => (
                                    <div key={i} className={styles.avoidCard}>
                                        <div
                                            className={styles.avoidSwatch}
                                            style={{ backgroundColor: metal.hex }}
                                        />
                                        <span className={styles.avoidName}>{metal.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <p className={styles.detailTip}>💡 {fa?.accessories.metals.tips}</p>
                    </Card>

                    <div className={styles.detailsGrid}>
                        {/* Joias */}
                        <Card className={styles.detailCard}>
                            <div className={styles.detailHeader}>
                                <span className={styles.detailIcon}>💍</span>
                                <h4 className={styles.detailTitle}>Joias</h4>
                            </div>
                            <div className={styles.detailContent}>
                                <p><strong>Colares:</strong> {fa?.accessories.jewelry.necklaces}</p>
                                <p><strong>Brincos:</strong> {fa?.accessories.jewelry.earrings}</p>
                                <p><strong>Pulseiras:</strong> {fa?.accessories.jewelry.bracelets}</p>
                                <p><strong>Anéis:</strong> {fa?.accessories.jewelry.rings}</p>
                            </div>
                        </Card>

                        {/* Óculos */}
                        <Card className={styles.detailCard}>
                            <div className={styles.detailHeader}>
                                <span className={styles.detailIcon}>👓</span>
                                <h4 className={styles.detailTitle}>Óculos</h4>
                            </div>
                            <div className={styles.detailContent}>
                                <p><strong>Armações:</strong></p>
                                <div className={styles.tagList}>
                                    {fa?.accessories.glasses.frames.map((frame, i) => (
                                        <span key={i} className={styles.tag}>{frame}</span>
                                    ))}
                                </div>
                                <p><strong>Cores:</strong></p>
                                <div className={styles.tagList}>
                                    {fa?.accessories.glasses.colors.map((color, i) => (
                                        <span key={i} className={styles.tagAccent}>{color}</span>
                                    ))}
                                </div>
                            </div>
                        </Card>

                        {/* Bolsas */}
                        <Card className={styles.detailCard}>
                            <div className={styles.detailHeader}>
                                <span className={styles.detailIcon}>👜</span>
                                <h4 className={styles.detailTitle}>Bolsas</h4>
                            </div>
                            <div className={styles.detailContent}>
                                <p><strong>Cores:</strong></p>
                                <div className={styles.tagList}>
                                    {fa?.accessories.bags.colors.map((color, i) => (
                                        <span key={i} className={styles.tag}>{color}</span>
                                    ))}
                                </div>
                                <p><strong>Materiais:</strong></p>
                                <div className={styles.tagList}>
                                    {fa?.accessories.bags.materials.map((material, i) => (
                                        <span key={i} className={styles.tagAccent}>{material}</span>
                                    ))}
                                </div>
                            </div>
                        </Card>

                        {/* Lenços */}
                        <Card className={styles.detailCard}>
                            <div className={styles.detailHeader}>
                                <span className={styles.detailIcon}>🧣</span>
                                <h4 className={styles.detailTitle}>Lenços e Echarpes</h4>
                            </div>
                            <div className={styles.detailContent}>
                                <p><strong>Cores:</strong></p>
                                <div className={styles.tagList}>
                                    {fa?.accessories.scarves.colors.map((color, i) => (
                                        <span key={i} className={styles.tag}>{color}</span>
                                    ))}
                                </div>
                                <p><strong>Estampas:</strong></p>
                                <div className={styles.tagList}>
                                    {fa?.accessories.scarves.patterns.map((pattern, i) => (
                                        <span key={i} className={styles.tagAccent}>{pattern}</span>
                                    ))}
                                </div>
                            </div>
                        </Card>

                        {/* Relógios */}
                        <Card className={styles.detailCard}>
                            <div className={styles.detailHeader}>
                                <span className={styles.detailIcon}>⌚</span>
                                <h4 className={styles.detailTitle}>Relógios</h4>
                            </div>
                            <div className={styles.detailContent}>
                                <p><strong>Estilos:</strong></p>
                                <div className={styles.tagList}>
                                    {fa?.accessories.watches.styles.map((style, i) => (
                                        <span key={i} className={styles.tag}>{style}</span>
                                    ))}
                                </div>
                                <p><strong>Metais:</strong></p>
                                <div className={styles.tagList}>
                                    {fa?.accessories.watches.metals.map((metal, i) => (
                                        <span key={i} className={styles.tagAccent}>{metal}</span>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    </div>
                </section>

                {/* ============================================ */}
                {/* SEÇÃO: MODA - SEMPRE ABERTA */}
                {/* ============================================ */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        <span className={styles.sectionIcon}>👗</span>
                        Guia Completo de Moda
                    </h2>

                    <Card className={styles.overviewCard}>
                        <p className={styles.overviewText}>{fa?.fashion.overview}</p>
                    </Card>

                    <div className={styles.detailsGrid}>
                        {/* Peças Essenciais */}
                        <Card className={styles.detailCard}>
                            <div className={styles.detailHeader}>
                                <span className={styles.detailIcon}>👚</span>
                                <h4 className={styles.detailTitle}>Peças Essenciais</h4>
                            </div>
                            <div className={styles.detailContent}>
                                <ul className={styles.essentialsList}>
                                    {fa?.fashion.essentials.map((item, i) => (
                                        <li key={i}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                        </Card>

                        {/* Tecidos */}
                        <Card className={styles.detailCard}>
                            <div className={styles.detailHeader}>
                                <span className={styles.detailIcon}>🧵</span>
                                <h4 className={styles.detailTitle}>Tecidos Ideais</h4>
                            </div>
                            <div className={styles.detailContent}>
                                <div className={styles.tagList}>
                                    {fa?.fashion.fabrics.map((fabric, i) => (
                                        <span key={i} className={styles.tag}>{fabric}</span>
                                    ))}
                                </div>
                            </div>
                        </Card>

                        {/* Estampas */}
                        <Card className={styles.detailCard}>
                            <div className={styles.detailHeader}>
                                <span className={styles.detailIcon}>🎨</span>
                                <h4 className={styles.detailTitle}>Estampas</h4>
                            </div>
                            <div className={styles.detailContent}>
                                <div className={styles.tagList}>
                                    {fa?.fashion.patterns.map((pattern, i) => (
                                        <span key={i} className={styles.tagAccent}>{pattern}</span>
                                    ))}
                                </div>
                            </div>
                        </Card>

                        {/* Ocasiões */}
                        <Card className={`${styles.detailCard} ${styles.occasionsCard}`}>
                            <div className={styles.detailHeader}>
                                <span className={styles.detailIcon}>📅</span>
                                <h4 className={styles.detailTitle}>Looks por Ocasião</h4>
                            </div>
                            <div className={styles.detailContent}>
                                <div className={styles.occasionItem}>
                                    <span className={styles.occasionLabel}>☀️ Casual</span>
                                    <p>{fa?.fashion.occasions.casual}</p>
                                </div>
                                <div className={styles.occasionItem}>
                                    <span className={styles.occasionLabel}>💼 Trabalho</span>
                                    <p>{fa?.fashion.occasions.work}</p>
                                </div>
                                <div className={styles.occasionItem}>
                                    <span className={styles.occasionLabel}>🌙 Noite</span>
                                    <p>{fa?.fashion.occasions.evening}</p>
                                </div>
                            </div>
                        </Card>
                    </div>
                </section>

                {/* ============================================ */}
                {/* SEÇÃO: TENDÊNCIAS 2026 - SEMPRE ABERTA */}
                {/* ============================================ */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        <span className={styles.sectionIcon}>🔥</span>
                        Tendências 2026 Para Você
                    </h2>

                    <Card className={styles.trendsOverviewCard}>
                        <div className={styles.trendsHeader}>
                            <span className={styles.trendsBadge}>✨ ATUALIZADO</span>
                            <p className={styles.overviewText}>
                                Baseado na sua estação <strong>{analysis.season}</strong>, separamos as tendências de 2026 que mais combinam com você!
                            </p>
                        </div>
                    </Card>

                    {/* Destaques gerais */}
                    <Card className={styles.trendsHighlightCard}>
                        <h3 className={styles.trendsSubtitle}>
                            🌟 Destaques da Moda 2026
                        </h3>
                        <div className={styles.trendsHighlights}>
                            {generalTrends2026.highlights.map((highlight, i) => (
                                <div key={i} className={styles.highlightItem}>
                                    <span className={styles.highlightIcon}>{highlight.icon}</span>
                                    <div>
                                        <strong>{highlight.title}</strong>
                                        <p>{highlight.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {seasonTrends && (
                        <div className={styles.detailsGrid}>
                            {/* Cores em Alta */}
                            <Card className={styles.detailCard}>
                                <div className={styles.detailHeader}>
                                    <span className={styles.detailIcon}>🎨</span>
                                    <h4 className={styles.detailTitle}>Cores 2026 Para Você</h4>
                                </div>
                                <div className={styles.detailContent}>
                                    <div className={styles.trendColorPalette}>
                                        {seasonTrends.colors.map((color, i) => (
                                            <div
                                                key={i}
                                                className={styles.trendColorCard}
                                                style={{ backgroundColor: color.hex }}
                                            >
                                                <span className={styles.trendColorName}>{color.name}</span>
                                                <span className={styles.trendColorHex}>{color.hex}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <p className={styles.detailTip}>
                                        💡 Essas cores estão em alta em 2026 e combinam perfeitamente com sua paleta!
                                    </p>
                                </div>
                            </Card>

                            {/* Maquiagem Trending */}
                            <Card className={styles.detailCard}>
                                <div className={styles.detailHeader}>
                                    <span className={styles.detailIcon}>💄</span>
                                    <h4 className={styles.detailTitle}>Maquiagem Trending</h4>
                                </div>
                                <div className={styles.detailContent}>
                                    {seasonTrends.makeup.map((trend, i) => (
                                        <div key={i} className={styles.trendItem}>
                                            <span className={styles.trendItemIcon}>{trend.icon}</span>
                                            <div>
                                                <strong>{trend.title}</strong>
                                                <p>{trend.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>

                            {/* Cabelos Trending */}
                            <Card className={styles.detailCard}>
                                <div className={styles.detailHeader}>
                                    <span className={styles.detailIcon}>💇</span>
                                    <h4 className={styles.detailTitle}>Cabelos em Alta</h4>
                                </div>
                                <div className={styles.detailContent}>
                                    {seasonTrends.hair.map((trend, i) => (
                                        <div key={i} className={styles.trendItem}>
                                            <span className={styles.trendItemIcon}>{trend.icon}</span>
                                            <div>
                                                <strong>{trend.title}</strong>
                                                <p>{trend.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>

                            {/* Acessórios Trending */}
                            <Card className={styles.detailCard}>
                                <div className={styles.detailHeader}>
                                    <span className={styles.detailIcon}>💎</span>
                                    <h4 className={styles.detailTitle}>Acessórios do Momento</h4>
                                </div>
                                <div className={styles.detailContent}>
                                    {seasonTrends.accessories.map((trend, i) => (
                                        <div key={i} className={styles.trendItem}>
                                            <span className={styles.trendItemIcon}>{trend.icon}</span>
                                            <div>
                                                <strong>{trend.title}</strong>
                                                <p>{trend.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>
                    )}
                </section>

                {/* Footer */}
                <footer className={styles.footer}>
                    <p className={styles.footerText}>
                        Salve seu relatório completo para consultar quando quiser!
                    </p>
                    <Button variant="secondary" onClick={handleDownload}>
                        📥 Baixar Relatório Completo
                    </Button>
                </footer>
            </div>
        </main>
    );
}

// Função auxiliar para ajustar brilho de cores hex
function adjustBrightness(hex: string, percent: number): string {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
        (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
        (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
}
