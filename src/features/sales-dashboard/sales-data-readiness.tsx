import type { SalesSourceReadinessItem } from "./types";
import styles from "./sales-dashboard.module.css";

function getPillClass(state: SalesSourceReadinessItem["state"]): string {
  switch (state) {
    case "LIVE":
      return styles.stateLive;
    case "PARTIAL":
      return styles.statePartial;
    case "NOT_CONNECTED":
    default:
      return styles.stateNotConnected;
  }
}

function formatPillState(state: SalesSourceReadinessItem["state"]): string {
  switch (state) {
    case "LIVE":
      return "CONNECTED";
    case "PARTIAL":
      return "PARTIAL";
    case "NOT_CONNECTED":
    default:
      return "NOT CONNECTED";
  }
}

export function SalesDataReadiness({
  items,
}: {
  readonly items: readonly SalesSourceReadinessItem[];
}) {
  return (
    <section aria-label="Status Kesiapan Data Sales" className={styles.readinessCard}>
      <div className={styles.readinessInfo}>
        <span className={styles.readinessEyebrow}>Sales Data Readiness</span>
        <p className={styles.readinessDesc}>
          Status koneksi pipeline, CRM, dan kanal interaksi aktif
        </p>
      </div>

      <div className={styles.readinessPills}>
        {items.map((item) => (
          <div className={styles.readinessPill} key={item.key}>
            <span className={styles.pillLabel}>{item.label}</span>
            <span className={`${styles.pillState} ${getPillClass(item.state)}`}>
              <span className={styles.dot} />
              {formatPillState(item.state)}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
