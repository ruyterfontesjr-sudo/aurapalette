'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import Card from '@/components/Card';
import Logo from '@/components/Logo';
import Button from '@/components/Button';
import { config, faqs } from '@/config';

interface AnalysisResult {
    temperature: string;
    undertone: string;
    season: string;
    contrast: string;
}

export default function PreviewPage() {
    const router = useRouter();
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [timeLeft, setTimeLeft] = useState(config.urgencyTimer.durationMinutes * 60);
    const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
    const [isReady, setIsReady] = useState(false);

    // Checkpoint verification - must have completed analysis
    useEffect(() => {
        const storedAnalysis = localStorage.getItem('aurapalette_analysis');
        if (!storedAnalysis) {
            // Check if quiz was done, redirect accordingly
            const quizData = localStorage.getItem('aurapalette_quiz');
            if (!quizData) {
                router.push('/quiz');
            } else {
                router.push('/upload');
            }
            return;
        }
        setAnalysis(JSON.parse(storedAnalysis));

        // Set checkpoint
        localStorage.setItem('aurapalette_checkpoint', JSON.stringify({
            currentStage: 'preview',
            completedStages: ['signup', 'quiz', 'upload', 'preview'],
            lastUpdated: new Date().toISOString(),
        }));

        setIsReady(true);
    }, [router]);

    useEffect(() => {
        if (!config.urgencyTimer.enabled) return;
        const timer = setInterval(() => {
            setTimeLeft(prev => (prev <= 0 ? config.urgencyTimer.durationMinutes * 60 : prev - 1));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleUnlock = async () => {
        setLoading(true);
        // Redirect to checkout page for payment method selection
        router.push('/checkout');
    };

    const seasonEmoji: Record<string, string> = {
        'Primavera': '🌸',
        'Verão': '☀️',
        'Outono': '🍂',
        'Inverno': '❄️',
    };

    const seasonColors: Record<string, { bg: string; border: string }> = {
        'Primavera': { bg: 'rgba(251, 191, 36, 0.1)', border: 'rgba(251, 191, 36, 0.3)' },
        'Verão': { bg: 'rgba(59, 130, 246, 0.1)', border: 'rgba(59, 130, 246, 0.3)' },
        'Outono': { bg: 'rgba(234, 88, 12, 0.1)', border: 'rgba(234, 88, 12, 0.3)' },
        'Inverno': { bg: 'rgba(139, 92, 246, 0.1)', border: 'rgba(139, 92, 246, 0.3)' },
    };

    const season = analysis?.season || 'Outono';
    const colors = seasonColors[season] || seasonColors['Outono'];

    return (
        <main className={styles.page}>
            <div className={styles.bgGradient} />

            <div className={styles.container}>
                <div className={styles.header}>
                    <Logo />
                </div>

                {/* Resultado Gratuito: Apenas a Estação */}
                <Card className={styles.resultCard}>
                    <div className={styles.resultBadge}>✨ Prévia do seu resultado</div>

                    <div
                        className={styles.seasonCard}
                        style={{
                            background: colors.bg,
                            borderColor: colors.border
                        }}
                    >
                        <span className={styles.seasonEmoji}>{seasonEmoji[season]}</span>
                        <div className={styles.seasonInfo}>
                            <span className={styles.seasonLabel}>Sua estação é</span>
                            <h2 className={styles.seasonName}>{season}</h2>
                        </div>
                    </div>

                    <p className={styles.seasonDesc}>
                        Você é <strong>{season}</strong>!
                        Isso significa que certas cores vão realçar sua beleza natural enquanto outras podem apagar seu brilho.
                    </p>
                </Card>

                {/* Conteúdo Bloqueado */}
                <div className={styles.lockedSection}>
                    <div className={styles.lockedHeader}>
                        <span className={styles.lockIcon}>🔒</span>
                        <span>Relatório Completo Bloqueado</span>
                    </div>

                    <div className={styles.lockedItems}>
                        <div className={styles.lockedItem}>
                            <div className={styles.lockedItemIcon}>🎨</div>
                            <div className={styles.lockedItemContent}>
                                <span className={styles.lockedItemTitle}>Paleta de Cores Completa</span>
                                <span className={styles.lockedItemDesc}>Cores que realçam você</span>
                            </div>
                            <span className={styles.lockedBadge}>Bloqueado</span>
                        </div>

                        <div className={styles.lockedItem}>
                            <div className={styles.lockedItemIcon}>💄</div>
                            <div className={styles.lockedItemContent}>
                                <span className={styles.lockedItemTitle}>Guia de Maquiagem</span>
                                <span className={styles.lockedItemDesc}>Base, batom, sombras ideais</span>
                            </div>
                            <span className={styles.lockedBadge}>Bloqueado</span>
                        </div>

                        <div className={styles.lockedItem}>
                            <div className={styles.lockedItemIcon}>💇</div>
                            <div className={styles.lockedItemContent}>
                                <span className={styles.lockedItemTitle}>Cores de Cabelo</span>
                                <span className={styles.lockedItemDesc}>Coloração e mechas ideais</span>
                            </div>
                            <span className={styles.lockedBadge}>Bloqueado</span>
                        </div>

                        <div className={styles.lockedItem}>
                            <div className={styles.lockedItemIcon}>💎</div>
                            <div className={styles.lockedItemContent}>
                                <span className={styles.lockedItemTitle}>Acessórios & Metais</span>
                                <span className={styles.lockedItemDesc}>Ouro, prata ou rose gold?</span>
                            </div>
                            <span className={styles.lockedBadge}>Bloqueado</span>
                        </div>

                        <div className={styles.lockedItem}>
                            <div className={styles.lockedItemIcon}>🔥</div>
                            <div className={styles.lockedItemContent}>
                                <span className={styles.lockedItemTitle}>Tendências 2026</span>
                                <span className={styles.lockedItemDesc}>O que usar essa temporada</span>
                            </div>
                            <div className={styles.badgeGroup}>
                                <span className={styles.newBadge}>NOVO</span>
                                <span className={styles.lockedBadge}>Bloqueado</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CTA Principal */}
                <Card className={styles.ctaCard}>
                    {config.urgencyTimer.enabled && (
                        <div className={styles.urgencyBanner}>
                            <span>⏰ Oferta expira em: <strong>{formatTime(timeLeft)}</strong></span>
                        </div>
                    )}

                    <h3 className={styles.ctaTitle}>Desbloqueie seu relatório completo</h3>

                    <div className={styles.priceRow}>
                        <span className={styles.priceCurrency}>{config.currencySymbol}</span>
                        <span className={styles.priceAmount}>{config.price}</span>
                        <span className={styles.priceCents}>,00</span>
                        <span className={styles.priceNote}>pagamento único</span>
                    </div>

                    <Button
                        variant="accent"
                        fullWidth
                        size="large"
                        onClick={handleUnlock}
                        loading={loading}
                        className={styles.ctaButton}
                    >
                        Desbloquear agora →
                    </Button>

                    <div className={styles.guarantee}>
                        <span>🛡️</span>
                        Garantia de {config.guaranteeDays} dias ou seu dinheiro de volta
                    </div>
                </Card>

                {/* Testimonials Section */}
                <section className={styles.testimonials}>
                    <h3 className={styles.testimonialsTitle}>O que dizem nossas clientes ✨</h3>
                    <div className={styles.testimonialsList}>
                        <div className={styles.testimonialCard}>
                            <div className={styles.testimonialStars}>★★★★★</div>
                            <p className={styles.testimonialText}>
                                &quot;Eu nunca soube que outono era minha estação! Agora entendo porque certas cores me deixavam apagada. O relatório mudou completamente minhas compras.&quot;
                            </p>
                            <div className={styles.testimonialAuthor}>
                                <img
                                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face"
                                    alt="Carolina M."
                                    className={styles.testimonialAvatarImg}
                                />
                                <div>
                                    <span className={styles.testimonialName}>Carolina M.</span>
                                    <span className={styles.testimonialLocation}>São Paulo, SP</span>
                                </div>
                            </div>
                        </div>

                        <div className={styles.testimonialCard}>
                            <div className={styles.testimonialStars}>★★★★★</div>
                            <p className={styles.testimonialText}>
                                &quot;Super prático! A análise foi rápida e o guia de maquiagem é incrível. Finalmente sei qual batom combina comigo.&quot;
                            </p>
                            <div className={styles.testimonialAuthor}>
                                <img
                                    src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&h=80&fit=crop&crop=face"
                                    alt="Amanda R."
                                    className={styles.testimonialAvatarImg}
                                />
                                <div>
                                    <span className={styles.testimonialName}>Amanda R.</span>
                                    <span className={styles.testimonialLocation}>Rio de Janeiro, RJ</span>
                                </div>
                            </div>
                        </div>

                        <div className={styles.testimonialCard}>
                            <div className={styles.testimonialStars}>★★★★★</div>
                            <p className={styles.testimonialText}>
                                &quot;Vale cada centavo! Mostrei pra minha mãe e ela também vai fazer. O PDF ficou lindo e super completo.&quot;
                            </p>
                            <div className={styles.testimonialAuthor}>
                                <img
                                    src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=face"
                                    alt="Beatriz S."
                                    className={styles.testimonialAvatarImg}
                                />
                                <div>
                                    <span className={styles.testimonialName}>Beatriz S.</span>
                                    <span className={styles.testimonialLocation}>Belo Horizonte, MG</span>
                                </div>
                            </div>
                        </div>

                        <div className={styles.testimonialCard}>
                            <div className={styles.testimonialStars}>★★★★★</div>
                            <p className={styles.testimonialText}>
                                &quot;Adorei a parte de acessórios! Descobri que prata combina muito mais comigo do que ouro. Recomendo!&quot;
                            </p>
                            <div className={styles.testimonialAuthor}>
                                <img
                                    src="https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=80&h=80&fit=crop&crop=face"
                                    alt="Juliana T."
                                    className={styles.testimonialAvatarImg}
                                />
                                <div>
                                    <span className={styles.testimonialName}>Juliana T.</span>
                                    <span className={styles.testimonialLocation}>Curitiba, PR</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FAQ */}
                <section className={styles.faqSection}>
                    <h3 className={styles.faqTitle}>Dúvidas frequentes</h3>
                    <div className={styles.faqList}>
                        {faqs.map((faq, index) => (
                            <div
                                key={index}
                                className={`${styles.faqItem} ${expandedFaq === index ? styles.faqItemOpen : ''}`}
                                onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                            >
                                <div className={styles.faqQuestion}>
                                    <span>{faq.question}</span>
                                    <span className={styles.faqToggle}>{expandedFaq === index ? '−' : '+'}</span>
                                </div>
                                {expandedFaq === index && (
                                    <div className={styles.faqAnswer}>{faq.answer}</div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </main>
    );
}
