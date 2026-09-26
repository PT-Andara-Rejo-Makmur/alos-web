"use client";

import { DatabaseBackup } from "lucide-react";
import { getModuleReadiness } from "@/features/workspace-routing";
import {
  ItDataTable,
  ItNotice,
  ItPageHeader,
  ItSectionHeader,
  ItStatusRow,
} from "@/modules/it/ui";
import styles from "./backup-dr.module.css";

export function BackupDrWorkspace() {
  const readiness = getModuleReadiness("backup");

  return (
    <div className={styles.backupWrapper}>
      <ItPageHeader
        breadcrumb="ALOS / IT & TEKNOLOGI / BACKUP & DR"
        description="Jadwal perlindungan data, bukti backup, dan pengujian restore disaster recovery."
        title="Backup & DR"
      />

      {/* Module Readiness */}
      <section aria-label="Kesiapan modul">
        <ItStatusRow
          detail={readiness.blockReason ?? "BACKEND_NOT_CONNECTED"}
          helper="Ketersediaan modul mengikuti matriks kesiapan terpusat."
          icon={DatabaseBackup}
          label="Kesiapan Modul"
          status={readiness.availability}
        />
      </section>

      {/* Backup Source Status */}
      <section aria-label="Status sumber backup">
        <ItStatusRow
          detail="NOT_CONNECTED"
          helper="Integrasi sumber bukti backup Backend belum tersedia."
          icon={DatabaseBackup}
          label="Sumber Bukti Backup"
          status="NOT_CONNECTED"
        />
      </section>

      {/* Backup Controls */}
      <section aria-labelledby="backup-controls-title" className={styles.section}>
        <ItSectionHeader
          eyebrow="Perlindungan Data"
          id="backup-controls-title"
          subtitle="Kebijakan snapshot, cadence database dump, dan periode retensi"
          title="Kontrol & Kebijakan Backup"
        />

        <ItDataTable
          ariaLabel="Registri kontrol dan kebijakan backup"
          columns={["Kontrol", "Jadwal", "Bukti Terakhir", "Status", "Sumber"]}
          minWidth={780}
        >
          <tr>
            <td className={styles.emptyTableRow} colSpan={5}>
              Sumber bukti backup dari Backend belum terhubung.
            </td>
          </tr>
        </ItDataTable>
      </section>

      {/* Restore Tests */}
      <section aria-labelledby="restore-tests-title" className={styles.section}>
        <ItSectionHeader
          eyebrow="Disaster Recovery"
          id="restore-tests-title"
          subtitle="Pelaksanaan uji restore serta target RTO dan RPO"
          title="Pengujian Restore"
        />

        <ItDataTable
          ariaLabel="Catatan pengujian restore disaster recovery"
          columns={["Pengujian Restore", "Environment", "Bukti", "Hasil", "Sumber"]}
          minWidth={780}
        >
          <tr>
            <td className={styles.emptyTableRow} colSpan={5}>
              Sumber bukti pengujian restore belum terhubung.
            </td>
          </tr>
        </ItDataTable>
      </section>

      {/* DR Readiness Boundary */}
      <section aria-labelledby="dr-readiness-title" className={styles.section}>
        <ItSectionHeader
          eyebrow="Batas Verifikasi"
          id="dr-readiness-title"
          subtitle="Bukti kemampuan pemulihan dari sumber operasional"
          title="Kesiapan Disaster Recovery"
        />

        <ItNotice
          title="Batas Telemetri Disaster Recovery"
          variant="neutral"
        >
          Status backup, restore, RTO, dan RPO memerlukan bukti dari Backend atau sistem operasional yang terhubung. Kemampuan pemulihan tidak diasumsikan tanpa bukti dari sumber yang berwenang.
        </ItNotice>
      </section>
    </div>
  );
}
