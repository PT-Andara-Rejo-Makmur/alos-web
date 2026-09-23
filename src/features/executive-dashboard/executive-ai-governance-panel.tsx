import Link from "next/link";
import type { ExecutiveAIContext } from "./types";
import styles from "./executive-dashboard.module.css";

interface ExecutiveAIGovernancePanelProps {
  readonly aiContext: ExecutiveAIContext;
}

export function ExecutiveAIGovernancePanel({ aiContext }: ExecutiveAIGovernancePanelProps) {
  return (
    <article className={styles.aiCard} aria-label="Konteks AI dan Tata Kelola">
      <div className={styles.aiEyebrow}>SISTEM AI & TATA KELOLA</div>
      <h3 className={styles.aiTitle}>GENESIS & Tata Kelola ARA</h3>

      <div className={styles.aiMetricsRow}>
        <span className={styles.aiMetricLabel}>Alur Kerja Analisis Aktif</span>
        <span className={styles.aiMetricValue} data-testid="ai-active-workflows">
          {aiContext.activeWorkflows}
        </span>
      </div>

      <div className={styles.aiMetricsRow}>
        <span className={styles.aiMetricLabel}>Status Jejak Bukti (Lineage)</span>
        <span className={styles.aiMetricStatus}>{aiContext.evidenceLineageStatus}</span>
      </div>

      <p style={{ fontSize: "0.775rem", color: "rgba(255, 255, 255, 0.6)", margin: "1rem 0" }}>
        {aiContext.hint} Seluruh operasi otonom tunduk pada batasan persetujuan manusia.
      </p>

      <Link href="/business/ara" className={styles.aiButton}>
        Buka Tata Kelola ARA &rarr;
      </Link>
    </article>
  );
}
