"use client";

import type { PropertySourceReadinessItem } from "./types";
import styles from "./property-dashboard.module.css";

interface PropertyDataReadinessProps {
  readonly readiness: readonly PropertySourceReadinessItem[];
}

export function PropertyDataReadiness({ readiness }: PropertyDataReadinessProps) {
  return (
    <section aria-label="Status Kesiapan Data Proyek" className={styles.readinessCard}>
      <div className={styles.readinessInfo}>
        <p className={styles.readinessEyebrow}>PROPERTY DATA READINESS</p>
        <p className={styles.readinessDesc}>
          Portfolio proyek tersedia; kontrol konstruksi khusus masih bertahap.
        </p>
      </div>

      <div className={styles.readinessPills}>
        {readiness.map((item) => {
          const stateClass =
            item.state === "LIVE"
              ? styles.stateLive
              : item.state === "PARTIAL"
                ? styles.statePartial
                : styles.stateNotConnected;

          const displayState =
            item.state === "NOT_CONNECTED" ? "NOT CONNECTED" : item.state;

          return (
            <div className={styles.readinessPill} key={item.key}>
              <span className={styles.pillLabel}>{item.label}</span>
              <div className={`${styles.pillState} ${stateClass}`}>
                <span aria-hidden="true" className={styles.dot} />
                <span>{displayState}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
