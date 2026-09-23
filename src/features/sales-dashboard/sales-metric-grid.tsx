import type { SalesMetricItem } from "./types";
import styles from "./sales-dashboard.module.css";

export function SalesMetricGrid({
  metrics,
}: {
  readonly metrics: readonly SalesMetricItem[];
}) {
  return (
    <section aria-label="Metrik Utama Sales & Marketing" className={styles.metricsGrid}>
      {metrics.map((metric) => (
        <article className={styles.metricCard} key={metric.id}>
          <h3 className={styles.metricTitle}>{metric.label}</h3>
          <div className={styles.metricValue}>{metric.value}</div>
          <div className={styles.metricSubtext}>
            <span className={styles.metricDot} />
            <span>{metric.helper}</span>
          </div>
        </article>
      ))}
    </section>
  );
}
