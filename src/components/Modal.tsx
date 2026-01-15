'use client';

import { useEffect, useState } from 'react';
import styles from './Modal.module.css';
import Button from './Button';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message?: string;
    children?: React.ReactNode;
    icon?: string;
    buttonText?: string;
}

export default function Modal({
    isOpen,
    onClose,
    title,
    message,
    children,
    icon = '⚠️',
    buttonText = 'Entendi'
}: ModalProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            document.body.style.overflow = 'hidden';
        } else {
            const timer = setTimeout(() => setIsVisible(false), 300);
            document.body.style.overflow = '';
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

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
                <div className={styles.icon}>{icon}</div>
                <h3 className={styles.title}>{title}</h3>
                {message && <p className={styles.message}>{message}</p>}
                {children}

                <div className={styles.button}>
                    <Button
                        variant="primary"
                        fullWidth
                        onClick={onClose}
                    >
                        {buttonText}
                    </Button>
                </div>
            </div>
        </div>
    );
}

