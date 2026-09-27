import { DASHBOARD_REQUIREMENTS, type BusinessDashboardKey } from "./data-requirements";
import styles from "./business-dashboard-foundation.module.css";

const CROSS_CHECKS: Partial<Record<BusinessDashboardKey, readonly string[]>> = {
  sales: ["Verified Closing vs unverified sales claim", "Sales ↔ Finance ↔ Legal verification"],
  property: ["Property ↔ Finance verification"],
  finance: ["Sales ↔ Finance ↔ Legal verification", "Property ↔ Finance verification", "Finance maker / checker / approver"],
  legal: ["Sales ↔ Finance ↔ Legal verification"],
};

/** Shared, source-honest Stage 1 presentation. It never computes authority or verification outcomes. */
export function BusinessDashboardFoundation({ dashboard }: { readonly dashboard: BusinessDashboardKey }) {
  const requirement = DASHBOARD_REQUIREMENTS[dashboard];
  const crossChecks = CROSS_CHECKS[dashboard] ?? [];
  return (
    <div className={styles.root} data-testid={`stage1-foundation-${dashboard}`}>
      <section className={styles.card} aria-label={`${requirement.label} information architecture`}>
        <p className={styles.eyebrow}>Arsitektur Informasi Stage 1</p>
        <h2 className={styles.title}>Area Monitoring</h2>
        <p className={styles.note}>Setiap area menunggu sumber authoritative Backend. Ketiadaan data tidak dianggap sehat.</p>
        <ol className={styles.areas}>{requirement.areas.map((area) => <li className={styles.area} key={area}>{area}</li>)}</ol>
      </section>
      {requirement.metrics.length > 0 && (
        <section className={styles.card} aria-label={`${requirement.label} KPI definitions`}>
          <p className={styles.eyebrow}>Definisi KPI</p>
          <h2 className={styles.title}>Target, Aktual, Forecast & Asumsi</h2>
          <p className={styles.note}>Definisi tersedia; nilai operasional tetap “—” sampai diterima dari sumber authoritative.</p>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead><tr><th>KPI</th><th>Nama</th><th>Target</th><th>Actual</th><th>Forecast</th><th>Assumption</th><th>Verification</th><th>Data</th></tr></thead>
              <tbody>{requirement.metrics.map((item) => <tr key={item.code}><td><code className={styles.code}>{item.code}</code></td><td>{item.name}</td><td>—</td><td>—</td><td>—</td><td>—</td><td className={styles.state}>UNVERIFIED</td><td className={styles.state}>NOT_CONNECTED</td></tr>)}</tbody>
            </table>
          </div>
        </section>
      )}
      {crossChecks.length > 0 && (
        <section className={styles.card} aria-label="Cross-division verification">
          <p className={styles.eyebrow}>Cross-check Lintas Divisi</p>
          <h2 className={styles.title}>Status Verifikasi</h2>
          <p className={styles.note}>Frontend hanya menampilkan hasil verifikasi yang nantinya authoritative dari Backend.</p>
          <div className={styles.crossChecks}>{crossChecks.map((label) => <span className={styles.crossCheck} key={label}>{label}: UNVERIFIED</span>)}</div>
        </section>
      )}
    </div>
  );
}
