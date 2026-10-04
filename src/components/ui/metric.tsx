import type { ReactNode } from "react";

import styles from "./ui.module.css";

export interface MetricProps {
  readonly label: ReactNode;
  readonly status?: ReactNode;
  readonly supportingText?: ReactNode;
  readonly value: ReactNode;
  readonly unavailable?: boolean;
}

export function Metric({ label, status, supportingText, value, unavailable = false }: MetricProps) {
  return (
    <article className={styles.metric} data-unavailable={unavailable || undefined}>
      <div className={styles.metricLabel}>{label}</div>
      <div className={styles.metricValue}>{value}</div>
      {supportingText ? <div className={styles.metricSupportingText}>{supportingText}</div> : null}
      {status ? <div className={styles.metricStatus}>{status}</div> : null}
    </article>
  );
}
