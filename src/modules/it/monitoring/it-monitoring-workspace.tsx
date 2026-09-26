import {
  Activity,
  AppWindow,
  Database,
  DatabaseBackup,
  RadioTower,
  Server,
  ShieldCheck,
} from "lucide-react";
import { getModuleReadiness } from "@/features/workspace-routing";
import {
  ItDataTable,
  ItNotice,
  ItPageHeader,
  ItSectionHeader,
  ItStatusBadge,
  ItStatusRow,
} from "@/modules/it/ui";
import styles from "./it-monitoring.module.css";

const COVERAGE_CATEGORIES = [
  { id: "app", name: "Application", source: "Application telemetry", icon: AppWindow },
  { id: "backend", name: "Backend", source: "Backend telemetry", icon: Server },
  { id: "infra", name: "Infrastructure", source: "Infrastructure telemetry", icon: RadioTower },
  { id: "db", name: "Database", source: "Database telemetry", icon: Database },
  { id: "security", name: "Security", source: "Security telemetry", icon: ShieldCheck },
  { id: "backup", name: "Backup", source: "Backup reports", icon: DatabaseBackup },
] as const;

export function ItMonitoringWorkspace() {
  const readiness = getModuleReadiness("monitoring");

  return (
    <div className={styles.monitoringWrapper}>
      <ItPageHeader
        breadcrumb="ALOS / IT & TECHNOLOGY / MONITORING"
        description="Operational telemetry, service health, signals, and coverage."
        title="Monitoring"
      />

      <section aria-label="Telemetry source">
        <ItStatusRow
          detail={readiness.blockReason}
          helper="Backend telemetry integration unavailable."
          icon={RadioTower}
          label="Telemetry Source"
          status="NOT_CONNECTED"
        />
      </section>

      <section aria-labelledby="service-health-title" className={styles.section}>
        <ItSectionHeader
          eyebrow="Services"
          id="service-health-title"
          subtitle={`${readiness.availability} · ${readiness.blockReason ?? "Source unavailable"}`}
          title="Service Health"
        />
        <ItDataTable
          ariaLabel="Service health telemetry"
          columns={["Service", "Environment", "Health", "Last Signal", "Source"]}
          minWidth={760}
        >
          <tr>
            <td className={styles.emptyTableRow} colSpan={5}>No telemetry source connected.</td>
          </tr>
        </ItDataTable>
      </section>

      <section aria-labelledby="event-stream-title" className={styles.section}>
        <ItSectionHeader eyebrow="Signals" id="event-stream-title" title="Signal / Event Stream" />
        <div className={styles.eventRegion} role="status">
          <Activity aria-hidden={true} size={18} />
          <span>No operational events available.</span>
        </div>
      </section>

      <section aria-labelledby="monitoring-coverage-title" className={styles.section}>
        <ItSectionHeader
          eyebrow="Source coverage"
          id="monitoring-coverage-title"
          title="Monitoring Coverage"
        />
        <div className={styles.coverageList}>
          {COVERAGE_CATEGORIES.map((category) => {
            const Icon = category.icon;
            return (
              <div className={styles.coverageRow} key={category.id}>
                <div className={styles.coverageIdentity}>
                  <Icon aria-hidden={true} size={18} />
                  <span>{category.name}</span>
                </div>
                <span className={styles.coverageSource}>{category.source}</span>
                <ItStatusBadge status="NOT_CONNECTED" />
              </div>
            );
          })}
        </div>
      </section>

      <ItNotice title="Boundary notice">
        This surface is presentation-only. Backend telemetry remains source of truth.
      </ItNotice>
    </div>
  );
}
