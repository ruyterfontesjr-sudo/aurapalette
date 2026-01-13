'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
    const router = useRouter();
    const { user, signIn, loading: authLoading } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Redirect if already logged in
    useEffect(() => {
        if (user && !authLoading) {
            // Check if user has report
            const hasReport = localStorage.getItem('aurapalette_analysis');
            if (hasReport) {
                router.push('/result');
            } else {
                router.push('/quiz');
            }
        }
    }, [user, authLoading, router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { error: signInError } = await signIn(email, password);

            if (signInError) {
                if (signInError.message.includes('Invalid login')) {
                    setError('Email ou senha incorretos.');
                } else {
                    setError(signInError.message || 'Erro ao fazer login.');
                }
                setLoading(false);
                return;
            }

            // Check for existing report
            const hasReport = localStorage.getItem('aurapalette_analysis');
            if (hasReport) {
                router.push('/result');
            } else {
                router.push('/quiz');
            }
        } catch {
            setError('Erro ao fazer login. Tente novamente.');
            setLoading(false);
        }
    };

    return (
        <main className={styles.page}>
            <div className={styles.bgGradient} />

            <div className={styles.container}>

                <Card className={styles.card}>
                    <h1 className={styles.title}>Bem-vinda de volta! 👋</h1>
                    <p className={styles.subtitle}>
                        Entre na sua conta para acessar seu relatório
                    </p>

                    {error && <p className={styles.error}>{error}</p>}

                    <form onSubmit={handleLogin} className={styles.form}>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="seu@email.com"
                                className={styles.input}
                                required
                                title="Por favor, insira um email válido"
                                onInvalid={(e) => (e.target as HTMLInputElement).setCustomValidity('Por favor, insira um email válido')}
                                onInput={(e) => (e.target as HTMLInputElement).setCustomValidity('')}
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Senha</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Sua senha"
                                className={styles.input}
                                required
                                title="Por favor, insira sua senha"
                                onInvalid={(e) => (e.target as HTMLInputElement).setCustomValidity('Por favor, insira sua senha')}
                                onInput={(e) => (e.target as HTMLInputElement).setCustomValidity('')}
                            />
                        </div>

                        <Button
                            type="submit"
                            variant="primary"
                            fullWidth
                            loading={loading}
                            className={styles.submitButton}
                        >
                            Entrar
                        </Button>
                    </form>

                    <p className={styles.signupLink}>
                        Não tem conta? <Link href="/signup">Criar conta</Link>
                    </p>
                </Card>
            </div>
        </main>
    );
}
