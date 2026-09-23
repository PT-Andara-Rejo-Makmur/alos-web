import type { HrCadenceItem } from "./types";
import styles from "./hr-dashboard.module.css";

export function HrControlCadence({
  items,
}: {
  readonly items: readonly HrCadenceItem[];
}) {
  return (
    <article aria-label="HR Control Cadence" className={styles.panelCard}>
      <header className={styles.panelHeader}>
        <span className={styles.panelEyebrow}>HR Control Cadence</span>
        <h2 className={styles.panelTitle}>Kontrol Harian · Mingguan · Bulanan</h2>
      </header>

      <div className={styles.cadenceTableWrapper}>
        <table className={styles.cadenceTable}>
          <thead>
            <tr>
              <th scope="col">Frekuensi</th>
              <th scope="col">Kontrol</th>
              <th scope="col">Bukti</th>
              <th scope="col">Status Sistem</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.controlId}>
                <td className={styles.cadenceFrequency}>{item.frequency}</td>
                <td>
                  <div className={styles.cadenceControl}>
                    <span className={styles.cadenceControlId}>{item.controlId}</span>
                    <span className={styles.cadenceControlName}>{item.controlName}</span>
                  </div>
                </td>
                <td className={styles.cadenceEvidence}>{item.workEvidence}</td>
                <td>
                  <span
                    className={
                      item.readinessStatus === "PARTIAL"
                        ? styles.badgePartial
                        : styles.badgeUnconnected
                    }
                  >
                    <span className={styles.dot} />
                    {item.readinessStatus === "LIVE"
                      ? "CONNECTED"
                      : item.readinessStatus === "PARTIAL"
                        ? "PARTIAL"
                        : "NOT CONNECTED"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}
