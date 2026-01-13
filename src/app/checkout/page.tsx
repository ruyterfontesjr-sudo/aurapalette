'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import Card from '@/components/Card';
import Logo from '@/components/Logo';
import Button from '@/components/Button';

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
    const [userData, setUserData] = useState<UserData>({ name: '', email: '', whatsapp: '', cpf: '' });
    const [paymentMethod, setPaymentMethod] = useState<'card' | 'pix'>('pix');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [pixData, setPixData] = useState<PixData | null>(null);
    const [checkingStatus, setCheckingStatus] = useState(false);

    useEffect(() => {
        // Load user data from localStorage
        const storedUser = localStorage.getItem('aurapalette_user');
        if (storedUser) {
            const parsed = JSON.parse(storedUser);
            setUserData({
                name: parsed.name || '',
                email: parsed.email || '',
                whatsapp: parsed.whatsapp || '',
                cpf: parsed.cpf || '',
            });
        }
    }, []);

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
                    // Scroll to top when QR code appears
                    window.scrollTo({ top: 0, behavior: 'instant' });
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

    return (
        <main className={styles.page}>
            <div className={styles.bgGradient} />
            <div className={styles.orbPrimary} />
            <div className={styles.orbSecondary} />

            <div className={styles.container}>
                <div className={styles.logoContainer}>
                    <Logo />
                </div>

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
                                        if (data.status === 'RECEIVED' || data.status === 'COMPLETED') {
                                            router.push('/result?pix=success');
                                        }
                                    } catch {
                                        // Silent fail, just stop loading
                                    }
                                    setTimeout(() => setCheckingStatus(false), 2000);
                                }}
                            >
                                {checkingStatus ? 'Verificando...' : 'Já realizei o pagamento'}
                            </Button>

                            <button
                                className={styles.backButtonQr}
                                onClick={() => setPixData(null)}
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
                                    <label className={styles.label}>Seu nome</label>
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
                                    <label className={styles.label}>Seu email</label>
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
                                    <label className={styles.label}>CPF {paymentMethod === 'pix' && <span className={styles.required}>*</span>}</label>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        value={userData.cpf}
                                        onChange={(e) => setUserData({ ...userData, cpf: formatCPF(e.target.value) })}
                                        placeholder="000.000.000-00"
                                        maxLength={14}
                                        required={paymentMethod === 'pix'}
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
                                <span className={styles.guaranteeIcon}>✅</span>
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
                        onClick={() => router.back()}
                    >
                        ← Voltar
                    </button>
                )}
            </div>
        </main>
    );
}
