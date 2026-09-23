import type { HrSourceReadinessItem } from "./types";
import styles from "./hr-dashboard.module.css";

function getPillClass(state: HrSourceReadinessItem["state"]): string {
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

function formatPillState(state: HrSourceReadinessItem["state"]): string {
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

export function HrDataReadiness({
  items,
}: {
  readonly items: readonly HrSourceReadinessItem[];
}) {
  return (
    <section aria-label="Status Kesiapan Data HR" className={styles.readinessCard}>
      <div className={styles.readinessInfo}>
        <span className={styles.readinessEyebrow}>HR Data Readiness</span>
        <p className={styles.readinessDesc}>
          HR-domain API canonical belum terlihat di repository saat ini.
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
