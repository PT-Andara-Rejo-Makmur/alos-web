import type { ReleaseChangeRow } from "./types";
import styles from "./it-dashboard.module.css";

interface ReleaseGovernancePanelProps {
  readonly items: readonly ReleaseChangeRow[];
}

export function ReleaseGovernancePanel({ items }: ReleaseGovernancePanelProps) {
  return (
    <article aria-label="Release & Change Governance" className={styles.panelCard}>
      <header className={styles.panelHeader}>
        <span className={styles.panelEyebrow}>Release & Change</span>
        <h2 className={styles.panelTitle}>Governed Delivery</h2>
      </header>

      <div className={styles.panelList}>
        {items.map((item) => (
          <div className={styles.panelListItem} key={item.id}>
            <span className={styles.itemLabel}>{item.label}</span>
            <span
              className={
                item.state === "PARTIAL" || item.state === "AVAILABLE"
                  ? styles.badgePartial
                  : styles.badgeUnconnected
              }
            >
              {item.status}
            </span>
          </div>
        ))}
      </div>
    </article>
  );
}
