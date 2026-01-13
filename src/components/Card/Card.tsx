import styles from './Card.module.css';

interface CardProps {
    children: React.ReactNode;
    hoverable?: boolean;
    glow?: boolean;
    noPadding?: boolean;
    className?: string;
    onClick?: () => void;
}

export default function Card({
    children,
    hoverable = false,
    glow = false,
    noPadding = false,
    className = '',
    onClick,
}: CardProps) {
    const classNames = [
        styles.card,
        hoverable && styles.hoverable,
        glow && styles.glow,
        noPadding && styles.noPadding,
        className,
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <div className={classNames} onClick={onClick}>
            {children}
        </div>
    );
}
