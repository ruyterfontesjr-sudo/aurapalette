'use client';

import Image from 'next/image';
import styles from './styles.module.css';

interface PhotoScannerProps {
  imageSrc: string;
  isScanning?: boolean;
}

export function PhotoScanner({ imageSrc, isScanning = true }: PhotoScannerProps) {
  return (
    <div className={styles.photoScanner}>
      <div className={styles.photoWrapper}>
        <Image
          src={imageSrc}
          alt="Sua foto"
          fill
          className={styles.photo}
          sizes="200px"
          priority
        />
        {isScanning && (
          <>
            <div className={styles.scanLine} />
            <div className={styles.scanOverlay} />
          </>
        )}
      </div>
      {isScanning && <div className={styles.pulseRing} />}
    </div>
  );
}
