import type { HrDashboardSnapshot } from "./types";
import { HrDataReadiness } from "./hr-data-readiness";
import { HrMetricGrid } from "./hr-metric-grid";
import { AttendanceCapacityPanel } from "./attendance-capacity-panel";
import { PerformanceTrainingPanel } from "./performance-training-panel";
import { GrievancePersonnelPanel } from "./grievance-personnel-panel";
import { HrControlCadence } from "./hr-control-cadence";
import { HrAgentSupport } from "./hr-agent-support";
import styles from "./hr-dashboard.module.css";

export function HrDashboardHome({
  snapshot,
}: {
  readonly snapshot: HrDashboardSnapshot;
}) {
  return (
    <div className={styles.dashboardWrapper}>
      {/* Top Header & Context Bar */}
      <header className={styles.headerRow}>
        <div className={styles.contextBar}>
          <span className={styles.breadcrumbs}>ALOS / HR &amp; People / Overview</span>
          <h1 className={styles.pageTitle}>HR &amp; People Command Center</h1>
          <p className={styles.subtitle}>
            Pantau kehadiran, kapasitas, pengembangan, kepatuhan berkas, dan tindak lanjut people operations.
          </p>
        </div>
      </header>

      {/* HR Data Readiness Panel */}
      <HrDataReadiness items={snapshot.readiness} />

      {/* Top 4 Aggregate KPI Metrics Grid */}
      <HrMetricGrid metrics={snapshot.metrics} />

      {/* Middle 3-Column Section: Attendance & Capacity, Development, Employee Relations */}
      <section aria-label="Operasional SDM dan Pengembangan" className={styles.middle3Grid}>
        <AttendanceCapacityPanel items={snapshot.attendanceCapacity} />
        <PerformanceTrainingPanel items={snapshot.development} />
        <GrievancePersonnelPanel items={snapshot.employeeRelations} />
      </section>

      {/* Bottom 2-Column Section: Control Cadence & People Intelligence */}
      <section aria-label="Kontrol Kepatuhan dan Kecerdasan Buatan SDM" className={styles.bottom2Grid}>
        <HrControlCadence items={snapshot.cadence} />
        <HrAgentSupport agents={snapshot.agents} />
      </section>
    </div>
  );
}
