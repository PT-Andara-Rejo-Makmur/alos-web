"use client";

import type { ConstructionCadenceItem } from "./types";
import styles from "./property-dashboard.module.css";

interface ConstructionControlCadenceProps {
  readonly cadence: readonly ConstructionCadenceItem[];
}

export function ConstructionControlCadence({ cadence }: ConstructionControlCadenceProps) {
  return (
    <article
      aria-label="Ritme Kontrol Konstruksi dan Quality Gate"
      className={styles.panelCard}
    >
      <div className={styles.panelHeader}>
        <p className={styles.panelEyebrow}>CONSTRUCTION CONTROL CADENCE</p>
        <h2 className={styles.panelTitle}>Kontrol Lapangan &amp; Quality Gate</h2>
      </div>

      <div className={styles.cadenceTableWrap}>
        <table className={styles.cadenceTable}>
          <thead>
            <tr>
              <th scope="col">Frekuensi</th>
              <th scope="col">Kontrol Lapangan</th>
              <th scope="col">Bukti Kerja</th>
              <th scope="col" style={{ textAlign: "right" }}>
                Status Sistem
              </th>
            </tr>
          </thead>
          <tbody>
            {cadence.map((item) => {
              const statusClass =
                item.status === "LIVE"
                  ? styles.stateLive
                  : item.status === "PARTIAL"
                    ? styles.statePartial
                    : styles.stateNotConnected;

              const displayStatus =
                item.status === "NOT_CONNECTED" ? "NOT CONNECTED" : item.status;

              return (
                <tr key={item.controlId}>
                  <td className={styles.cadenceFreq}>{item.frequency}</td>
                  <td className={styles.cadenceName}>{item.name}</td>
                  <td className={styles.cadenceEvidence}>{item.evidence}</td>
                  <td className={`${styles.cadenceStatus} ${statusClass}`}>
                    {displayStatus}
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
