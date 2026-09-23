import type { ContractReviewRow } from "./types";
import styles from "./legal-dashboard.module.css";

interface ContractReviewPanelProps {
  readonly items: readonly ContractReviewRow[];
}

export function ContractReviewPanel({ items }: ContractReviewPanelProps) {
  return (
    <article aria-label="Review & Deviation Kontrak" className={styles.panelCard}>
      <header className={styles.panelHeader}>
        <span className={styles.panelEyebrow}>Contracts</span>
        <h2 className={styles.panelTitle}>Review & Deviation</h2>
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
        Signature authority is human-owned.
      </div>
    </article>
  );
}
