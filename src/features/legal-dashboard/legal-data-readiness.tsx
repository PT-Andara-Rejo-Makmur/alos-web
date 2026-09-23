import type { LegalSourceReadinessItem } from "./types";
import styles from "./legal-dashboard.module.css";

interface LegalDataReadinessProps {
  readonly items: readonly LegalSourceReadinessItem[];
}

export function LegalDataReadiness({ items }: LegalDataReadinessProps) {
  return (
    <section aria-label="Kesiapan Data Legal & Compliance" className={styles.readinessCard}>
      <div className={styles.readinessInfo}>
        <span className={styles.readinessEyebrow}>Legal Data Readiness</span>
        <p className={styles.readinessDesc}>
          Legal-domain API canonical belum terlihat di repository saat ini.
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
