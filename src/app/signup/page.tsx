'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Logo from '@/components/Logo';
import { useAuth } from '@/contexts/AuthContext';

export default function SignupPage() {
    const router = useRouter();
    const { user, signUp } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        whatsapp: '',
    });

    // Redirect if already logged in
    useEffect(() => {
        if (user) {
            router.push('/upload');
        }
    }, [user, router]);

    // Máscara para WhatsApp
    const formatWhatsApp = (value: string) => {
        const numbers = value.replace(/\D/g, '');
        if (numbers.length <= 2) return numbers;
        if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
        if (numbers.length <= 11) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
        return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Sign up with Supabase
            const { error: signUpError } = await signUp(formData.email, formData.password, formData.name);

            if (signUpError) {
                setError(signUpError.message || 'Erro ao criar conta');
                setLoading(false);
                return;
            }

            // Save additional data to localStorage for now
            localStorage.setItem('aurapalette_user', JSON.stringify({
                name: formData.name,
                email: formData.email,
                whatsapp: formData.whatsapp,
            }));
            localStorage.setItem('aurapalette_email', formData.email);

            // Navigate to upload
            router.push('/upload');
        } catch {
            setError('Erro ao criar conta. Tente novamente.');
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        if (name === 'whatsapp') {
            setFormData(prev => ({
                ...prev,
                whatsapp: formatWhatsApp(value),
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    return (
        <main className={styles.page}>
            <div className={styles.orbPrimary} />
            <div className={styles.orbSecondary} />

            <div className={styles.container}>
                <Link href="/" className={styles.backButton}>
                    ← Voltar
                </Link>

                <div className={styles.logoContainer}>
                    <Logo size="large" />
                </div>

                <Card className={styles.card}>
                    <h1 className={styles.title}>Crie sua conta ✨</h1>
                    <p className={styles.subtitle}>
                        Seus resultados ficarão salvos na sua conta
                    </p>

                    {error && <p className={styles.error}>{error}</p>}

                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Seu nome</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Como podemos te chamar?"
                                className={styles.input}
                                required
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Seu melhor email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="seu@email.com"
                                className={styles.input}
                                required
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Crie uma senha</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Mínimo 6 caracteres"
                                className={styles.input}
                                minLength={6}
                                required
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.label}>
                                WhatsApp <span className={styles.optional}>(opcional)</span>
                            </label>
                            <input
                                type="tel"
                                name="whatsapp"
                                value={formData.whatsapp}
                                onChange={handleChange}
                                placeholder="(00) 00000-0000"
                                className={styles.input}
                            />
                        </div>

                        <Button
                            type="submit"
                            variant="primary"
                            fullWidth
                            loading={loading}
                            className={styles.submitButton}
                        >
                            Criar conta e continuar →
                        </Button>
                    </form>

                    <p className={styles.loginLink}>
                        Já tem uma conta? <Link href="/login">Entrar</Link>
                    </p>

                    <p className={styles.terms}>
                        Ao continuar, você concorda com nossos{' '}
                        <Link href="/termos">Termos de Uso</Link> e{' '}
                        <Link href="/privacidade">Política de Privacidade</Link>
                    </p>
                </Card>
            </div>
        </main>
    );
}
