"use client";

import type { ProjectPortfolioSnapshot } from "@/features/mvp1/lib/portfolio";
import styles from "./property-dashboard.module.css";

interface PropertyMetricGridProps {
  readonly metrics?: ProjectPortfolioSnapshot["metrics"] | null;
}

function formatMetricNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("id-ID").format(value);
}

export function PropertyMetricGrid({ metrics }: PropertyMetricGridProps) {
  const total = metrics?.total ?? null;
  const onTrack = metrics?.on_track ?? null;
  const atRisk = metrics?.at_risk ?? null;
  const critical = metrics?.critical ?? null;

  return (
    <section aria-label="Metrik Ringkasan Portofolio Proyek" className={styles.metricsGrid}>
      {/* Total Projects */}
      <article className={styles.metricCard}>
        <p className={styles.metricTitle}>Total Projects</p>
        <p className={styles.metricValue}>{formatMetricNumber(total)}</p>
        <p className={styles.metricSubtext}>
          <span aria-hidden="true" className={`${styles.dot} ${styles.dotBlue}`} />
          <span>Portfolio aktif</span>
        </p>
      </article>

      {/* On Track */}
      <article className={styles.metricCard}>
        <p className={styles.metricTitle}>On Track</p>
        <p className={styles.metricValue}>{formatMetricNumber(onTrack)}</p>
        <p className={styles.metricSubtext}>
          <span aria-hidden="true" className={`${styles.dot} ${styles.dotGreen}`} />
          <span>Status verified</span>
        </p>
      </article>

      {/* At Risk */}
      <article className={styles.metricCard}>
        <p className={styles.metricTitle}>At Risk</p>
        <p className={styles.metricValue}>{formatMetricNumber(atRisk)}</p>
        <p className={styles.metricSubtext}>
          <span aria-hidden="true" className={`${styles.dot} ${styles.dotAmber}`} />
          <span>Perlu perhatian</span>
        </p>
      </article>

      {/* Critical */}
      <article className={styles.metricCard}>
        <p className={styles.metricTitle}>Critical</p>
        <p className={styles.metricValue}>{formatMetricNumber(critical)}</p>
        <p className={styles.metricSubtext}>
          <span aria-hidden="true" className={`${styles.dot} ${styles.dotRed}`} />
          <span>{critical === 0 ? "Tidak ada critical" : "Perlu eskalasi"}</span>
        </p>
      </article>
    </section>
  );
}
