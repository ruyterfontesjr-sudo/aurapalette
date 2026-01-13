'use client';

import styles from './Button.module.css';

interface ButtonProps {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'accent';
    size?: 'small' | 'medium' | 'large';
    fullWidth?: boolean;
    loading?: boolean;
    disabled?: boolean;
    onClick?: () => void;
    type?: 'button' | 'submit';
    className?: string;
}

export default function Button({
    children,
    variant = 'primary',
    size = 'medium',
    fullWidth = false,
    loading = false,
    disabled = false,
    onClick,
    type = 'button',
    className = '',
}: ButtonProps) {
    const classNames = [
        styles.button,
        styles[variant],
        size !== 'medium' && styles[size],
        fullWidth && styles.fullWidth,
        loading && styles.loading,
        className,
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <button
            type={type}
            className={classNames}
            onClick={onClick}
            disabled={disabled || loading}
        >
            {loading && <span className={styles.spinner} />}
            {children}
        </button>
    );
}
