import type { ItSourceReadinessItem } from "./types";
import styles from "./it-dashboard.module.css";

interface ItDataReadinessProps {
  readonly items: readonly ItSourceReadinessItem[];
}

export function ItDataReadiness({ items }: ItDataReadinessProps) {
  return (
    <section aria-label="Kesiapan Data IT & Telemetri" className={styles.readinessCard}>
      <div className={styles.readinessInfo}>
        <span className={styles.readinessEyebrow}>IT Data Readiness</span>
        <p className={styles.readinessDesc}>
          GENESIS control plane sudah ada; infra monitoring umum masih memerlukan source canonical.
        </p>
      </div>

      <div className={styles.readinessPills}>
        {items.map((item) => {
          const isLive = item.state === "LIVE";
          const isPartial = item.state === "PARTIAL";

          return (
            <div className={styles.readinessPill} key={item.key}>
              <span className={styles.pillLabel}>{item.label}</span>
              <span
                className={`${styles.pillState} ${
                  isLive
                    ? styles.stateLive
                    : isPartial
                      ? styles.statePartial
                      : styles.stateNotConnected
                }`}
              >
                <span aria-hidden="true" className={styles.dot} />
                <span>
                  {isLive ? "LIVE" : isPartial ? "PARTIAL" : "NOT CONNECTED"}
                </span>
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
