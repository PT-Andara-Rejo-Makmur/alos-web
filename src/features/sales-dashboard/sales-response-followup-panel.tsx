import type { SalesDailyControlItem } from "./types";
import styles from "./sales-dashboard.module.css";

export function SalesResponseFollowupPanel({
  items,
}: {
  readonly items: readonly SalesDailyControlItem[];
}) {
  return (
    <article aria-label="Respons dan Follow-up Harian" className={styles.panelCard}>
      <header className={styles.panelHeader}>
        <span className={styles.panelEyebrow}>Daily Control</span>
        <h2 className={styles.panelTitle}>Respons &amp; Follow-up Harian</h2>
        <p className={styles.panelSubtitle}>
          Monitoring antrean prospek &amp; kepatuhan SLA kontak
        </p>
      </header>

      <div className={styles.dailyControlList}>
        {items.map((item) => (
          <div className={styles.dailyControlItem} key={item.id}>
            <div className={styles.dailyControlInfo}>
              <span className={styles.dailyControlLabel}>{item.label}</span>
              <span className={styles.dailyControlTarget}>{item.target}</span>
            </div>
            <div className={styles.dailyControlValue}>{item.value}</div>
          </div>
        ))}
      </div>

      <footer className={styles.panelFootnote}>
        * Membutuhkan integrasi WhatsApp Business API (SM-D-01/02).
      </footer>
    </article>
  );
}
