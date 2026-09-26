import type { SecurityAccessRow } from "./types";
import styles from "./it-dashboard.module.css";

interface SecurityAccessPanelProps {
  readonly items: readonly SecurityAccessRow[];
}

export function SecurityAccessPanel({ items }: SecurityAccessPanelProps) {
  return (
    <article aria-label="Security & Access Control Status" className={styles.panelCard}>
      <header className={styles.panelHeader}>
        <span className={styles.panelEyebrow}>Security & Access</span>
        <h2 className={styles.panelTitle}>Control Status</h2>
      </header>

      <div className={styles.panelList}>
        {items.map((item) => (
          <div className={styles.panelListItem} key={item.id}>
            <span className={styles.itemLabel}>{item.label}</span>
            <span className={styles.itemValue}>{item.value}</span>
          </div>
        ))}
      </div>

      <div className={styles.itemFootnote}>
        No security claim without source.
      </div>
    </article>
  );
}
