import type { FinanceDashboardMetric } from "./types";
import { formatFinanceMetricValue } from "./finance-dashboard-projection";
import styles from "./finance-dashboard.module.css";

interface FinanceMetricGridProps {
  readonly metrics: readonly FinanceDashboardMetric[];
}

export function FinanceMetricGrid({ metrics }: FinanceMetricGridProps) {
  function getDotClass(state: FinanceDashboardMetric["state"]): string {
    switch (state) {
      case "LIVE":
        return styles.dotLive;
      case "PARTIAL":
        return styles.dotPartial;
      case "NOT_CONNECTED":
      default:
        return styles.dotNotConnected;
    }
  }

  return (
    <section className={styles.kpiGrid} aria-label="Metrik Utama Keuangan">
      {metrics.map((metric) => {
        const displayVal = formatFinanceMetricValue(metric);

        return (
          <article className={styles.kpiCard} key={metric.key}>
            <div>
              <p className={styles.kpiLabel}>{metric.label}</p>
              <div className={styles.kpiValue} data-testid={`finance-metric-${metric.key}`}>
                {displayVal}
              </div>
            </div>
            <div className={styles.kpiFooter}>
              <span className={`${styles.statusDot} ${getDotClass(metric.state)}`} aria-hidden="true" />
              <span>{metric.context}</span>
            </div>
          </article>
        );
      })}
    </section>
  );
}
