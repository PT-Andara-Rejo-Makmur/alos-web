import type { ComplianceControlRow } from "./types";
import styles from "./legal-dashboard.module.css";

interface ComplianceControlPanelProps {
  readonly items: readonly ComplianceControlRow[];
}

export function ComplianceControlPanel({ items }: ComplianceControlPanelProps) {
  return (
    <article aria-label="Claims & Privacy Compliance" className={styles.panelCard}>
      <header className={styles.panelHeader}>
        <span className={styles.panelEyebrow}>Compliance</span>
        <h2 className={styles.panelTitle}>Claims & Privacy</h2>
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
        No regulatory score without source.
      </div>
    </article>
  );
}
