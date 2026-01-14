'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import Card from '@/components/Card';
import Logo from '@/components/Logo';
import Button from '@/components/Button';
import { useAuth } from '@/contexts/AuthContext';

interface UserData {
    name: string;
    email: string;
    whatsapp: string;
    cpf: string;
}

interface PixData {
    brCode: string;
    brCodeBase64: string;
    pixId: string;
}

export default function CheckoutPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [userData, setUserData] = useState<UserData>({ name: '', email: '', whatsapp: '', cpf: '' });
    const [paymentMethod, setPaymentMethod] = useState<'card' | 'pix'>('pix');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [pixData, setPixData] = useState<PixData | null>(null);
    const [checkingStatus, setCheckingStatus] = useState(false);
    const [isReady, setIsReady] = useState(false);

    // Checkpoint verification - must have completed preview
    useEffect(() => {
        const analysisData = localStorage.getItem('aurapalette_analysis');
        if (!analysisData) {
            const quizData = localStorage.getItem('aurapalette_quiz');
            if (!quizData) {
                router.push('/quiz');
            } else {
                router.push('/upload');
            }
            return;
        }

        // Set checkpoint
        localStorage.setItem('aurapalette_checkpoint', JSON.stringify({
            currentStage: 'checkout',
            completedStages: ['signup', 'quiz', 'upload', 'preview', 'checkout'],
            lastUpdated: new Date().toISOString(),
        }));

        // Load user data from localStorage first
        const storedUser = localStorage.getItem('aurapalette_user');
        if (storedUser) {
            const parsed = JSON.parse(storedUser);
            setUserData(prev => ({
                ...prev,
                name: parsed.name || prev.name,
                email: parsed.email || prev.email,
                whatsapp: parsed.whatsapp || prev.whatsapp,
                cpf: parsed.cpf || prev.cpf,
            }));
        }

        // Also get email from authenticated user if available
        if (user?.email) {
            setUserData(prev => ({
                ...prev,
                email: user.email || prev.email,
                name: user.user_metadata?.name || prev.name,
            }));
        }

        setIsReady(true);
    }, [user, router]);

    // Format CPF as user types
    const formatCPF = (value: string) => {
        const numbers = value.replace(/\D/g, '');
        if (numbers.length <= 3) return numbers;
        if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
        if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
        return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Validate CPF for PIX
        const cpfNumbers = userData.cpf.replace(/\D/g, '');
        if (paymentMethod === 'pix' && cpfNumbers.length !== 11) {
            setError('CPF inválido. Por favor, verifique.');
            setLoading(false);
            return;
        }

        try {
            // Save user data
            localStorage.setItem('aurapalette_user', JSON.stringify(userData));

            if (paymentMethod === 'card') {
                // Stripe checkout
                const response = await fetch('/api/checkout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                });
                const data = await response.json();
                if (data.url) {
                    window.location.href = data.url;
                } else {
                    setError('Erro ao processar pagamento. Tente novamente.');
                    setLoading(false);
                }
            } else {
                // PIX checkout via AbacatePay
                const response = await fetch('/api/checkout/pix', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: userData.name,
                        email: userData.email,
                        cellphone: userData.whatsapp,
                        cpf: cpfNumbers,
                    }),
                });
                const data = await response.json();
                if (data.brCodeBase64) {
                    // PIX QR Code generated - store and show
                    setPixData({
                        brCode: data.brCode,
                        brCodeBase64: data.brCodeBase64,
                        pixId: data.pixId,
                    });
                    setLoading(false);
                    // Scroll to top and disable scroll when QR code appears
                    window.scrollTo({ top: 0, behavior: 'instant' });
                    document.body.style.overflow = 'hidden';
                } else if (data.error) {
                    setError(data.error);
                    setLoading(false);
                } else {
                    setError('Erro ao gerar PIX. Tente novamente.');
                    setLoading(false);
                }
            }
        } catch {
            setError('Erro ao processar pagamento. Tente novamente.');
            setLoading(false);
        }
    };

    // Supabase Realtime + Polling fallback para verificar status do pagamento PIX
    useEffect(() => {
        if (!pixData?.pixId) return;

        let redirected = false;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let supabaseClient: any = null;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let channel: any = null;

        const handlePaymentConfirmed = () => {
            if (redirected) return;
            redirected = true;
            document.body.style.overflow = '';
            router.push('/result?pix=success');
        };

        // 1. Supabase Realtime - escuta mudanças em tempo real
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (supabaseUrl && supabaseAnonKey) {
            import('@supabase/supabase-js').then(({ createClient }) => {
                supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

                channel = supabaseClient
                    .channel(`checkout-${pixData.pixId}`)
                    .on(
                        'postgres_changes',
                        {
                            event: 'UPDATE',
                            schema: 'public',
                            table: 'checkouts',
                            filter: `billing_id=eq.${pixData.pixId}`,
                        },
                        (payload: { new: { status: string } }) => {
                            console.log('Realtime update received:', payload);
                            if (payload.new && payload.new.status === 'paid') {
                                handlePaymentConfirmed();
                            }
                        }
                    )
                    .subscribe((status: string) => {
                        console.log('Realtime subscription status:', status);
                    });
            });
        }

        // 2. Polling fallback - verifica a cada 3 segundos
        const checkPaymentStatus = async () => {
            if (redirected) return;
            try {
                console.log('Polling PIX status for:', pixData.pixId);
                const res = await fetch(`/api/checkout/pix/status?id=${pixData.pixId}`);
                const data = await res.json();
                console.log('PIX status response:', data);

                if (data.status === 'RECEIVED' || data.status === 'COMPLETED' || data.status === 'paid') {
                    console.log('Payment confirmed! Redirecting...');
                    handlePaymentConfirmed();
                }
            } catch (error) {
                console.error('Error checking PIX status:', error);
            }
        };

        // Verificar imediatamente
        checkPaymentStatus();

        // Polling a cada 3 segundos
        const intervalId = setInterval(checkPaymentStatus, 3000);

        // Cleanup
        return () => {
            clearInterval(intervalId);
            if (channel && supabaseClient) {
                supabaseClient.removeChannel(channel);
            }
        };
    }, [pixData?.pixId, router]);

    return (
        <main className={`${styles.page} ${pixData ? styles.pageQr : ''}`}>
            <div className={styles.bgGradient} />
            <div className={styles.orbPrimary} />
            <div className={styles.orbSecondary} />

            <div className={styles.container}>

                <Card className={styles.card}>
                    {pixData ? (
                        /* PIX QR Code Display */
                        <>
                            <h1 className={styles.title}>Escaneie o QR Code 📱</h1>
                            <p className={styles.subtitle}>
                                Use o app do seu banco para pagar via PIX
                            </p>

                            <div className={styles.qrCodeContainer}>
                                <img
                                    src={pixData.brCodeBase64}
                                    alt="QR Code PIX"
                                    className={styles.qrCode}
                                />
                            </div>

                            <div className={styles.pixCodeContainer}>
                                <label className={styles.label}>Ou copie o código PIX:</label>
                                <div className={styles.pixCodeBox}>
                                    <input
                                        type="text"
                                        value={pixData.brCode}
                                        readOnly
                                        className={styles.pixCodeInput}
                                    />
                                    <button
                                        type="button"
                                        className={styles.copyButton}
                                        onClick={() => {
                                            navigator.clipboard.writeText(pixData.brCode);
                                            alert('Código PIX copiado!');
                                        }}
                                    >
                                        Copiar
                                    </button>
                                </div>
                            </div>

                            <p className={styles.securityQr}>
                                Você será redirecionado automaticamente após a confirmação
                            </p>

                            <Button
                                className={styles.submitButton}
                                disabled={checkingStatus}
                                onClick={async () => {
                                    setCheckingStatus(true);
                                    // Check payment status
                                    try {
                                        const res = await fetch(`/api/checkout/pix/status?id=${pixData.pixId}`);
                                        const data = await res.json();
                                        console.log('Manual check status:', data);
                                        if (data.status === 'paid' || data.status === 'RECEIVED' || data.status === 'COMPLETED' || data.status === 'PAID') {
                                            document.body.style.overflow = '';
                                            router.push('/result?pix=success');
                                            return;
                                        }
                                    } catch (error) {
                                        console.error('Error checking payment:', error);
                                    }
                                    setTimeout(() => setCheckingStatus(false), 2000);
                                }}
                            >
                                {checkingStatus ? 'Verificando...' : 'Já realizei o pagamento'}
                            </Button>

                            <button
                                className={styles.backButtonQr}
                                onClick={() => {
                                    setPixData(null);
                                    document.body.style.overflow = '';
                                    window.scrollTo({ top: 0, behavior: 'instant' });
                                }}
                            >
                                ← Voltar
                            </button>
                        </>
                    ) : (
                        /* Checkout Form */
                        <>
                            <h1 className={styles.title}>Finalizar Compra</h1>
                            <p className={styles.subtitle}>
                                Confirme seus dados e escolha a forma de pagamento
                            </p>

                            {/* Product Summary */}
                            <div className={styles.productSummary}>
                                <div className={styles.productInfo}>
                                    <span className={styles.productName}>Relatório Completo de Colorimetria</span>
                                    <span className={styles.productDesc}>Paleta + Guias de moda, maquiagem e acessórios</span>
                                </div>
                                <div className={styles.productPrice}>
                                    <span className={styles.priceOld}>R$ 97</span>
                                    <span className={styles.priceCurrent}>R$ 47</span>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className={styles.form}>
                                {/* User Data */}
                                <div className={styles.inputGroup}>
                                    <label className={styles.label}>Seu nome <span className={styles.required}>*</span></label>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        value={userData.name}
                                        onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                                        placeholder="Como podemos te chamar?"
                                        required
                                        title="Por favor, preencha seu nome"
                                        onInvalid={(e) => (e.target as HTMLInputElement).setCustomValidity('Por favor, preencha seu nome')}
                                        onInput={(e) => (e.target as HTMLInputElement).setCustomValidity('')}
                                    />
                                </div>

                                <div className={styles.inputGroup}>
                                    <label className={styles.label}>Seu email <span className={styles.required}>*</span></label>
                                    <input
                                        type="email"
                                        className={styles.input}
                                        value={userData.email}
                                        onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                                        placeholder="seu@email.com"
                                        required
                                        title="Por favor, insira um email válido"
                                        onInvalid={(e) => (e.target as HTMLInputElement).setCustomValidity('Por favor, insira um email válido')}
                                        onInput={(e) => (e.target as HTMLInputElement).setCustomValidity('')}
                                    />
                                </div>

                                <div className={styles.inputGroup}>
                                    <label className={styles.label}>CPF <span className={styles.required}>*</span></label>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9.-]*"
                                        className={styles.input}
                                        value={userData.cpf}
                                        onChange={(e) => setUserData({ ...userData, cpf: formatCPF(e.target.value) })}
                                        placeholder="000.000.000-00"
                                        maxLength={14}
                                        required
                                        title="Por favor, preencha seu CPF"
                                        onInvalid={(e) => (e.target as HTMLInputElement).setCustomValidity('Por favor, preencha seu CPF')}
                                        onInput={(e) => (e.target as HTMLInputElement).setCustomValidity('')}
                                    />
                                </div>

                                <div className={styles.inputGroup}>
                                    <label className={styles.label}>WhatsApp (opcional)</label>
                                    <input
                                        type="tel"
                                        className={styles.input}
                                        value={userData.whatsapp}
                                        onChange={(e) => setUserData({ ...userData, whatsapp: e.target.value })}
                                        placeholder="(00) 00000-0000"
                                    />
                                </div>

                                {/* Payment Method Selection */}
                                <div className={styles.paymentMethods}>
                                    <label className={styles.label}>Forma de pagamento</label>

                                    <div
                                        className={`${styles.paymentOption} ${paymentMethod === 'pix' ? styles.selected : ''}`}
                                        onClick={() => setPaymentMethod('pix')}
                                    >
                                        <div className={styles.paymentRadio}>
                                            <div className={styles.radioOuter}>
                                                {paymentMethod === 'pix' && <div className={styles.radioInner} />}
                                            </div>
                                        </div>
                                        <div className={styles.paymentContent}>
                                            <svg className={styles.paymentIconSvg} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                                                <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                                                <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                                                <rect x="14" y="14" width="3" height="3" fill="currentColor" />
                                                <rect x="18" y="14" width="3" height="3" fill="currentColor" />
                                                <rect x="14" y="18" width="3" height="3" fill="currentColor" />
                                                <rect x="18" y="18" width="3" height="3" fill="currentColor" />
                                            </svg>
                                            <div>
                                                <span className={styles.paymentName}>PIX</span>
                                                <span className={styles.paymentDesc}>Pagamento instantâneo</span>
                                            </div>
                                        </div>
                                        <span className={styles.paymentBadge}>Recomendado</span>
                                    </div>

                                    <div
                                        className={`${styles.paymentOption} ${paymentMethod === 'card' ? styles.selected : ''}`}
                                        onClick={() => setPaymentMethod('card')}
                                    >
                                        <div className={styles.paymentRadio}>
                                            <div className={styles.radioOuter}>
                                                {paymentMethod === 'card' && <div className={styles.radioInner} />}
                                            </div>
                                        </div>
                                        <div className={styles.paymentContent}>
                                            <svg className={styles.paymentIconSvg} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
                                                <line x1="2" y1="10" x2="22" y2="10" stroke="currentColor" strokeWidth="2" />
                                                <line x1="6" y1="15" x2="10" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                            </svg>
                                            <div>
                                                <span className={styles.paymentName}>Cartão de Crédito</span>
                                                <span className={styles.paymentDesc}>Visa, Mastercard, Elo...</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {error && <p className={styles.error}>{error}</p>}

                                <Button
                                    type="submit"
                                    className={styles.submitButton}
                                    disabled={loading}
                                >
                                    {loading ? 'Processando...' : `Pagar R$ 47,00 com ${paymentMethod === 'pix' ? 'PIX' : 'Cartão'}`}
                                </Button>

                                <p className={styles.security}>
                                    🔒 Pagamento 100% seguro
                                </p>
                            </form>

                            <div className={styles.guarantee}>
                                <svg className={styles.guaranteeIcon} width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 2L4 5V11.09C4 16.14 7.41 20.85 12 22C16.59 20.85 20 16.14 20 11.09V5L12 2ZM10.94 15.54L7.4 12L8.81 10.59L10.94 12.72L15.17 8.49L16.58 9.9L10.94 15.54Z" fill="url(#shieldGradient)" />
                                    <defs>
                                        <linearGradient id="shieldGradient" x1="4" y1="2" x2="20" y2="22" gradientUnits="userSpaceOnUse">
                                            <stop stopColor="#10B981" />
                                            <stop offset="1" stopColor="#059669" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                <div>
                                    <strong>Garantia de 7 dias</strong>
                                    <p>Se não gostar, devolvemos seu dinheiro sem perguntas.</p>
                                </div>
                            </div>
                        </>
                    )}
                </Card>

                {!pixData && (
                    <button
                        className={styles.backButton}
                        onClick={() => {
                            window.scrollTo({ top: 0, behavior: 'instant' });
                            router.back();
                        }}
                    >
                        ← Voltar
                    </button>
                )}
            </div>
        </main>
    );
}
