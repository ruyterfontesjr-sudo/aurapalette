import styles from './ProgressBar.module.css';

interface ProgressBarProps {
    currentStep: number;
    totalSteps: number;
    label?: string;
}

export default function ProgressBar({
    currentStep,
    totalSteps,
    label,
}: ProgressBarProps) {
    const percentage = (currentStep / totalSteps) * 100;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                {label && <span className={styles.label}>{label}</span>}
                <span className={styles.step}>
                    {currentStep} de {totalSteps}
                </span>
            </div>
            <div className={styles.track}>
                <div
                    className={styles.progress}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}
