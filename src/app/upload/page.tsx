'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Modal from '@/components/Modal';

const ANALYSIS_STEPS = [
    'Detectando características faciais...',
    'Analisando tom de pele...',
    'Calculando contraste pessoal...',
    'Identificando subtom...',
    'Mapeando paleta de cores...',
    'Gerando recomendações...',
    'Finalizando análise...',
];

export default function UploadPage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [image, setImage] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isValidating, setIsValidating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentStep, setCurrentStep] = useState(0);
    const [isReady, setIsReady] = useState(false);

    // API completion timestamp (false = not complete, number = timestamp when complete)
    const apiCompleteRef = useRef<number | false>(false);
    const apiDataRef = useRef<any>(null);

    // Error Modal State
    const [errorModalOpen, setErrorModalOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // Checkpoint verification - must have completed quiz
    useEffect(() => {
        const quizData = localStorage.getItem('aurapalette_quiz');
        if (!quizData) {
            router.push('/quiz');
            return;
        }
        setIsReady(true);
    }, [router]);

    // SMOOTH LOADING ANIMATION - v3
    // - Uses easing curve for natural progress feel
    // - Minimum 10 seconds of loading (feels like real AI analysis)
    // - Uses requestAnimationFrame for 60fps smooth animation
    // - When API completes, smoothly transitions to 100%
    // - Never gets stuck - always progressing
    useEffect(() => {
        if (!isAnalyzing) return;

        const MINIMUM_DURATION = 10000; // 10 seconds minimum
        const TARGET_BEFORE_API = 85; // Progress to 85% before waiting for API
        const startTime = Date.now();
        let animationFrameId: number;
        let lastProgress = 0;

        // Easing function - ease-out-cubic for natural deceleration
        const easeOutCubic = (t: number): number => {
            return 1 - Math.pow(1 - t, 3);
        };

        // Animate function using requestAnimationFrame for 60fps
        const animate = () => {
            const elapsed = Date.now() - startTime;
            let targetProgress: number;

            if (apiCompleteRef.current) {
                // API completed - smoothly accelerate to 100%
                // Calculate how much time passed since API completed
                const apiCompleteTime = apiCompleteRef.current;
                const timeSinceComplete = Date.now() - apiCompleteTime;
                const transitionDuration = 1500; // 1.5 seconds to go from current to 100%

                const transitionProgress = Math.min(timeSinceComplete / transitionDuration, 1);
                const easedTransition = easeOutCubic(transitionProgress);

                targetProgress = lastProgress + (100 - lastProgress) * easedTransition;

                if (targetProgress >= 99.9) {
                    targetProgress = 100;
                    setProgress(100);

                    // Update step to final
                    setCurrentStep(ANALYSIS_STEPS.length - 1);

                    // Wait a moment showing 100% before redirecting
                    setTimeout(() => {
                        setIsAnalyzing(false);
                        router.push('/preview');
                    }, 500);
                    return;
                }
            } else {
                // API still running - progress smoothly to TARGET_BEFORE_API
                if (elapsed < MINIMUM_DURATION) {
                    // During minimum duration: progress from 0 to TARGET_BEFORE_API
                    const normalizedTime = elapsed / MINIMUM_DURATION;
                    targetProgress = easeOutCubic(normalizedTime) * TARGET_BEFORE_API;
                } else {
                    // After minimum duration: slowly creep from TARGET_BEFORE_API to 98%
                    // Very slow progress so it never looks stuck but doesn't reach 100
                    const extraTime = elapsed - MINIMUM_DURATION;
                    const slowProgress = Math.min(extraTime / 60000, 1); // 60 more seconds to reach 98%
                    targetProgress = TARGET_BEFORE_API + (98 - TARGET_BEFORE_API) * easeOutCubic(slowProgress);
                }
            }

            // Smooth interpolation - never jump more than 0.5% per frame
            const maxDelta = 0.5;
            const delta = targetProgress - lastProgress;
            const smoothedProgress = lastProgress + Math.min(Math.max(delta, -maxDelta), maxDelta * 2);

            lastProgress = smoothedProgress;
            setProgress(smoothedProgress);

            // Update step text based on progress
            const stepIndex = Math.min(
                Math.floor((smoothedProgress / 100) * ANALYSIS_STEPS.length),
                ANALYSIS_STEPS.length - 1
            );
            setCurrentStep(stepIndex);

            animationFrameId = requestAnimationFrame(animate);
        };

        animationFrameId = requestAnimationFrame(animate);

        return () => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
        };
    }, [isAnalyzing, router]);

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
        apiCompleteRef.current = false;
        apiDataRef.current = null;

        // Safety timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000);

        try {
            // Compress image
            const { compressImage } = await import('@/utils/image');
            const compressedImage = await compressImage(image, 600, 0.7);

            // 1. FAST VALIDATION
            const validationResponse = await fetch('/api/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: compressedImage }),
            });

            const validationData = await validationResponse.json();

            if (!validationResponse.ok) {
                throw new Error(validationData.message || 'Sua foto não atende aos padrões.');
            }

            // Validation passed! Start loading animation
            setIsValidating(false);
            setIsAnalyzing(true);
            setProgress(0);
            setCurrentStep(0);

            // Store image
            localStorage.setItem('aurapalette_photo', compressedImage);

            // 2. BACKGROUND ANALYSIS
            const quizDataStr = localStorage.getItem('aurapalette_quiz');
            const quizData = quizDataStr ? JSON.parse(quizDataStr) : null;

            fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: compressedImage, quizData }),
                signal: controller.signal
            })
                .then(async (res) => {
                    clearTimeout(timeoutId);
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.message || 'Falha na análise');

                    // Save data and signal completion
                    localStorage.setItem('aurapalette_analysis', JSON.stringify(data));
                    apiDataRef.current = data;
                    apiCompleteRef.current = Date.now(); // Store timestamp to calculate smooth transition
                })
                .catch((err) => {
                    console.error('Analysis failed:', err);

                    let errorMsg = 'Erro ao processar análise. Tente novamente.';
                    if (err.name === 'AbortError') {
                        errorMsg = 'Análise demorou muito. Tente uma foto menor.';
                    }

                    setErrorMessage(errorMsg);
                    setErrorModalOpen(true);
                    setIsAnalyzing(false);
                    setImage(null);
                });

        } catch (error: any) {
            clearTimeout(timeoutId);
            console.error('Validation error:', error);
            setIsValidating(false);

            let message = 'Sua foto não atende aos padrões. Tente outra foto.';
            if (error.message && error.message.length < 100) {
                message = error.message;
            }

            setErrorMessage(message);
            setErrorModalOpen(true);
            setImage(null);
        }
    };

    const handleRemoveImage = () => {
        setImage(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // LOADING SCREEN
    if (isAnalyzing) {
        return (
            <main className={styles.page}>
                <div className={styles.orbPrimary} />
                <div className={styles.orbSecondary} />

                <div className={styles.container}>
                    <Card className={styles.card}>
                        <div className={styles.loadingState}>
                            {/* Photo with scanner effect */}
                            <div className={styles.scannerContainer}>
                                <div className={styles.scannerFrame}>
                                    <img
                                        src={image || ''}
                                        alt="Sua foto"
                                        className={styles.scannerPhoto}
                                    />
                                    <div className={styles.scanLine} />
                                    <div className={styles.scanGlow} />
                                    <div className={`${styles.cornerMarker} ${styles.cornerTopLeft}`} />
                                    <div className={`${styles.cornerMarker} ${styles.cornerTopRight}`} />
                                    <div className={`${styles.cornerMarker} ${styles.cornerBottomLeft}`} />
                                    <div className={`${styles.cornerMarker} ${styles.cornerBottomRight}`} />
                                </div>
                            </div>

                            {/* Progress bar */}
                            <div className={styles.progressContainer}>
                                <span className={styles.progressPercent}>{Math.round(progress)}%</span>
                                <div className={styles.progressTrack}>
                                    <div
                                        className={styles.progressFill}
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>

                            {/* Current step text */}
                            <p className={styles.loadingText}>
                                {ANALYSIS_STEPS[currentStep]}
                            </p>

                            {/* Steps indicator */}
                            <div className={styles.stepsIndicator}>
                                {ANALYSIS_STEPS.map((_, index) => (
                                    <div
                                        key={index}
                                        className={`${styles.stepDot} ${index <= currentStep ? styles.stepDotActive : ''}`}
                                    />
                                ))}
                            </div>

                            <p className={styles.loadingSubtext}>
                                Aguarde enquanto nossa IA analisa sua colorimetria
                            </p>
                        </div>
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
                <Card className={styles.card}>
                    <h1 className={styles.title}>Tire sua selfie 📸</h1>
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
                            💡 Dicas para uma foto perfeita
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
                                {isValidating ? 'Verificando foto...' : 'Analisar minha foto ✨'}
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
