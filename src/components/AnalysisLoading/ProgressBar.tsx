'use client';

import styles from './styles.module.css';

interface ProgressBarProps {
  progress: number;
  currentStep: string;
  showPercent?: boolean;
}

export function ProgressBar({ progress, currentStep, showPercent = true }: ProgressBarProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className={styles.progressWrapper}>
      <div className={styles.progressBar}>
        <div
          className={styles.progressFill}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
      <div className={styles.progressText}>
        <span className={styles.stepText}>{currentStep}</span>
        {showPercent && (
          <span className={styles.percentText}>{Math.round(clampedProgress)}%</span>
        )}
      </div>
    </div>
  );
}
