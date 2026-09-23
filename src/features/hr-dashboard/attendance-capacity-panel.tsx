import type { HrAttendanceCapacityItem } from "./types";
import styles from "./hr-dashboard.module.css";

const SKELETON_WIDTHS: readonly string[] = ["80%", "30%", "20%", "45%"];

export function AttendanceCapacityPanel({
  items,
}: {
  readonly items: readonly HrAttendanceCapacityItem[];
}) {
  return (
    <article aria-label="Attendance dan Capacity" className={styles.panelCard}>
      <header className={styles.panelHeader}>
        <span className={styles.panelEyebrow}>People Operations</span>
        <h2 className={styles.panelTitle}>Attendance &amp; Capacity</h2>
        <p className={styles.panelSubtitle}>
          Kehadiran, leave, workload, dan coverage akan tampil dari source canonical.
        </p>
      </header>

      <div>
        {items.map((item, idx) => (
          <div className={styles.capacityRow} key={item.id}>
            <div className={styles.capacityRowHeader}>
              <span className={styles.itemLabel}>{item.label}</span>
              <span className={styles.itemValue}>{item.value}</span>
            </div>
            <div className={styles.capacityBarContainer}>
              <div
                className={styles.capacityBarSkeleton}
                style={{ width: SKELETON_WIDTHS[idx % SKELETON_WIDTHS.length] }}
              />
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}
