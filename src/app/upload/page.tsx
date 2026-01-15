'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Modal from '@/components/Modal';

const ANALYSIS_STEPS = [
    { text: 'Detectando características faciais...', duration: 3000 },
    { text: 'Analisando tom de pele...', duration: 3500 },
    { text: 'Identificando subtom...', duration: 3000 },
    { text: 'Mapeando paleta de cores...', duration: 3500 },
    { text: 'Gerando recomendações personalizadas...', duration: 2500 },
    { text: 'Finalizando seu relatório...', duration: 1500 },
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
    useEffect(() => {
        if (!isAnalyzing) return;

        let stepIndex = 0;
        let elapsed = 0;
        const totalDuration = ANALYSIS_STEPS.reduce((acc, step) => acc + step.duration, 0);

        const runStep = () => {
            if (stepIndex >= ANALYSIS_STEPS.length) {
                // Animation complete - finish up
                if (analyzedData) {
                    localStorage.setItem('aurapalette_analysis', JSON.stringify(analyzedData));
                    router.push('/preview');
                } else {
                    // Data not ready yet? Wait a bit and check again (Spinning state)
                    setTimeout(runStep, 1000);
                    return;
                }
                return;
            }

            setCurrentStep(stepIndex);
            const stepDuration = ANALYSIS_STEPS[stepIndex].duration;

            // Progress animation within each step
            const progressInterval = setInterval(() => {
                elapsed += 50;
                const totalProgress = (elapsed / totalDuration) * 100;
                setProgress(Math.min(totalProgress, 100));
            }, 50);

            setTimeout(() => {
                clearInterval(progressInterval);
                stepIndex++;
                runStep();
            }, stepDuration);
        };

        runStep();
    }, [isAnalyzing, analyzedData, router]);

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

        try {
            // Compress image to ~800px max (drastically reduces payload size from 4MB+ to ~300KB)
            // Dynamic import to avoid SSR issues if any
            const { compressImage } = await import('@/utils/image');
            const compressedImage = await compressImage(image, 800, 0.8);

            // 1. FAST VALIDATION (gpt-4o-mini)
            // This checks "Is it a face?" very quickly (~2-3s)
            const validationResponse = await fetch('/api/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: compressedImage }),
            });

            const validationData = await validationResponse.json();

            if (!validationResponse.ok) {
                // Determine specific error message
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
            // This runs while the theatrical animation plays (~15s)
            // Retrieve quiz data for context
            const quizDataStr = localStorage.getItem('aurapalette_quiz');
            const quizData = quizDataStr ? JSON.parse(quizDataStr) : null;

            localStorage.setItem('aurapalette_photo', compressedImage); // Store optimized image

            // This promise runs in parallel with the animation
            fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: compressedImage, quizData }),
            })
                .then(async (res) => {
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.message || 'Falha na análise profunda');
                    setAnalyzedData(data); // This triggers the animation to finish when ready
                })
                .catch((err) => {
                    console.error('Background analysis failed:', err);
                    // If this fails, we need to stop the animation and show error
                    setErrorMessage('Ocorreu um erro ao processar sua análise completa. Por favor, tente novamente.');
                    setErrorModalOpen(true);
                    setIsAnalyzing(false); // Stop animation and go back
                    setImage(null);
                });

        } catch (error: any) {
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
                                {ANALYSIS_STEPS[currentStep]?.text || 'Analisando...'}
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
