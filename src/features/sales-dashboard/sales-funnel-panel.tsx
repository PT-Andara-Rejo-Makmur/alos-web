import type { SalesFunnelStage } from "./types";
import styles from "./sales-dashboard.module.css";

// Proportional visual indicator widths for the neutral skeleton bars
const SKELETON_WIDTHS: readonly string[] = ["100%", "75%", "50%", "32%", "18%"];

export function SalesFunnelPanel({
  stages,
}: {
  readonly stages: readonly SalesFunnelStage[];
}) {
  return (
    <article aria-label="Lead-to-Cash Sales Funnel" className={styles.panelCard}>
      <header className={styles.panelHeader}>
        <span className={styles.panelEyebrow}>Pipeline Conversion</span>
        <h2 className={styles.panelTitle}>Lead-to-Cash Sales Funnel</h2>
        <p className={styles.panelSubtitle}>
          WF-03 Lead qualification hingga akad &amp; handover unit
        </p>
      </header>

      <div className={styles.funnelList}>
        {stages.map((stage, idx) => (
          <div className={styles.funnelRow} key={stage.stage}>
            <div className={styles.funnelRowHeader}>
              <span className={styles.funnelStageLabel}>{stage.label}</span>
              <span className={styles.funnelStageValue}>
                {stage.count !== null ? `${stage.count} prospek` : "—"}
              </span>
            </div>
            <div className={styles.funnelBarContainer}>
              <div
                className={styles.funnelBarSkeleton}
                style={{ width: SKELETON_WIDTHS[idx % SKELETON_WIDTHS.length] }}
              />
            </div>
          </div>
        ))}
      </div>

      <footer className={styles.panelFootnote}>
        * Funnel akan terisi otomatis setelah integrasi CRM &amp; Booking register aktif.
        Tahap booking diverifikasi bersama tim Finance &amp; Legal sebelum akad.
      </footer>
    </article>
  );
}
