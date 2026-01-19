'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Modal from '@/components/Modal';
import { AnalysisLoading } from '@/components/AnalysisLoading';
import { useAnalysis } from '@/hooks/useAnalysis';

export default function UploadPage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [image, setImage] = useState<string | null>(null);
    const [compressedImage, setCompressedImage] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isValidating, setIsValidating] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const [isExiting, setIsExiting] = useState(false);

    // Error Modal State
    const [errorModalOpen, setErrorModalOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // Use the new analysis hook
    const analysis = useAnalysis();

    // Checkpoint verification - must have completed quiz
    useEffect(() => {
        const quizData = localStorage.getItem('aurapalette_quiz');
        if (!quizData) {
            router.push('/quiz');
            return;
        }
        setIsReady(true);
    }, [router]);

    // Handle navigation when analysis completes
    useEffect(() => {
        if (analysis.status === 'complete' && analysis.result) {
            // Store analysis result in localStorage
            localStorage.setItem('aurapalette_analysis', JSON.stringify(analysis.result));

            // Wait briefly to show 100% completion, then navigate
            const timer = setTimeout(() => {
                router.push('/preview');
            }, 500);

            return () => clearTimeout(timer);
        }
    }, [analysis.status, analysis.result, router]);

    // Handle analysis errors
    useEffect(() => {
        if (analysis.status === 'error' && analysis.error) {
            if (analysis.error.type === 'VALIDATION_ERROR') {
                // For validation errors, show modal and reset image
                setErrorMessage(analysis.error.message);
                setErrorModalOpen(true);
                setImage(null);
                setCompressedImage(null);
                analysis.reset();
            }
            // Other errors are handled by the AnalysisLoading component
        }
    }, [analysis.status, analysis.error, analysis]);

    const handleFileSelect = useCallback((file: File) => {
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setImage(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        handleFileSelect(file);
    }, [handleFileSelect]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback(() => {
        setIsDragging(false);
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFileSelect(file);
    };

    const handleAnalyze = async () => {
        if (!image) return;

        // Reset state
        setIsValidating(true);
        setErrorModalOpen(false);
        analysis.reset();

        try {
            // Compress image
            const { compressImage } = await import('@/utils/image');
            const compressed = await compressImage(image, 600, 0.7);
            setCompressedImage(compressed);

            // 1. FAST VALIDATION (keep this for quick feedback on bad photos)
            const validationResponse = await fetch('/api/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: compressed }),
            });

            const validationData = await validationResponse.json();

            if (!validationResponse.ok) {
                throw new Error(validationData.message || 'Sua foto não atende aos padrões.');
            }

            // Validation passed! Start transition to loading state
            setIsValidating(false);
            setIsExiting(true);

            // Store photo in localStorage
            localStorage.setItem('aurapalette_photo', compressed);

            // Wait for exit animation, then start analysis
            await new Promise(resolve => setTimeout(resolve, 300));
            setIsExiting(false);

            // Get quiz data
            const quizDataStr = localStorage.getItem('aurapalette_quiz');
            const quizData = quizDataStr ? JSON.parse(quizDataStr) : null;

            // Start streaming analysis
            analysis.analyze(compressed, quizData);

        } catch (error: unknown) {
            console.error('Validation error:', error);
            setIsValidating(false);

            let message = 'Sua foto não atende aos padrões. Tente outra foto.';
            if (error instanceof Error && error.message && error.message.length < 100) {
                message = error.message;
            }

            setErrorMessage(message);
            setErrorModalOpen(true);
            setImage(null);
        }
    };

    const handleRemoveImage = () => {
        setImage(null);
        setCompressedImage(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleRetry = () => {
        analysis.retry();
    };

    const handleCancelAnalysis = () => {
        analysis.reset();
        setImage(null);
        setCompressedImage(null);
    };

    // Show loading state during analysis
    if (analysis.status === 'analyzing' || analysis.status === 'complete') {
        const imageToShow = compressedImage || image || '';

        return (
            <main className={styles.page}>
                <div className={styles.orbPrimary} />
                <div className={styles.orbSecondary} />

                <div className={styles.container}>
                    <Card className={styles.card}>
                        <AnalysisLoading
                            imageSrc={imageToShow}
                            progress={analysis.progress}
                            currentStep={analysis.currentStep}
                            insights={analysis.insights}
                            error={analysis.error}
                            onRetry={handleRetry}
                            onCancel={handleCancelAnalysis}
                        />
                    </Card>
                </div>
            </main>
        );
    }

    // Show error state in loading component for non-validation errors
    if (analysis.status === 'error' && analysis.error?.type !== 'VALIDATION_ERROR') {
        const imageToShow = compressedImage || image || '';

        return (
            <main className={styles.page}>
                <div className={styles.orbPrimary} />
                <div className={styles.orbSecondary} />

                <div className={styles.container}>
                    <Card className={styles.card}>
                        <AnalysisLoading
                            imageSrc={imageToShow}
                            progress={analysis.progress}
                            currentStep={analysis.currentStep}
                            insights={analysis.insights}
                            error={analysis.error}
                            onRetry={handleRetry}
                            onCancel={handleCancelAnalysis}
                        />
                    </Card>
                </div>
            </main>
        );
    }

    // UPLOAD SCREEN
    return (
        <main className={styles.page}>
            <div className={styles.orbPrimary} />
            <div className={styles.orbSecondary} />

            <div className={styles.container}>
                <Card className={`${styles.card} ${isExiting ? styles.cardExiting : ''}`}>
                    <h1 className={styles.title}>Tire sua selfie</h1>
                    <p className={styles.subtitle}>
                        Envie uma foto do seu rosto para análise de colorimetria
                    </p>

                    {!image ? (
                        <div
                            className={`${styles.uploadZone} ${isDragging ? styles.uploadZoneDragging : ''}`}
                            onClick={() => fileInputRef.current?.click()}
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleInputChange}
                                className={styles.uploadInput}
                            />
                            <p className={styles.uploadTitle}>
                                Arraste sua foto aqui
                            </p>
                            <p className={styles.uploadOr}>ou</p>
                            <Button variant="secondary" size="small">
                                Escolher arquivo
                            </Button>
                            <p className={styles.uploadText}>
                                PNG, JPG até 10MB
                            </p>
                        </div>
                    ) : (
                        <div className={styles.preview}>
                            <img
                                src={image}
                                alt="Preview"
                                className={styles.previewImage}
                            />
                            <button
                                className={styles.removeButton}
                                onClick={handleRemoveImage}
                            >
                                ✕
                            </button>
                        </div>
                    )}

                    <div className={styles.tips}>
                        <h4 className={styles.tipsTitle}>
                            Dicas para uma foto perfeita
                        </h4>
                        <ul className={styles.tipsList}>
                            <li className={styles.tip}>
                                <span className={styles.tipIcon}>✓</span>
                                Use iluminação natural
                            </li>
                            <li className={styles.tip}>
                                <span className={styles.tipIcon}>✓</span>
                                Rosto limpo, sem maquiagem pesada
                            </li>
                            <li className={styles.tip}>
                                <span className={styles.tipIcon}>✓</span>
                                Olhe diretamente para a câmera
                            </li>
                            <li className={styles.tip}>
                                <span className={styles.tipIcon}>✓</span>
                                Fundo neutro
                            </li>
                        </ul>
                    </div>

                    {image && (
                        <div className={styles.actions}>
                            <Button
                                variant="primary"
                                fullWidth
                                size="large"
                                onClick={handleAnalyze}
                                loading={isValidating}
                            >
                                {isValidating ? 'Verificando foto...' : 'Analisar minha foto'}
                            </Button>
                        </div>
                    )}
                </Card>

                <Modal
                    isOpen={errorModalOpen}
                    onClose={() => setErrorModalOpen(false)}
                    title="Atenção"
                    buttonText="Entendi, vou tentar de novo"
                >
                    <div style={{ textAlign: 'center', marginBottom: '24px', width: '100%' }}>
                        <p style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '20px', fontSize: '1.1rem', lineHeight: '1.5' }}>
                            {errorMessage}
                        </p>

                        <div style={{
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: '12px',
                            padding: '16px',
                            textAlign: 'left',
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}>
                            <p style={{
                                color: 'rgba(255,255,255,0.7)',
                                fontSize: '0.8rem',
                                marginBottom: '12px',
                                textAlign: 'center',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }}>
                                Como tirar a foto ideal:
                            </p>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'rgba(255,255,255,0.95)', fontSize: '0.9rem' }}>
                                    <span style={{ fontSize: '1.1rem' }}>☀️</span>
                                    <span>Procure um local <strong>bem iluminado</strong></span>
                                </li>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'rgba(255,255,255,0.95)', fontSize: '0.9rem' }}>
                                    <span style={{ fontSize: '1.1rem' }}>🚫</span>
                                    <span>Evite filtros ou <strong>maquiagem pesada</strong></span>
                                </li>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'rgba(255,255,255,0.95)', fontSize: '0.9rem' }}>
                                    <span style={{ fontSize: '1.1rem' }}>👤</span>
                                    <span>Mantenha o <strong>rosto visível</strong></span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </Modal>
            </div>
        </main>
    );
}
