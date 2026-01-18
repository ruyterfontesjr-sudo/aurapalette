'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Modal from '@/components/Modal';

const ANALYSIS_STEPS = [
    { text: 'Detectando características faciais...', duration: 3000 },
    { text: 'Analisando tom de pele e complexidade...', duration: 4000 },
    { text: 'Calculando contraste pessoal...', duration: 4000 },
    { text: 'Identificando subtom (Quente/Frio)...', duration: 4000 },
    { text: 'Mapeando paleta de cores ideal...', duration: 4000 },
    { text: 'Gerando recomendações de estilo...', duration: 3000 },
    { text: 'Escrevendo análise personalizada...', duration: 3000 },
];

export default function UploadPage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [image, setImage] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isValidating, setIsValidating] = useState(false);
    const [analyzedData, setAnalyzedData] = useState<any>(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [progress, setProgress] = useState(0);
    const [isReady, setIsReady] = useState(false);
    // State to show "almost there" message
    const [isLongWait, setIsLongWait] = useState(false);

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

    // Analysis loading effect with psychological timing
    // Refs to avoid stale closures in setTimeout/setInterval
    const analyzedDataRef = useRef<any>(null);
    useEffect(() => {
        analyzedDataRef.current = analyzedData;
    }, [analyzedData]);

    // Analysis loading effect
    useEffect(() => {
        if (!isAnalyzing) return;

        let stepIndex = 0;
        let elapsed = 0;
        const totalDuration = ANALYSIS_STEPS.reduce((acc, step) => acc + step.duration, 0);

        // Timers references for cleanup
        let stepTimeout: NodeJS.Timeout;
        let progressInterval: NodeJS.Timeout;
        let loopTimeout: NodeJS.Timeout;

        const runStep = () => {
            if (stepIndex >= ANALYSIS_STEPS.length) {
                // Animation complete - Check if data is ready using REF
                if (analyzedDataRef.current) {
                    setProgress(100); // Visual completion
                    localStorage.setItem('aurapalette_analysis', JSON.stringify(analyzedDataRef.current));
                    // Redirect immediately
                    router.push('/preview');
                } else {
                    // Data not ready yet? Wait a bit and check again
                    setIsLongWait(true);
                    loopTimeout = setTimeout(runStep, 500);
                }
                return;
            }

            setCurrentStep(stepIndex);
            const stepDuration = ANALYSIS_STEPS[stepIndex].duration;

            // Progress animation - always run to completion (don't jump to 100 early)
            // Non-linear easing: VERY fast start, slow finish for psychological effect
            const easeProgress = (linear: number): number => {
                // 0-50% time = 0-70% displayed (VERY fast - creates excitement)
                // 50-85% time = 70-92% displayed (medium - building tension)  
                // 85-100% time = 92-99% displayed (SLOW - builds anticipation)
                if (linear <= 0.5) {
                    return (linear / 0.5) * 0.70;
                } else if (linear <= 0.85) {
                    return 0.70 + ((linear - 0.5) / 0.35) * 0.22;
                } else {
                    return 0.92 + ((linear - 0.85) / 0.15) * 0.07;
                }
            };

            progressInterval = setInterval(() => {
                elapsed += 50;
                const linearProgress = elapsed / totalDuration;
                const easedProgress = easeProgress(Math.min(linearProgress, 1)) * 100;
                // Always cap at 99% until animation completes naturally
                setProgress(Math.min(easedProgress, 99));
            }, 50);

            stepTimeout = setTimeout(() => {
                clearInterval(progressInterval);
                stepIndex++;
                runStep();
            }, stepDuration);
        };

        runStep();

        // Cleanup function
        return () => {
            clearTimeout(stepTimeout);
            clearInterval(progressInterval);
            clearTimeout(loopTimeout);
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

        // Step 1: Pre-validation (User stays on upload screen)
        setIsValidating(true);
        setErrorModalOpen(false);
        setAnalyzedData(null); // Reset previous data
        setIsLongWait(false);

        // Create safety controller for the entire process
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s max safety timeout

        try {
            // Compress image to ~600px max (drastically reduces payload size and speeds up AI)
            const { compressImage } = await import('@/utils/image');
            const compressedImage = await compressImage(image, 600, 0.7);

            // 1. FAST VALIDATION (gpt-4o-mini)
            const validationResponse = await fetch('/api/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: compressedImage }),
            });

            const validationData = await validationResponse.json();

            if (!validationResponse.ok) {
                let msg = 'Sua foto não atende aos padrões.';
                if (validationData.message) msg = validationData.message;
                throw new Error(msg);
            }

            // Validation Passed! Start the UI fun immediately
            setIsValidating(false);
            setIsAnalyzing(true);
            setCurrentStep(0);
            setProgress(0);

            // 2. BACKGROUND FULL ANALYSIS (gpt-4o)
            const quizDataStr = localStorage.getItem('aurapalette_quiz');
            const quizData = quizDataStr ? JSON.parse(quizDataStr) : null;

            localStorage.setItem('aurapalette_photo', compressedImage); // Store optimized image

            // This promise runs in parallel with the animation
            fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: compressedImage, quizData }),
                signal: controller.signal // Bind safety timeout
            })
                .then(async (res) => {
                    clearTimeout(timeoutId); // Clear timeout on response
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.message || 'Falha na análise profunda');

                    // IMMEDIATELY save, set 100%, and redirect - don't wait for animation
                    localStorage.setItem('aurapalette_analysis', JSON.stringify(data));
                    setProgress(100);
                    setIsAnalyzing(false);
                    router.push('/preview');
                })
                .catch((err) => {
                    console.error('Background analysis failed:', err);

                    let errorMsg = 'Ocorreu um erro ao processar sua análise. Por favor, tente novamente.';
                    if (err.name === 'AbortError') {
                        errorMsg = 'A análise demorou muito e foi interrompida. Tente uma foto menor ou conexão melhor.';
                    }

                    // Force animation stop
                    setErrorMessage(errorMsg);
                    setErrorModalOpen(true);
                    setIsAnalyzing(false);
                    setImage(null);
                });

        } catch (error: any) {
            clearTimeout(timeoutId);
            console.error('Validation error:', error);
            setIsValidating(false);

            let message = 'Sua foto não atende aos padrões de imagem exigidos. Por favor, tente novamente com outra foto.';
            if (error.message && error.message.length < 100 && !error.message.includes('fetch')) {
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
                                    {/* Corner markers */}
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
                                {isLongWait
                                    ? 'Estamos finalizando sua análise detalhada, falta pouco...'
                                    : (ANALYSIS_STEPS[currentStep]?.text || 'Analisando...')}
                            </p>

                            {/* Steps indicator */}
                            <div className={styles.stepsIndicator}>
                                {ANALYSIS_STEPS.map((_, index) => (
                                    <div
                                        key={index}
                                        className={`${styles.stepDot} ${index <= currentStep ? styles.stepDotActive : ''
                                            }`}
                                    />
                                ))}
                            </div>

                            <p className={styles.loadingSubtext}>
                                Aguarde enquanto nossa IA analisa sua colorimetria pessoal
                            </p>
                        </div>
                    </Card>
                </div>
            </main>
        );
    }

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
                                Use iluminação natural (perto de uma janela)
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
                                Fundo neutro (branco ou claro)
                            </li>
                            <li className={styles.tip}>
                                <span className={styles.tipIcon}>✓</span>
                                Cabelo natural visível (sem boné ou lenço)
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
