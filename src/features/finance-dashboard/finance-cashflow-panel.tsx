import styles from "./finance-dashboard.module.css";

export function FinanceCashflowPanel() {
  return (
    <article className={`${styles.sectionCard} ${styles.cashflowPanel}`} aria-label="13-Week Cashflow">
      <div className={styles.cardEyebrow}>TREASURY</div>
      <h3 className={styles.cardTitle}>13-Week Cashflow</h3>
      <p className={styles.cardSubtitle}>
        Target kontrol mingguan · sumber belum tersedia
      </p>

      <div className={styles.chartGridWrap} aria-hidden="true">
        <div className={styles.gridLine} />
        <div className={styles.gridLine} />
        <div className={styles.gridLine} />
        <div className={styles.gridLine} />
        <div className={styles.gridLine} />
      </div>

      <div className={styles.chartCenterNote}>
        Cashflow akan tampil setelah ledger terhubung
      </div>
    </article>
  );
}
