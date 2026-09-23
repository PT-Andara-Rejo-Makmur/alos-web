import type { LegalCadenceItem } from "./types";
import styles from "./legal-dashboard.module.css";

interface LegalControlCadenceProps {
  readonly cadence: readonly LegalCadenceItem[];
}

export function LegalControlCadence({ cadence }: LegalControlCadenceProps) {
  return (
    <article aria-label="Legal Control Cadence" className={styles.panelCard}>
      <header className={styles.panelHeader}>
        <span className={styles.panelEyebrow}>Legal Control Cadence</span>
        <h2 className={styles.panelTitle}>Kontrol Harian · Mingguan · Material</h2>
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
