import React from "react";
import {
  AlertCircle,
  AppWindow,
  Boxes,
  Database,
  DatabaseBackup,
  Info,
  Lock,
  Server,
} from "lucide-react";
import styles from "./it-monitoring.module.css";

const COVERAGE_CATEGORIES = [
  { id: "app", name: "Application", icon: AppWindow },
  { id: "backend", name: "Backend", icon: Server },
  { id: "infra", name: "Infrastructure", icon: Boxes },
  { id: "db", name: "Database", icon: Database },
  { id: "sec", name: "Security", icon: Lock },
  { id: "backup", name: "Backup", icon: DatabaseBackup },
] as const;

export function ItMonitoringWorkspace() {
  return (
    <div className={styles.monitoringWrapper}>
      {/* Header */}
      <header className={styles.headerRow}>
        <div className={styles.contextBar}>
          <span className={styles.breadcrumbs}>ALOS / IT &amp; TECHNOLOGY / MONITORING</span>
          <h1 className={styles.pageTitle}>Monitoring</h1>
          <p className={styles.subtitle}>
            Operational telemetry and service health.
          </p>
        </div>
      </header>

      {/* A. Telemetry Source Status Strip */}
      <section aria-label="Status Sumber Telemetri" className={styles.sourceStatusStrip}>
        <div className={styles.sourceStatusLeft}>
          <span aria-hidden="true" className={styles.sourceIconWrapper}>
            <AlertCircle aria-hidden={true} size={18} />
          </span>
          <div className={styles.sourceStatusText}>
            <span className={styles.sourceStatusTitle}>Telemetry Source: NOT CONNECTED</span>
            <span className={styles.sourceStatusContext}>
              Backend telemetry integration belum tersedia.
            </span>
          </div>
        </div>
      </section>

      {/* B. Service Health Table */}
      <section aria-label="Status Kesehatan Layanan" className={styles.consoleSection}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitleGroup}>
            <span className={styles.sectionEyebrow}>LIVE SERVICES</span>
            <h2 className={styles.sectionTitle}>Service Health Table</h2>
          </div>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.serviceTable}>
            <thead>
              <tr>
                <th scope="col">Service</th>
                <th scope="col">Environment</th>
                <th scope="col">Health</th>
                <th scope="col">Last Signal</th>
                <th scope="col">Source</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className={styles.emptyTableRow} colSpan={5}>
                  No telemetry source connected.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* C. Active Signal / Event Stream */}
      <section aria-label="Aliran Sinyal dan Peristiwa Operasional" className={styles.consoleSection}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitleGroup}>
            <span className={styles.sectionEyebrow}>TELEMETRY STREAM</span>
            <h2 className={styles.sectionTitle}>Active Signal &amp; Event Stream</h2>
          </div>
        </div>

        <div className={styles.eventStreamBox}>
          <span className={styles.emptyEventText}>No operational events available.</span>
        </div>
      </section>

      {/* D. Monitoring Coverage */}
      <section aria-label="Cakupan Pemantauan Sistem" className={styles.consoleSection}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitleGroup}>
            <span className={styles.sectionEyebrow}>SCOPE &amp; COVERAGE</span>
            <h2 className={styles.sectionTitle}>Monitoring Coverage</h2>
          </div>
        </div>

        <div className={styles.coverageGrid}>
          {COVERAGE_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <div className={styles.coverageCard} key={cat.id}>
                <div className={styles.coverageHeader}>
                  <Icon aria-hidden={true} size={15} />
                  <span className={styles.coverageTitle}>{cat.name}</span>
                </div>
                <span className={styles.coverageState}>NOT CONNECTED</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* E. Operational Notice */}
      <footer className={styles.operationalNotice} role="note">
        <Info aria-hidden={true} className={styles.noticeIcon} size={16} />
        <span>
          Monitoring page is presentation only. Source of truth remains backend telemetry and operations integrations.
        </span>
      </footer>
    </div>
  );
}
