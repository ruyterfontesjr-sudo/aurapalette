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

// Map SSE step IDs to step indices and target progress
const STEP_MAP: Record<string, { index: number; targetProgress: number }> = {
    'detecting_face': { index: 0, targetProgress: 15 },
    'analyzing_skin': { index: 1, targetProgress: 30 },
    'analyzing_eyes': { index: 2, targetProgress: 45 },
    'calculating_contrast': { index: 2, targetProgress: 50 },
    'identifying_undertone': { index: 3, targetProgress: 65 },
    'generating_palette': { index: 4, targetProgress: 80 },
    'finalizing': { index: 5, targetProgress: 92 },
};

export default function UploadPage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [image, setImage] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [displayProgress, setDisplayProgress] = useState(0);
    const [currentStep, setCurrentStep] = useState(0);
    const [isReady, setIsReady] = useState(false);
    const [isComplete, setIsComplete] = useState(false);

    // Error Modal State
    const [errorModalOpen, setErrorModalOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // Linear progress animation - Variable speed
    useEffect(() => {
        if (!isAnalyzing || isComplete) return;

        let timeoutId: NodeJS.Timeout;

        const updateProgress = () => {
            setDisplayProgress(prev => {
                if (prev >= 99) return prev;

                // Slow down significantly as we get closer to 99%
                // < 30%: Fast
                // < 60%: Medium
                // < 85%: Slow
                // > 85%: Crawling

                // Only increment sometimes to create a "thinking" effect
                // Higher probability of stalling as we get higher
                const stallProbability = prev > 85 ? 0.7 : prev > 60 ? 0.4 : 0.1;

                if (Math.random() > stallProbability) {
                    return prev + 1;
                }
                return prev;
            });

            // Adjust speed based on progress
            const current = displayProgress;
            // Delays get longer: 150ms -> 300ms -> 800ms -> 1500ms
            const delay = current < 30 ? 150 : current < 60 ? 300 : current < 85 ? 800 : 1500;

            timeoutId = setTimeout(updateProgress, delay);
        };

        updateProgress();

        return () => clearTimeout(timeoutId);
    }, [isAnalyzing, isComplete, displayProgress]);

    // Checkpoint verification - must have completed quiz
    useEffect(() => {
        // Check if user should be at a different stage
        const checkpoint = localStorage.getItem('aurapalette_checkpoint');
        if (checkpoint) {
            try {
                const { currentStage } = JSON.parse(checkpoint);
                if (currentStage === 'preview' || currentStage === 'checkout' || currentStage === 'result') {
                    router.replace('/preview');
                    return;
                }
            } catch {
                // Invalid checkpoint
            }
        }

        const quizData = localStorage.getItem('aurapalette_quiz');
        if (!quizData) {
            router.replace('/quiz');
            return;
        }

        // Set checkpoint to upload stage
        localStorage.setItem('aurapalette_checkpoint', JSON.stringify({
            currentStage: 'upload',
            completedStages: ['signup', 'quiz', 'upload'],
            lastUpdated: new Date().toISOString(),
        }));

        setIsReady(true);
    }, [router]);

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
        setErrorModalOpen(false);
        setIsComplete(false);

        try {
            // Compress image
            const { compressImage } = await import('@/utils/image');
            const compressedImage = await compressImage(image, 800, 0.85);

            // Start loading animation immediately (no validation step)
            setIsAnalyzing(true);
            setDisplayProgress(0);
            setCurrentStep(0);

            // Store image
            localStorage.setItem('aurapalette_photo', compressedImage);

            // Get quiz data
            const quizDataStr = localStorage.getItem('aurapalette_quiz');
            const quizData = quizDataStr ? JSON.parse(quizDataStr) : null;

            // STREAMING ANALYSIS via SSE (no validation, go straight to analysis)
            const response = await fetch('/api/analyze-stream', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: compressedImage, quizData }),
            });

            if (!response.ok) {
                throw new Error('Falha ao iniciar análise');
            }

            const reader = response.body?.getReader();
            if (!reader) {
                throw new Error('Stream não disponível');
            }

            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (!line.startsWith('data: ')) continue;

                    try {
                        const event = JSON.parse(line.slice(6));

                        switch (event.type) {
                            case 'step':
                                // Update step label from SSE
                                if (event.step && STEP_MAP[event.step]) {
                                    setCurrentStep(STEP_MAP[event.step].index);
                                }
                                break;

                            case 'complete':
                                if (event.result) {
                                    // Save result
                                    localStorage.setItem('aurapalette_analysis', JSON.stringify(event.result));

                                    // Mark complete and jump to 100%
                                    setIsComplete(true);
                                    setDisplayProgress(100);
                                    setCurrentStep(ANALYSIS_STEPS.length - 1);

                                    // Navigate directly without showing upload screen
                                    setTimeout(() => {
                                        router.push('/preview');
                                    }, 300);
                                }
                                return;

                            case 'error':
                                throw new Error(event.error?.message || 'Erro na análise');
                        }
                    } catch (parseError) {
                        // Skip malformed events
                        if (parseError instanceof SyntaxError) continue;
                        throw parseError;
                    }
                }
            }

        } catch (error: unknown) {
            console.error('Analysis error:', error);
            setIsAnalyzing(false);

            // Mostrar erro real para debug
            const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido';
            console.error('Erro detalhado:', errorMsg);

            // Mensagem mais informativa
            if (errorMsg.includes('network') || errorMsg.includes('fetch')) {
                setErrorMessage('Erro de conexão. Verifique sua internet e tente novamente.');
            } else if (errorMsg.includes('timeout') || errorMsg.includes('demorou')) {
                setErrorMessage('A análise demorou muito. Tente novamente com uma foto mais leve.');
            } else {
                setErrorMessage(`Erro na análise: ${errorMsg}. Tente novamente.`);
            }
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

    // Show nothing while checking progress to avoid flash
    if (!isReady) {
        return null;
    }

    // LOADING SCREEN - Original design with real progress
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
                                <span className={styles.progressPercent}>{Math.round(displayProgress)}%</span>
                                <div className={styles.progressTrack}>
                                    <div
                                        className={styles.progressFill}
                                        style={{ width: `${displayProgress}%` }}
                                    />
                                </div>
                            </div>

                            {/* Current step text */}
                            <p className={styles.loadingText}>
                                {ANALYSIS_STEPS[currentStep]}
                            </p>

                            {/* Steps indicator */}
                            <div className={styles.stepsIndicator}>
                                {ANALYSIS_STEPS.map((_, index) => {
                                    // Sync dots completely with progress bar
                                    // 7 steps mapped to 0-100%
                                    // Step 0: 0-14%, Step 1: 15-28%, etc.
                                    const stepThreshold = (index / ANALYSIS_STEPS.length) * 100;
                                    const isActive = displayProgress >= stepThreshold;

                                    return (
                                        <div
                                            key={index}
                                            className={`${styles.stepDot} ${isActive ? styles.stepDotActive : ''}`}
                                        />
                                    );
                                })}
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
                            >
                                Analisar minha foto ✨
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
