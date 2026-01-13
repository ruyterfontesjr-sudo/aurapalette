'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Logo from '@/components/Logo';
import { testimonials, testimonialPhotos } from '@/config';

const heroPhotos = [
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=face',
];

export default function Home() {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <main className={styles.page}>
            <div className={styles.bgGradient} />

            {/* Top Banner */}
            <div className={styles.topBanner}>
                <span className={styles.liveDot} />
                +2.800 análises realizadas esta semana
            </div>

            {/* Header */}
            <header className={styles.header}>
                <Link href="/" className={styles.logoLink}>
                    <Logo />
                </Link>

                {/* Desktop: Botão Entrar */}
                <Link href="/login" className={styles.loginBtn}>
                    Entrar
                </Link>

                {/* Mobile: Menu Hamburguer */}
                <button
                    className={styles.menuBtn}
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Menu"
                >
                    <span className={styles.menuIcon}></span>
                </button>

                {/* Mobile Dropdown Menu */}
                {menuOpen && (
                    <div className={styles.mobileMenu}>
                        <button
                            className={styles.mobileMenuClose}
                            onClick={() => setMenuOpen(false)}
                            aria-label="Fechar menu"
                        >
                            ×
                        </button>
                        <Link href="/signup" className={styles.mobileMenuItem} onClick={() => setMenuOpen(false)}>
                            Cadastrar
                        </Link>
                        <Link href="/login" className={styles.mobileMenuItem} onClick={() => setMenuOpen(false)}>
                            Entrar
                        </Link>
                    </div>
                )}
            </header>

            {/* Hero */}
            <section className={styles.hero}>
                <div className={styles.heroContent}>
                    <div className={styles.heroBadge}>
                        Análise com Inteligência Artificial
                    </div>

                    <h1 className={styles.heroTitle}>
                        Descubra as cores que
                        <span className={styles.heroGradient}> realçam sua beleza</span>
                    </h1>

                    <p className={styles.heroSubtitle}>
                        Análise de colorimetria personalizada.
                        Sua paleta ideal em 2 minutos.
                    </p>

                    <Link href="/signup" className={styles.ctaLink}>
                        <Button variant="primary" size="large" className={styles.ctaBtn}>
                            Descobrir minhas cores →
                        </Button>
                    </Link>



                    {/* Social Proof */}
                    <div className={styles.socialProof}>
                        <div className={styles.avatarRow}>
                            {heroPhotos.slice(0, 5).map((photo, i) => (
                                <img key={i} src={photo} alt="" className={styles.avatar} />
                            ))}
                            <div className={styles.avatarMore}>+50k</div>
                        </div>
                        <p>+ de 50.000 brasileiras já descobriram suas cores!</p>
                    </div>
                </div>
            </section>

            {/* Trust Badges */}
            <div className={styles.trustBadges}>
                <div className={styles.trustBadge}>
                    <span>✓</span> Garantia 7 dias
                </div>
                <div className={styles.trustBadge}>
                    <span>⚡</span> Resultado imediato
                </div>
                <div className={styles.trustBadge}>
                    <span>🔒</span> 100% seguro
                </div>
            </div>

            {/* How it Works */}
            <section className={styles.howItWorks}>
                <h2 className={styles.sectionTitle}>Como funciona</h2>

                <div className={styles.stepsContainer}>
                    <div className={styles.step}>
                        <div className={styles.stepIcon}>
                            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                                <rect x="4" y="4" width="20" height="20" rx="2" stroke="currentColor" strokeWidth="2" />
                                <path d="M9 10h10M9 14h10M9 18h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </div>
                        <div className={styles.stepContent}>
                            <span className={styles.stepNum}>1</span>
                            <h3>Responda um quiz</h3>
                            <p>Perguntas rápidas sobre você</p>
                        </div>
                    </div>

                    <div className={styles.stepLine} />

                    <div className={styles.step}>
                        <div className={styles.stepIcon}>
                            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                                <rect x="4" y="8" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
                                <circle cx="14" cy="16" r="4" stroke="currentColor" strokeWidth="2" />
                                <path d="M8 8V6a2 2 0 012-2h8a2 2 0 012 2v2" stroke="currentColor" strokeWidth="2" />
                            </svg>
                        </div>
                        <div className={styles.stepContent}>
                            <span className={styles.stepNum}>2</span>
                            <h3>Tire uma selfie</h3>
                            <p>Com boa iluminação natural</p>
                        </div>
                    </div>

                    <div className={styles.stepLine} />

                    <div className={styles.step}>
                        <div className={styles.stepIcon}>
                            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                                <circle cx="14" cy="14" r="10" stroke="currentColor" strokeWidth="2" />
                                <path d="M14 8v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </div>
                        <div className={styles.stepContent}>
                            <span className={styles.stepNum}>3</span>
                            <h3>IA analisa</h3>
                            <p>Em menos de 2 minutos</p>
                        </div>
                    </div>

                    <div className={styles.stepLine} />

                    <div className={styles.step}>
                        <div className={styles.stepIcon}>
                            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                                <rect x="4" y="4" width="20" height="20" rx="2" stroke="currentColor" strokeWidth="2" />
                                <path d="M4 10h20M10 10v14" stroke="currentColor" strokeWidth="2" />
                            </svg>
                        </div>
                        <div className={styles.stepContent}>
                            <span className={styles.stepNum}>4</span>
                            <h3>Receba seu guia</h3>
                            <p>Paleta + dicas completas</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Preview do Relatório - Mockup de Celular */}
            <section className={styles.previewSection}>
                <h2 className={styles.sectionTitle}>Veja uma prévia do que você vai receber!</h2>
                <p className={styles.previewSubtitle}>👆 Role no celular para explorar seu relatório completo</p>

                <div className={styles.phoneMockupContainer}>
                    <div className={styles.phoneMockup}>
                        {/* Phone Frame */}
                        <div className={styles.phoneNotch}></div>

                        {/* Scroll Indicator */}
                        <div className={styles.scrollIndicator}>
                            <span>↕ Role para ver mais</span>
                        </div>

                        {/* Phone Content - Scrollable */}
                        <div className={styles.phoneScreen}>
                            {/* Report Header */}
                            <div className={styles.reportHeader}>
                                <Logo size="small" />
                            </div>

                            {/* Title */}
                            <div className={styles.reportTitle}>
                                Maria, seu relatório está pronto! ✨
                            </div>

                            {/* Season Card */}
                            <div className={styles.reportSeasonCard}>
                                <span className={styles.reportSeasonName}>Outono Quente</span>
                                <p className={styles.reportSeasonDesc}>
                                    Cores terrosas e quentes realçam sua beleza natural.
                                </p>
                            </div>

                            {/* Stats Row */}
                            <div className={styles.reportStatsRow}>
                                <div className={styles.reportStat}>
                                    <span className={styles.statLabel}>Temp.</span>
                                    <span className={styles.statValue}>Quente</span>
                                </div>
                                <div className={styles.reportStat}>
                                    <span className={styles.statLabel}>Subtom</span>
                                    <span className={styles.statValue}>Dourado</span>
                                </div>
                                <div className={styles.reportStat}>
                                    <span className={styles.statLabel}>Contraste</span>
                                    <span className={styles.statValue}>Médio</span>
                                </div>
                            </div>

                            {/* Color Palette */}
                            <div className={styles.reportSection}>
                                <span className={styles.reportSectionTitle}>🎨 Suas Melhores Cores</span>
                                <div className={styles.reportColors}>
                                    <div className={styles.reportColorItem}>
                                        <div className={styles.reportColor} style={{ background: '#D97706' }}></div>
                                        <span>Âmbar</span>
                                    </div>
                                    <div className={styles.reportColorItem}>
                                        <div className={styles.reportColor} style={{ background: '#B45309' }}></div>
                                        <span>Caramelo</span>
                                    </div>
                                    <div className={styles.reportColorItem}>
                                        <div className={styles.reportColor} style={{ background: '#92400E' }}></div>
                                        <span>Cobre</span>
                                    </div>
                                    <div className={styles.reportColorItem}>
                                        <div className={styles.reportColor} style={{ background: '#78350F' }}></div>
                                        <span>Terracota</span>
                                    </div>
                                    <div className={styles.reportColorItem}>
                                        <div className={styles.reportColor} style={{ background: '#059669' }}></div>
                                        <span>Oliva</span>
                                    </div>
                                    <div className={styles.reportColorItem}>
                                        <div className={styles.reportColor} style={{ background: '#B91C1C' }}></div>
                                        <span>Bordô</span>
                                    </div>
                                    <div className={styles.reportColorItem}>
                                        <div className={styles.reportColor} style={{ background: '#CA8A04' }}></div>
                                        <span>Mostarda</span>
                                    </div>
                                    <div className={styles.reportColorItem}>
                                        <div className={styles.reportColor} style={{ background: '#365314' }}></div>
                                        <span>Verde Musgo</span>
                                    </div>
                                    <div className={styles.reportColorItem}>
                                        <div className={styles.reportColor} style={{ background: '#7C2D12' }}></div>
                                        <span>Marrom</span>
                                    </div>
                                </div>
                            </div>

                            {/* Avoid Colors */}
                            <div className={styles.reportSection}>
                                <span className={styles.reportSectionTitle}>🚫 Cores a Evitar</span>
                                <div className={styles.reportAvoidColors}>
                                    <span className={styles.avoidColor}>Preto puro</span>
                                    <span className={styles.avoidColor}>Cinza frio</span>
                                    <span className={styles.avoidColor}>Rosa frio</span>
                                    <span className={styles.avoidColor}>Azul royal</span>
                                    <span className={styles.avoidColor}>Branco neve</span>
                                </div>
                            </div>

                            {/* Makeup Guide - Complete */}
                            <div className={styles.reportSection}>
                                <span className={styles.reportSectionTitle}>💄 Guia Completo de Maquiagem</span>
                                <div className={styles.reportGuideContent}>
                                    <div className={styles.guideRow}>
                                        <span className={styles.guideLabel}>Base:</span>
                                        <span>Subtom dourado, acabamento acetinado</span>
                                    </div>
                                    <div className={styles.guideRow}>
                                        <span className={styles.guideLabel}>Blush:</span>
                                        <span>Pêssego, coral, terracota, damasco</span>
                                    </div>
                                    <div className={styles.guideRow}>
                                        <span className={styles.guideLabel}>Batom dia:</span>
                                        <span>Nude pêssego, coral suave, rose terracota</span>
                                    </div>
                                    <div className={styles.guideRow}>
                                        <span className={styles.guideLabel}>Batom noite:</span>
                                        <span>Vermelho tijolo, vinho, terracota escuro</span>
                                    </div>
                                    <div className={styles.guideRow}>
                                        <span className={styles.guideLabel}>Sombras:</span>
                                        <span>Marrom, bronze, dourado, verde oliva, cobre</span>
                                    </div>
                                    <div className={styles.guideRow}>
                                        <span className={styles.guideLabel}>Delineador:</span>
                                        <span>Marrom escuro, bronze, verde musgo</span>
                                    </div>
                                    <div className={styles.guideRow}>
                                        <span className={styles.guideLabel}>Bronzer:</span>
                                        <span>Tom quente, aplicar em formato C</span>
                                    </div>
                                </div>
                            </div>

                            {/* Hair Guide - Complete */}
                            <div className={styles.reportSection}>
                                <span className={styles.reportSectionTitle}>💇 Guia Completo de Cabelos</span>
                                <div className={styles.reportGuideContent}>
                                    <div className={styles.guideRow}>
                                        <span className={styles.guideLabel}>Cores base:</span>
                                        <span>Castanho dourado, caramelo, mel, ruivo</span>
                                    </div>
                                    <div className={styles.guideRow}>
                                        <span className={styles.guideLabel}>Mechas:</span>
                                        <span>Acobreados, avelã, mel, babylights</span>
                                    </div>
                                    <div className={styles.guideRow}>
                                        <span className={styles.guideLabel}>Cortes:</span>
                                        <span>Camadas suaves, long bob, franja cortina</span>
                                    </div>
                                    <div className={styles.guideRow}>
                                        <span className={styles.guideLabel}>Styling:</span>
                                        <span>Ondas naturais, volume na raiz, beach waves</span>
                                    </div>
                                    <div className={styles.guideRow}>
                                        <span className={styles.guideLabel}>Evitar:</span>
                                        <span>Loiro platinado, preto azulado, cinza</span>
                                    </div>
                                </div>
                            </div>

                            {/* Accessories Guide - Expanded */}
                            <div className={styles.reportSection}>
                                <span className={styles.reportSectionTitle}>💎 Guia Completo de Acessórios</span>
                                <div className={styles.reportMetals}>
                                    <div className={styles.metalItem} style={{ background: 'linear-gradient(135deg, #D4AF37, #B8860B)' }}>
                                        <span>✓ Ouro</span>
                                    </div>
                                    <div className={styles.metalItem} style={{ background: 'linear-gradient(135deg, #CD7F32, #8B4513)' }}>
                                        <span>✓ Bronze</span>
                                    </div>
                                    <div className={styles.metalItem} style={{ background: 'linear-gradient(135deg, #f5d0a9, #c4a77d)' }}>
                                        <span>✓ Rosé Gold</span>
                                    </div>
                                    <div className={styles.metalItem} style={{ background: 'linear-gradient(135deg, #B87333, #8B4513)' }}>
                                        <span>✓ Cobre</span>
                                    </div>
                                    <div className={styles.metalItem} style={{ background: 'linear-gradient(135deg, #C0C0C0, #808080)', opacity: 0.5 }}>
                                        <span>✗ Prata</span>
                                    </div>
                                </div>
                                <div className={styles.reportGuideContent}>
                                    <div className={styles.guideRow}>
                                        <span className={styles.guideLabel}>Colares:</span>
                                        <span>Correntes douradas, pedras âmbar, citrino</span>
                                    </div>
                                    <div className={styles.guideRow}>
                                        <span className={styles.guideLabel}>Brincos:</span>
                                        <span>Argolas ouro, pedras quentes, topázio</span>
                                    </div>
                                    <div className={styles.guideRow}>
                                        <span className={styles.guideLabel}>Pulseiras:</span>
                                        <span>Braceletes em ouro, cobre, pedras naturais</span>
                                    </div>
                                    <div className={styles.guideRow}>
                                        <span className={styles.guideLabel}>Anéis:</span>
                                        <span>Ouro amarelo, rose gold, citrino, topázio</span>
                                    </div>
                                    <div className={styles.guideRow}>
                                        <span className={styles.guideLabel}>Óculos:</span>
                                        <span>Tartaruga, marrom, dourado, caramelo</span>
                                    </div>
                                    <div className={styles.guideRow}>
                                        <span className={styles.guideLabel}>Bolsas:</span>
                                        <span>Caramelo, marrom, terracota, couro natural</span>
                                    </div>
                                    <div className={styles.guideRow}>
                                        <span className={styles.guideLabel}>Relógios:</span>
                                        <span>Ouro, rose gold, pulseira couro marrom</span>
                                    </div>
                                </div>
                            </div>

                            {/* Fashion Guide - Expanded */}
                            <div className={styles.reportSection}>
                                <span className={styles.reportSectionTitle}>👗 Guia Completo de Moda</span>
                                <div className={styles.reportGuideContent}>
                                    <div className={styles.guideRow}>
                                        <span className={styles.guideLabel}>Essenciais:</span>
                                        <span>Blazer caramelo, calça bege, vestido terracota</span>
                                    </div>
                                    <div className={styles.guideRow}>
                                        <span className={styles.guideLabel}>Tecidos:</span>
                                        <span>Linho, algodão, seda, cashmere, veludo</span>
                                    </div>
                                    <div className={styles.guideRow}>
                                        <span className={styles.guideLabel}>Estampas:</span>
                                        <span>Florais quentes, animal print, geométricos</span>
                                    </div>
                                    <div className={styles.guideRow}>
                                        <span className={styles.guideLabel}>Casual:</span>
                                        <span>Jeans + blusas terrosas + tênis branco</span>
                                    </div>
                                    <div className={styles.guideRow}>
                                        <span className={styles.guideLabel}>Trabalho:</span>
                                        <span>Alfaiataria bege/marrom + camisas neutras</span>
                                    </div>
                                    <div className={styles.guideRow}>
                                        <span className={styles.guideLabel}>Noite:</span>
                                        <span>Vestidos vinho/terracota + joias ouro</span>
                                    </div>
                                </div>
                                <div className={styles.reportFashionTags}>
                                    <span className={styles.fashionTag}>Blazer caramelo</span>
                                    <span className={styles.fashionTag}>Vestido terracota</span>
                                    <span className={styles.fashionTag}>Calça cáqui</span>
                                    <span className={styles.fashionTag}>Blusa off-white</span>
                                    <span className={styles.fashionTag}>Saia midi</span>
                                    <span className={styles.fashionTag}>Cardigan mostarda</span>
                                </div>
                            </div>

                            {/* Trends 2026 - Expanded */}
                            <div className={styles.reportSection}>
                                <span className={styles.reportSectionTitle}>✨ Tendências 2026 para Você</span>
                                <div className={styles.reportGuideContent}>
                                    <div className={styles.guideRow}>
                                        <span className={styles.guideLabel}>Cor do ano:</span>
                                        <span>Terracota vibrante - perfeito para você!</span>
                                    </div>
                                    <div className={styles.guideRow}>
                                        <span className={styles.guideLabel}>Estilo:</span>
                                        <span>Quiet luxury com tons naturais</span>
                                    </div>
                                    <div className={styles.guideRow}>
                                        <span className={styles.guideLabel}>Maquiagem:</span>
                                        <span>Pele natural, blush bronzeado, lábios nude</span>
                                    </div>
                                </div>
                                <div className={styles.reportFashionTags}>
                                    <span className={styles.fashionTag}>Terracota vibrante</span>
                                    <span className={styles.fashionTag}>Dourado suave</span>
                                    <span className={styles.fashionTag}>Verde oliva</span>
                                    <span className={styles.fashionTag}>Burgundy</span>
                                    <span className={styles.fashionTag}>Caramelo</span>
                                </div>
                            </div>

                            {/* Quick Tips */}
                            <div className={styles.reportSection}>
                                <span className={styles.reportSectionTitle}>💡 Dicas Rápidas</span>
                                <div className={styles.reportGuideContent}>
                                    <div className={styles.guideRow}>
                                        <span className={styles.guideLabel}>Moda:</span>
                                        <span>Invista em peças terrosas e quentes</span>
                                    </div>
                                    <div className={styles.guideRow}>
                                        <span className={styles.guideLabel}>Make:</span>
                                        <span>Bases com subtom amarelado</span>
                                    </div>
                                    <div className={styles.guideRow}>
                                        <span className={styles.guideLabel}>Acessórios:</span>
                                        <span>Joias douradas sempre!</span>
                                    </div>
                                    <div className={styles.guideRow}>
                                        <span className={styles.guideLabel}>Cabelo:</span>
                                        <span>Mechas caramelo e mel valorizam</span>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className={styles.reportFooter}>
                                <span>Aura Palette © 2026</span>
                            </div>
                        </div>
                    </div>

                    {/* Features List - Redesigned */}
                    <div className={styles.previewFeatures}>
                        <h3 className={styles.featuresTitle}>O que está incluído:</h3>
                        <div className={styles.featureCard}>
                            <span className={styles.featureIcon}>🎨</span>
                            <div>
                                <strong>Paleta Personalizada</strong>
                                <p>+10 cores que realçam você</p>
                            </div>
                        </div>
                        <div className={styles.featureCard}>
                            <span className={styles.featureIcon}>💄</span>
                            <div>
                                <strong>Guia de Maquiagem</strong>
                                <p>Base, blush, batom, sombras</p>
                            </div>
                        </div>
                        <div className={styles.featureCard}>
                            <span className={styles.featureIcon}>💇</span>
                            <div>
                                <strong>Cores de Cabelo</strong>
                                <p>Mechas e tonalidades ideais</p>
                            </div>
                        </div>
                        <div className={styles.featureCard}>
                            <span className={styles.featureIcon}>💎</span>
                            <div>
                                <strong>Acessórios</strong>
                                <p>Metais que combinam com você</p>
                            </div>
                        </div>
                        <div className={styles.featureCard}>
                            <span className={styles.featureIcon}>👗</span>
                            <div>
                                <strong>Guia de Moda</strong>
                                <p>Peças e tecidos essenciais</p>
                            </div>
                        </div>
                        <div className={styles.featureCard}>
                            <span className={styles.featureIcon}>📄</span>
                            <div>
                                <strong>PDF para Baixar</strong>
                                <p>Guarde seu relatório para sempre</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials - Infinite Carousel */}
            <section className={styles.testimonials}>
                <h2 className={styles.sectionTitle}>O que nossas clientes dizem</h2>

                <div className={styles.carouselWrapper}>
                    <div className={styles.carouselTrack}>
                        {/* First set of testimonials */}
                        {testimonials.map((t, i) => (
                            <div key={t.id} className={styles.testimonialCard}>
                                <div className={styles.testimonialHeader}>
                                    <img
                                        src={testimonialPhotos[i % testimonialPhotos.length]}
                                        alt=""
                                        className={styles.testimonialAvatar}
                                    />
                                    <div>
                                        <p className={styles.testimonialName}>{t.name}</p>
                                        <p className={styles.testimonialLocation}>{t.location}</p>
                                    </div>
                                </div>
                                <div className={styles.testimonialStars}>{'★'.repeat(t.rating)}</div>
                                <p className={styles.testimonialText}>&ldquo;{t.text}&rdquo;</p>
                            </div>
                        ))}
                        {/* Duplicate for seamless loop */}
                        {testimonials.map((t, i) => (
                            <div key={`dup-${t.id}`} className={styles.testimonialCard}>
                                <div className={styles.testimonialHeader}>
                                    <img
                                        src={testimonialPhotos[i % testimonialPhotos.length]}
                                        alt=""
                                        className={styles.testimonialAvatar}
                                    />
                                    <div>
                                        <p className={styles.testimonialName}>{t.name}</p>
                                        <p className={styles.testimonialLocation}>{t.location}</p>
                                    </div>
                                </div>
                                <div className={styles.testimonialStars}>{'★'.repeat(t.rating)}</div>
                                <p className={styles.testimonialText}>&ldquo;{t.text}&rdquo;</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className={styles.faqSection}>
                <h2 className={styles.sectionTitle}>Perguntas Frequentes</h2>
                <div className={styles.faqContainer}>
                    <details className={styles.faqItem}>
                        <summary className={styles.faqQuestion}>
                            O que é colorimetria pessoal?
                        </summary>
                        <p className={styles.faqAnswer}>
                            Colorimetria pessoal é uma técnica que identifica quais cores mais harmonizam com seu tom de pele, olhos e cabelo. Com essa análise, você descobre as cores que realçam sua beleza natural e evita as que deixam você apagada ou cansada.
                        </p>
                    </details>
                    <details className={styles.faqItem}>
                        <summary className={styles.faqQuestion}>
                            Como funciona a análise por IA?
                        </summary>
                        <p className={styles.faqAnswer}>
                            Nossa inteligência artificial analisa as características únicas da sua foto — tom de pele, subtom, contraste com olhos e cabelo — para determinar sua estação (Primavera, Verão, Outono ou Inverno) e suas variações de temperatura e intensidade.
                        </p>
                    </details>
                    <details className={styles.faqItem}>
                        <summary className={styles.faqQuestion}>
                            A análise é realmente precisa?
                        </summary>
                        <p className={styles.faqAnswer}>
                            Sim! Nossa IA foi treinada com milhares de análises profissionais. Para melhores resultados, recomendamos uma foto com luz natural, sem maquiagem e com rosto bem iluminado.
                        </p>
                    </details>
                    <details className={styles.faqItem}>
                        <summary className={styles.faqQuestion}>
                            O que está incluído no relatório?
                        </summary>
                        <p className={styles.faqAnswer}>
                            Você recebe: sua paleta de +10 cores ideais, cores para evitar, guia completo de maquiagem (base, blush, batom, sombras), guia de cabelos (cores, mechas, cortes), guia de acessórios (metais, joias), guia de moda (peças, tecidos, estampas) e tendências 2026.
                        </p>
                    </details>
                    <details className={styles.faqItem}>
                        <summary className={styles.faqQuestion}>
                            Posso baixar o relatório?
                        </summary>
                        <p className={styles.faqAnswer}>
                            Sim! Após o pagamento, você recebe acesso imediato ao relatório online e pode baixar um PDF profissional para consultar quando quiser — no celular, tablet ou computador.
                        </p>
                    </details>
                    <details className={styles.faqItem}>
                        <summary className={styles.faqQuestion}>
                            Qual a forma de pagamento?
                        </summary>
                        <p className={styles.faqAnswer}>
                            Aceitamos PIX, cartão de crédito e débito. O pagamento é processado de forma segura pelo Mercado Pago. Após confirmação, seu relatório é liberado instantaneamente.
                        </p>
                    </details>
                </div>
            </section>

            {/* Final CTA */}
            <section className={styles.finalCta}>
                <h2>Pronta para se descobrir?</h2>
                <p>Junte-se a mais de 50.000 brasileiras</p>
                <Link href="/signup">
                    <Button variant="accent" size="large">
                        Começar agora →
                    </Button>
                </Link>
            </section>

            {/* Footer */}
            <footer className={styles.footer}>
                <div className={styles.footerLinks}>
                    <Link href="/termos">Termos</Link>
                    <span>•</span>
                    <Link href="/privacidade">Privacidade</Link>
                </div>
                <p>© 2026 Aura Palette</p>
            </footer>
        </main>
    );
}
