import styles from "./finance-dashboard.module.css";

const AGING_BUCKETS = [
  { key: "0-30", label: "0–30" },
  { key: "31-60", label: "31–60" },
  { key: "61-90", label: "61–90" },
  { key: "90+", label: ">90" },
];

export function FinanceAgingPanel() {
  return (
    <article className={styles.sectionCard} aria-label="Umur Piutang dan Utang">
      <div className={styles.cardEyebrow}>WORKING CAPITAL</div>
      <h3 className={styles.cardTitle}>AR / AP Aging</h3>

      <div className={styles.agingRows}>
        {AGING_BUCKETS.map((bucket) => (
          <div className={styles.agingRow} key={bucket.key} data-testid={`aging-bucket-${bucket.key}`}>
            <span className={styles.agingRowLabel}>{bucket.label}</span>
            <div className={styles.agingRowBar} aria-hidden="true" />
          </div>
        ))}
      </div>

      <div className={styles.chartFootnote}>Belum ada laporan aging canonical</div>
    </article>
  );
}
