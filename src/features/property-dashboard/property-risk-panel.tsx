"use client";

import type { ProjectPortfolioSnapshot } from "@/features/mvp1/lib/portfolio";
import styles from "./property-dashboard.module.css";

interface PropertyRiskPanelProps {
  readonly distribution?: ProjectPortfolioSnapshot["distribution"];
  readonly metrics?: ProjectPortfolioSnapshot["metrics"];
}

export function PropertyRiskPanel({ distribution = [], metrics }: PropertyRiskPanelProps) {
  // Extract counts deterministically from distribution or metrics
  const onTrackCount =
    metrics?.on_track ??
    distribution.find((d) => d.status === "ON_TRACK")?.count ??
    0;

  const atRiskCount =
    metrics?.at_risk ??
    distribution.find((d) => d.status === "AT_RISK")?.count ??
    0;

  const criticalCount =
    metrics?.critical ??
    distribution.find((d) => d.status === "CRITICAL")?.count ??
    0;

  return (
    <article aria-label="Ringkasan Risiko Proyek" className={styles.panelCard}>
      <div className={styles.panelHeader}>
        <p className={styles.panelEyebrow}>RISK</p>
        <h2 className={styles.panelTitle}>Project Risk</h2>
      </div>

      <div className={styles.riskList}>
        {/* On Track */}
        <div className={styles.riskItem}>
          <div className={styles.riskItemLeft}>
            <span aria-hidden="true" className={`${styles.dot} ${styles.dotGreen}`} />
            <span>On Track</span>
          </div>
          <span className={styles.riskCount}>{onTrackCount}</span>
        </div>

        {/* At Risk */}
        <div className={styles.riskItem}>
          <div className={styles.riskItemLeft}>
            <span aria-hidden="true" className={`${styles.dot} ${styles.dotAmber}`} />
            <span>At Risk</span>
          </div>
          <span className={styles.riskCount}>{atRiskCount}</span>
        </div>

        {/* Critical */}
        <div className={styles.riskItem}>
          <div className={styles.riskItemLeft}>
            <span aria-hidden="true" className={`${styles.dot} ${styles.dotRed}`} />
            <span>Critical</span>
          </div>
          <span className={styles.riskCount}>{criticalCount}</span>
        </div>
      </div>

      <p className={styles.riskFootnote}>Dari status proyek canonical</p>
    </article>
  );
}
