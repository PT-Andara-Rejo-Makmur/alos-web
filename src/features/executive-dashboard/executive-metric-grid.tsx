import type { ExecutiveDashboardMetric } from "./types";
import { formatMetricDisplayValue } from "./executive-dashboard-projection";
import styles from "./executive-dashboard.module.css";

interface ExecutiveMetricGridProps {
  readonly metrics: readonly ExecutiveDashboardMetric[];
}

export function ExecutiveMetricGrid({ metrics }: ExecutiveMetricGridProps) {
  function getToneDotClass(tone: ExecutiveDashboardMetric["tone"]): string {
    switch (tone) {
      case "SUCCESS":
        return styles.dotSuccess;
      case "WARNING":
        return styles.dotPartial;
      case "DANGER":
        return styles.dotDanger;
      case "INFO":
      default:
        return styles.dotLive;
    }
  }

  return (
    <section className={styles.kpiGrid} aria-label="Metrik Kesehatan Perusahaan">
      {metrics.map((metric) => {
        const displayValue = formatMetricDisplayValue(metric);

        return (
          <article className={styles.kpiCard} key={metric.key}>
            <div>
              <p className={styles.kpiLabel}>{metric.label}</p>
              <div className={styles.kpiValue} data-testid={`metric-value-${metric.key}`}>
                {displayValue}
              </div>
            </div>
            <div className={styles.kpiFooter}>
              <span
                className={`${styles.statusDot} ${getToneDotClass(metric.tone)}`}
                aria-hidden="true"
              />
              <span>{metric.context}</span>
            </div>
          </article>
        );
      })}
    </section>
  );
}
