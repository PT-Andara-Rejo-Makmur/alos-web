import type { HrMetricItem } from "./types";
import styles from "./hr-dashboard.module.css";

export function HrMetricGrid({
  metrics,
}: {
  readonly metrics: readonly HrMetricItem[];
}) {
  return (
    <section aria-label="Metrik Utama HR & People" className={styles.metricsGrid}>
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
