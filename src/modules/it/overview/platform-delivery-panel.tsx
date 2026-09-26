import type { PlatformDeliveryRow } from "./types";
import styles from "./it-dashboard.module.css";

interface PlatformDeliveryPanelProps {
  readonly items: readonly PlatformDeliveryRow[];
}

export function PlatformDeliveryPanel({ items }: PlatformDeliveryPanelProps) {
  return (
    <article aria-label="ALOS Platform & Delivery" className={styles.panelCard}>
      <header className={styles.panelHeader}>
        <span className={styles.panelEyebrow}>ALOS Platform</span>
        <h2 className={styles.panelTitle}>Systems & Delivery</h2>
      </header>

      <div className={styles.panelList}>
        {items.map((item) => (
          <div className={styles.panelListItem} key={item.id}>
            <span className={styles.itemLabel}>{item.name}</span>
            <span className={styles.itemDetail}>{item.repoStatus}</span>
            <span
              className={
                item.healthState === "AVAILABLE"
                  ? styles.badgeAvailable
                  : styles.badgeNeedsTelemetry
              }
            >
              {item.healthBadge}
            </span>
          </div>
        ))}
      </div>

      <div className={styles.itemFootnote}>
        Repo existence != runtime health.
      </div>
    </article>
  );
}
