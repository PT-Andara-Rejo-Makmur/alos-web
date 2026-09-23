import type { PermitReadinessRow } from "./types";
import styles from "./legal-dashboard.module.css";

interface PermitExpiryPanelProps {
  readonly items: readonly PermitReadinessRow[];
}

export function PermitExpiryPanel({ items }: PermitExpiryPanelProps) {
  return (
    <article aria-label="Permit Readiness & Expiry" className={styles.panelCard}>
      <header className={styles.panelHeader}>
        <span className={styles.panelEyebrow}>Permits & Land</span>
        <h2 className={styles.panelTitle}>Permit Readiness & Expiry</h2>
        <span className={styles.panelSubtitle}>
          Register izin, dependency, deadline, dan hold/continue.
        </span>
      </header>

      <div className={styles.panelList}>
        {items.map((item) => (
          <div className={styles.skeletonRow} key={item.id}>
            <div className={styles.skeletonRowHeader}>
              <span className={styles.itemLabel}>{item.label}</span>
              <span className={styles.itemValue}>{item.value}</span>
            </div>
            <div aria-hidden="true" className={styles.skeletonBarContainer}>
              <div className={styles.skeletonBar} style={{ width: "25%" }} />
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}
