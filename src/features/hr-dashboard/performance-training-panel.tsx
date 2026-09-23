import type { HrDevelopmentItem } from "./types";
import styles from "./hr-dashboard.module.css";

export function PerformanceTrainingPanel({
  items,
}: {
  readonly items: readonly HrDevelopmentItem[];
}) {
  return (
    <article aria-label="Performance dan Training" className={styles.panelCard}>
      <header className={styles.panelHeader}>
        <span className={styles.panelEyebrow}>Development</span>
        <h2 className={styles.panelTitle}>Performance &amp; Training</h2>
      </header>

      <div className={styles.panelList}>
        {items.map((item) => (
          <div className={styles.panelListItem} key={item.id}>
            <span className={styles.itemLabel}>{item.label}</span>
            <span className={styles.itemValue}>{item.value}</span>
          </div>
        ))}
      </div>
    </article>
  );
}
