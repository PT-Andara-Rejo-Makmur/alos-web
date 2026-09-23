import type { LegalMetricItem } from "./types";
import styles from "./legal-dashboard.module.css";

interface LegalMetricGridProps {
  readonly metrics: readonly LegalMetricItem[];
}

export function LegalMetricGrid({ metrics }: LegalMetricGridProps) {
  return (
    <section aria-label="Metrik Utama Legal & Compliance" className={styles.metricsGrid}>
      {metrics.map((metric) => (
        <article className={styles.metricCard} key={metric.id}>
          <h3 className={styles.metricTitle}>{metric.label}</h3>
          <div className={styles.metricValue}>{metric.value}</div>
          <div className={styles.metricSubtext}>
            <span aria-hidden="true" className={styles.metricDot} />
            <span>{metric.helper}</span>
          </div>
        </article>
      ))}
    </section>
  );
}
