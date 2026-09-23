import type { SalesCadenceItem } from "./types";
import styles from "./sales-dashboard.module.css";

export function SalesControlCadence({
  items,
}: {
  readonly items: readonly SalesCadenceItem[];
}) {
  return (
    <article aria-label="Sales Control Cadence dan Quality Gate" className={styles.panelCard}>
      <header className={styles.panelHeader}>
        <span className={styles.panelEyebrow}>Operational Control</span>
        <h2 className={styles.panelTitle}>Sales Control Cadence &amp; Quality Gate</h2>
        <p className={styles.panelSubtitle}>
          Pemeriksaan harian, mingguan, dan bulanan sesuai SOP penjualan properti
        </p>
      </header>

      <div className={styles.cadenceTableWrapper}>
        <table className={styles.cadenceTable}>
          <thead>
            <tr>
              <th scope="col">Frekuensi</th>
              <th scope="col">Kontrol Operasional</th>
              <th scope="col">Bukti Kerja</th>
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
                  <span className={styles.badgeUnconnected}>
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
