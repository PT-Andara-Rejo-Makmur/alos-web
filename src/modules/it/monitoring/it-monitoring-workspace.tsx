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
  { id: "app", name: "Aplikasi", source: "Telemetri aplikasi", icon: AppWindow },
  { id: "backend", name: "Backend", source: "Telemetri Backend", icon: Server },
  { id: "infra", name: "Infrastruktur", source: "Telemetri infrastruktur", icon: RadioTower },
  { id: "db", name: "Database", source: "Telemetri database", icon: Database },
  { id: "security", name: "Keamanan", source: "Telemetri keamanan", icon: ShieldCheck },
  { id: "backup", name: "Backup", source: "Laporan backup", icon: DatabaseBackup },
] as const;

export function ItMonitoringWorkspace() {
  const readiness = getModuleReadiness("monitoring");

  return (
    <div className={styles.monitoringWrapper}>
      <ItPageHeader
        breadcrumb="ALOS / IT & TEKNOLOGI / MONITORING"
        description="Telemetri operasional, kesehatan layanan, sinyal, dan cakupan."
        title="Monitoring"
      />

      <section aria-label="Sumber telemetri">
        <ItStatusRow
          detail={readiness.blockReason}
          helper="Integrasi telemetri Backend belum tersedia."
          icon={RadioTower}
          label="Sumber Telemetri"
          status="NOT_CONNECTED"
        />
      </section>

      <section aria-labelledby="service-health-title" className={styles.section}>
        <ItSectionHeader
          eyebrow="Layanan"
          id="service-health-title"
          subtitle={`${readiness.availability} · ${readiness.blockReason ?? "Sumber belum tersedia"}`}
          title="Kesehatan Layanan"
        />
        <ItDataTable
          ariaLabel="Telemetri kesehatan layanan"
          columns={["Layanan", "Environment", "Kesehatan", "Sinyal Terakhir", "Sumber"]}
          minWidth={760}
        >
          <tr>
            <td className={styles.emptyTableRow} colSpan={5}>Sumber telemetri belum terhubung.</td>
          </tr>
        </ItDataTable>
      </section>

      <section aria-labelledby="event-stream-title" className={styles.section}>
        <ItSectionHeader eyebrow="Sinyal" id="event-stream-title" title="Aliran Sinyal / Event" />
        <div className={styles.eventRegion} role="status">
          <Activity aria-hidden={true} size={18} />
          <span>Event operasional belum tersedia.</span>
        </div>
      </section>

      <section aria-labelledby="monitoring-coverage-title" className={styles.section}>
        <ItSectionHeader
          eyebrow="Cakupan Sumber"
          id="monitoring-coverage-title"
          title="Cakupan Monitoring"
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

      <ItNotice title="Catatan Batas Otoritas">
        Permukaan ini hanya untuk presentasi. Telemetri Backend tetap menjadi sumber kebenaran.
      </ItNotice>
    </div>
  );
}
