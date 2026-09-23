import type { HrEmployeeRelationsItem } from "./types";
import styles from "./hr-dashboard.module.css";

export function GrievancePersonnelPanel({
  items,
}: {
  readonly items: readonly HrEmployeeRelationsItem[];
}) {
  return (
    <article aria-label="Grievance dan Personnel" className={styles.panelCard}>
      <header className={styles.panelHeader}>
        <span className={styles.panelEyebrow}>Employee Relations</span>
        <h2 className={styles.panelTitle}>Grievance &amp; Personnel</h2>
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
