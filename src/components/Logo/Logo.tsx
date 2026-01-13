import styles from './Logo.module.css';

interface LogoProps {
    size?: 'small' | 'large';
}

export default function Logo({ size = 'small' }: LogoProps) {
    const isLarge = size === 'large';

    return (
        <div className={`${styles.logo} ${isLarge ? styles.logoLarge : ''}`}>
            <span className={styles.aura}>Aura</span>
            <span className={styles.color}>Palette</span>
        </div>
    );
}
