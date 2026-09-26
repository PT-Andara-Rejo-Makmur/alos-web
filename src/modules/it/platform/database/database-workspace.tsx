"use client";

import {
  Activity,
  Database,
  FileClock,
  RadioTower,
  Server,
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
import styles from "./database.module.css";

const OPERATIONAL_EVIDENCE_CATEGORIES = [
  {
    id: "connectivity",
    name: "Konektivitas Database",
    source: "Telemetri connection pool dari Backend",
    icon: RadioTower,
  },
  {
    id: "schema",
    name: "Skema & Migrasi",
    source: "Sumber catatan migrasi dan audit skema",
    icon: FileClock,
  },
  {
    id: "health",
    name: "Sinyal Kesehatan Engine",
    source: "Telemetri replika, performa query, dan resource",
    icon: Activity,
  },
] as const;

export function DatabaseWorkspace() {
  const readiness = getModuleReadiness("database");

  return (
    <div className={styles.databaseWrapper}>
      <ItPageHeader
        breadcrumb="ALOS / IT & TEKNOLOGI / DATABASE"
        description="Inventaris database, bukti konektivitas, operasi skema, dan batas akses terkendali."
        title="Database"
      />

      {/* Module Readiness */}
      <section aria-label="Kesiapan modul">
        <ItStatusRow
          detail={readiness.blockReason ?? "BACKEND_NOT_CONNECTED"}
          helper="Ketersediaan modul ditentukan oleh matriks kesiapan terpusat."
          icon={Database}
          label="Kesiapan Modul"
          status={readiness.availability}
        />
      </section>

      {/* Database Source Status */}
      <section aria-label="Status sumber database">
        <ItStatusRow
          detail="NO_SOURCE"
          helper="Sumber inventaris database dari Backend belum terhubung."
          icon={Server}
          label="Sumber Inventaris Database"
          status="NOT_CONNECTED"
        />
      </section>

      {/* Database Registry */}
      <section aria-labelledby="database-registry-title" className={styles.section}>
        <ItSectionHeader
          eyebrow="Inventaris"
          id="database-registry-title"
          subtitle="Instance database dan topologi koneksi dari sumber berwenang"
          title="Registri Database"
        />

        <ItDataTable
          ariaLabel="Registri instance database"
          columns={["Database", "Environment", "Engine", "Konektivitas", "Bukti Terakhir", "Sumber"]}
          minWidth={780}
        >
          <tr>
            <td className={styles.emptyTableRow} colSpan={6}>
              Sumber inventaris database dari Backend belum terhubung.
            </td>
          </tr>
        </ItDataTable>
      </section>

      {/* Operational Evidence */}
      <section aria-labelledby="database-evidence-title" className={styles.section}>
        <ItSectionHeader
          eyebrow="Operasi"
          id="database-evidence-title"
          subtitle="Status telemetri operasional database dan catatan migrasi"
          title="Bukti Operasional"
        />

        <div className={styles.evidenceList}>
          {OPERATIONAL_EVIDENCE_CATEGORIES.map((category) => {
            const Icon = category.icon;
            return (
              <div className={styles.evidenceRow} key={category.id}>
                <div className={styles.evidenceIdentity}>
                  <Icon aria-hidden={true} size={18} />
                  <span>{category.name}</span>
                </div>
                <span className={styles.evidenceSource}>{category.source}</span>
                <ItStatusBadge status="NOT_CONNECTED" />
              </div>
            );
          })}
        </div>
      </section>

      {/* Security Boundary */}
      <section aria-labelledby="database-security-title" className={styles.section}>
        <ItNotice title="Batas akses dan otoritas terkendali">
          Browser tidak terhubung langsung ke database bisnis. Otoritas dan kredensial database
          tetap berada di balik batas Backend atau infrastruktur. Connection string, username,
          password, dan host tidak ditampilkan pada client.
        </ItNotice>
      </section>
    </div>
  );
}
