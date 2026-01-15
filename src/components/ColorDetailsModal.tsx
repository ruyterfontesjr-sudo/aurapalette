'use client';

import { useState, useEffect } from 'react';
import styles from './ColorDetailsModal.module.css';
import Button from './Button';

interface ColorDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    colorName: string;
    colorHex: string;
}

export default function ColorDetailsModal({ isOpen, onClose, colorName, colorHex }: ColorDetailsModalProps) {
    const [copied, setCopied] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            setCopied(false);
            // Prevent background scrolling
            document.body.style.overflow = 'hidden';
        } else {
            const timer = setTimeout(() => setIsVisible(false), 300);
            document.body.style.overflow = '';
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(colorHex);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    if (!isVisible && !isOpen) return null;

    return (
        <div
            className={`${styles.overlay} ${isOpen ? styles.open : ''}`}
            onClick={onClose}
        >
            <div
                className={`${styles.modal} ${isOpen ? styles.open : ''}`}
                onClick={e => e.stopPropagation()}
            >
                <button className={styles.closeButton} onClick={onClose}>✕</button>

                <h3 className={styles.title}>Detalhes da Cor</h3>

                <div
                    className={styles.colorPreview}
                    style={{ backgroundColor: colorHex }}
                />

                <div className={styles.infoContainer}>
                    <p className={styles.colorName}>{colorName}</p>
                    <p className={styles.colorHex}>{colorHex}</p>
                </div>

                <Button
                    variant="primary"
                    fullWidth
                    onClick={handleCopy}
                    className={copied ? styles.copiedButton : ''}
                >
                    {copied ? 'Copiado! ✓' : 'Copiar Código'}
                </Button>
            </div>
        </div>
    );
}
