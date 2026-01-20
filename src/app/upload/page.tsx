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

// Map SSE step IDs to step indices
const STEP_MAP: Record<string, number> = {
    'detecting_face': 0,
    'analyzing_skin': 1,
    'calculating_contrast': 2,
    'identifying_undertone': 3,
    'generating_palette': 4,
    'finalizing': 5,
};

export default function UploadPage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [image, setImage] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentStep, setCurrentStep] = useState(0);
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

        try {
            // Compress image
            const { compressImage } = await import('@/utils/image');
            const compressedImage = await compressImage(image, 800, 0.85);

            // Start loading animation immediately (no validation step)
            setIsAnalyzing(true);
            setProgress(0);
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
                                // Update progress from real SSE data
                                if (event.progress !== undefined) {
                                    setProgress(event.progress);
                                }
                                // Update step from SSE step ID
                                if (event.step && STEP_MAP[event.step] !== undefined) {
                                    setCurrentStep(STEP_MAP[event.step]);
                                }
                                break;

                            case 'complete':
                                if (event.result) {
                                    // Save result
                                    localStorage.setItem('aurapalette_analysis', JSON.stringify(event.result));
                                    setProgress(100);
                                    setCurrentStep(ANALYSIS_STEPS.length - 1);

                                    // Navigate after brief delay
                                    setTimeout(() => {
                                        setIsAnalyzing(false);
                                        router.push('/preview');
                                    }, 500);
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

            // Mensagem fixa para qualquer erro
            setErrorMessage('Sua imagem não atende aos requisitos mínimos de qualidade. Por favor, tire outra foto e tente novamente.');
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
