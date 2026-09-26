import type { ItMetricItem } from "./types";
import styles from "./it-dashboard.module.css";

interface ItMetricGridProps {
  readonly metrics: readonly ItMetricItem[];
}

export function ItMetricGrid({ metrics }: ItMetricGridProps) {
  return (
    <section aria-label="Metrik Operasional IT" className={styles.metricsGrid}>
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
