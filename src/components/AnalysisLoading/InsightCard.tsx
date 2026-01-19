'use client';

import styles from './styles.module.css';
import type { PartialInsights } from '@/hooks/useAnalysis';

// Map insight fields to display labels and icons
const INSIGHT_CONFIG: Record<string, { label: string; icon: string }> = {
  skinDescription: { label: 'Tom de Pele', icon: '🎨' },
  eyeColor: { label: 'Cor dos Olhos', icon: '👁️' },
  undertone: { label: 'Subtom', icon: '✨' },
  temperature: { label: 'Temperatura', icon: '🌡️' },
  contrast: { label: 'Contraste', icon: '🔲' },
  season: { label: 'Estação', icon: '🌸' },
};

interface InsightCardProps {
  field: string;
  value: string;
  index?: number;
}

export function InsightCard({ field, value, index = 0 }: InsightCardProps) {
  const config = INSIGHT_CONFIG[field];
  if (!config) return null;

  // Get stagger class based on index
  const staggerClass = index > 0 && index <= 5 ? styles[`stagger${index}`] : '';

  return (
    <div className={`${styles.insightCard} ${staggerClass}`}>
      <div className={styles.insightIcon}>{config.icon}</div>
      <div className={styles.insightContent}>
        <div className={styles.insightLabel}>{config.label}</div>
        <div className={styles.insightValue}>{value}</div>
      </div>
    </div>
  );
}

interface InsightsContainerProps {
  insights: PartialInsights;
  maxVisible?: number;
}

export function InsightsContainer({ insights, maxVisible = 3 }: InsightsContainerProps) {
  // Prioritize which insights to show (most relevant first)
  const priorityOrder = ['skinDescription', 'eyeColor', 'undertone', 'temperature', 'contrast', 'season'];

  const visibleInsights = priorityOrder
    .filter(field => insights[field as keyof PartialInsights])
    .slice(0, maxVisible)
    .map((field, index) => ({
      field,
      value: insights[field as keyof PartialInsights]!,
      index,
    }));

  // Show skeleton placeholders if no insights yet
  if (visibleInsights.length === 0) {
    return (
      <div className={styles.insightsContainer}>
        <InsightSkeleton />
      </div>
    );
  }

  return (
    <div className={styles.insightsContainer}>
      {visibleInsights.map(({ field, value, index }) => (
        <InsightCard key={field} field={field} value={value} index={index} />
      ))}
    </div>
  );
}

function InsightSkeleton() {
  return (
    <div className={styles.insightSkeleton}>
      <div className={styles.skeletonIcon} />
      <div className={styles.skeletonText}>
        <div className={`${styles.skeletonLine} ${styles.short}`} />
        <div className={`${styles.skeletonLine} ${styles.long}`} />
      </div>
    </div>
  );
}
