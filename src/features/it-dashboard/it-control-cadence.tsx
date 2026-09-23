import type { ItCadenceItem } from "./types";
import styles from "./it-dashboard.module.css";

interface ItControlCadenceProps {
  readonly cadence: readonly ItCadenceItem[];
}

export function ItControlCadence({ cadence }: ItControlCadenceProps) {
  return (
    <article aria-label="IT Control Cadence" className={styles.panelCard}>
      <header className={styles.panelHeader}>
        <span className={styles.panelEyebrow}>IT Control Cadence</span>
        <h2 className={styles.panelTitle}>Operasi · Assurance · Recovery</h2>
      </header>

      <div className={styles.cadenceTableWrapper}>
        <table className={styles.cadenceTable}>
          <thead>
            <tr>
              <th scope="col">Frekuensi</th>
              <th scope="col">Kontrol</th>
              <th scope="col">Bukti</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {cadence.map((item) => {
              const isPartial = item.readinessStatus === "PARTIAL";

              return (
                <tr key={item.controlId}>
                  <td className={styles.cadenceFrequency}>{item.frequency}</td>
                  <td>
                    <div className={styles.cadenceControl}>
                      <span className={styles.cadenceControlName}>
                        {item.controlName}
                      </span>
                    </div>
                  </td>
                  <td className={styles.cadenceEvidence}>{item.workEvidence}</td>
                  <td>
                    <span
                      className={
                        isPartial ? styles.badgePartial : styles.badgeUnconnected
                      }
                    >
                      {item.readinessStatus === "PARTIAL"
                        ? "PARTIAL"
                        : "NOT CONNECTED"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </article>
  );
}
