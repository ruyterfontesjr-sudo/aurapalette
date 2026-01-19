'use client';

import { PhotoScanner } from './PhotoScanner';
import { ProgressBar } from './ProgressBar';
import { InsightsContainer } from './InsightCard';
import styles from './styles.module.css';
import type { PartialInsights, AnalysisError } from '@/hooks/useAnalysis';

interface AnalysisLoadingProps {
  imageSrc: string;
  progress: number;
  currentStep: string;
  insights: PartialInsights;
  error?: AnalysisError | null;
  onRetry?: () => void;
  onCancel?: () => void;
}

export function AnalysisLoading({
  imageSrc,
  progress,
  currentStep,
  insights,
  error,
  onRetry,
  onCancel,
}: AnalysisLoadingProps) {
  if (error) {
    return (
      <div className={styles.container}>
        <PhotoScanner imageSrc={imageSrc} isScanning={false} />
        <ErrorDisplay
          error={error}
          onRetry={onRetry}
          onCancel={onCancel}
        />
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${styles.entering}`}>
      <PhotoScanner imageSrc={imageSrc} isScanning={progress < 100} />
      <ProgressBar progress={progress} currentStep={currentStep} />
      <InsightsContainer insights={insights} maxVisible={3} />
    </div>
  );
}

// Error types and their display configurations
const ERROR_CONFIG: Record<string, { title: string; icon: string }> = {
  VALIDATION_ERROR: { title: 'Foto inválida', icon: '📷' },
  TIMEOUT_ERROR: { title: 'Tempo esgotado', icon: '⏱️' },
  NETWORK_ERROR: { title: 'Sem conexão', icon: '📡' },
  SERVER_ERROR: { title: 'Erro no servidor', icon: '⚠️' },
};

interface ErrorDisplayProps {
  error: AnalysisError;
  onRetry?: () => void;
  onCancel?: () => void;
}

function ErrorDisplay({ error, onRetry, onCancel }: ErrorDisplayProps) {
  const config = ERROR_CONFIG[error.type] || ERROR_CONFIG.SERVER_ERROR;

  return (
    <div className={styles.errorContainer}>
      <div className={styles.errorIcon}>{config.icon}</div>
      <h3 className={styles.errorTitle}>{config.title}</h3>
      <p className={styles.errorMessage}>{error.message}</p>
      <div className={styles.errorActions}>
        {error.type !== 'VALIDATION_ERROR' && onRetry && (
          <button className={styles.retryButton} onClick={onRetry}>
            Tentar novamente
          </button>
        )}
        {onCancel && (
          <button className={styles.cancelButton} onClick={onCancel}>
            {error.type === 'VALIDATION_ERROR' ? 'Escolher outra foto' : 'Cancelar'}
          </button>
        )}
      </div>
    </div>
  );
}

// Re-export sub-components for individual use
export { PhotoScanner } from './PhotoScanner';
export { ProgressBar } from './ProgressBar';
export { InsightCard, InsightsContainer } from './InsightCard';
