import type { FinanceSourceReadiness } from "./types";
import styles from "./finance-dashboard.module.css";

interface FinanceDataReadinessProps {
  readonly items: readonly FinanceSourceReadiness[];
}

export function FinanceDataReadiness({ items }: FinanceDataReadinessProps) {
  function getDotClass(state: FinanceSourceReadiness["state"]): string {
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
    <section className={styles.readinessCard} aria-label="Status Kesiapan Data Keuangan">
      <div className={styles.readinessLeft}>
        <div className={styles.cardEyebrow}>FINANCE DATA READINESS</div>
        <p className={styles.readinessSubtitle}>
          Sumber buku besar dan transaksi belum terhubung ke dashboard.
        </p>
      </div>

      <div className={styles.readinessRight} role="list">
        {items.map((item) => (
          <div className={styles.readinessItem} key={item.key} role="listitem" title={item.description}>
            <div className={styles.readinessTop}>
              <span className={`${styles.statusDot} ${getDotClass(item.state)}`} aria-hidden="true" />
              <span className={styles.readinessLabel}>{item.label}</span>
            </div>
            <div className={styles.readinessState} data-testid={`readiness-state-${item.key}`}>
              {item.stateLabel}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
