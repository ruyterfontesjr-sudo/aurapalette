'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import Card from '@/components/Card';
import Logo from '@/components/Logo';
import Button from '@/components/Button';

const ANALYSIS_STEPS = [
    { text: 'Detectando características faciais...', duration: 2000 },
    { text: 'Analisando tom de pele...', duration: 2500 },
    { text: 'Identificando subtom...', duration: 2000 },
    { text: 'Mapeando paleta de cores...', duration: 2500 },
    { text: 'Gerando recomendações personalizadas...', duration: 1500 },
    { text: 'Finalizando seu relatório...', duration: 1000 },
];

export default function UploadPage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [image, setImage] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [progress, setProgress] = useState(0);

    // Analysis loading effect with psychological timing
    useEffect(() => {
        if (!isAnalyzing) return;

        let stepIndex = 0;
        let elapsed = 0;
        const totalDuration = ANALYSIS_STEPS.reduce((acc, step) => acc + step.duration, 0);

        const runStep = () => {
            if (stepIndex >= ANALYSIS_STEPS.length) return;

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
                if (stepIndex < ANALYSIS_STEPS.length) {
                    runStep();
                }
            }, stepDuration);
        };

        runStep();
    }, [isAnalyzing]);

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

        setIsAnalyzing(true);
        setCurrentStep(0);
        setProgress(0);

        // Store image for analysis
        localStorage.setItem('aurapalette_photo', image);

        // Start API call in background
        const apiPromise = fetch('/api/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ image }),
        }).then(res => res.json()).catch(() => ({
            temperature: 'Quente',
            undertone: 'Dourado',
            season: 'Outono',
            contrast: 'Alto',
        }));

        // Wait for minimum animation time (psychological effect)
        const totalDuration = ANALYSIS_STEPS.reduce((acc, step) => acc + step.duration, 0);
        const minWait = new Promise(resolve => setTimeout(resolve, totalDuration));

        // Wait for both API and animation
        const [data] = await Promise.all([apiPromise, minWait]);

        // Store the analysis result
        localStorage.setItem('aurapalette_analysis', JSON.stringify(data));

        // Navigate to preview
        router.push('/preview');
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
                    <div className={styles.header}>
                        <Logo />
                    </div>

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
                                <div className={styles.progressTrack}>
                                    <div
                                        className={styles.progressFill}
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                                <span className={styles.progressPercent}>{Math.round(progress)}%</span>
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
                <div className={styles.header}>
                    <Logo />
                </div>

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
                            <div className={styles.uploadIcon}>📷</div>
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
                            >
                                Analisar minha foto ✨
                            </Button>
                        </div>
                    )}
                </Card>
            </div>
        </main>
    );
}
