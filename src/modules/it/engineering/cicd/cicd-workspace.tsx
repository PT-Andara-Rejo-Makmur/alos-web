"use client";

import { Play, Workflow } from "lucide-react";
import { getModuleReadiness } from "@/features/workspace-routing";
import {
  ItDataTable,
  ItNotice,
  ItPageHeader,
  ItSectionHeader,
  ItStatusRow,
} from "@/modules/it/ui";
import styles from "./cicd.module.css";

export function CicdWorkspace() {
  const readiness = getModuleReadiness("cicd");

  return (
    <div className={styles.cicdWrapper}>
      <ItPageHeader
        breadcrumb="ALOS / IT & TEKNOLOGI / CI/CD"
        description="Eksekusi pipeline build, verifikasi quality gate, dan telemetri deployment otomatis."
        title="CI/CD"
      />

      {/* Module Readiness */}
      <section aria-label="Kesiapan modul">
        <ItStatusRow
          detail={readiness.blockReason ?? "BACKEND_NOT_CONNECTED"}
          helper="Ketersediaan modul mengikuti matriks kesiapan terpusat."
          icon={Workflow}
          label="Kesiapan Modul"
          status={readiness.availability}
        />
      </section>

      {/* CI/CD Source Status */}
      <section aria-label="Status sumber CI/CD">
        <ItStatusRow
          detail="NOT_CONNECTED"
          helper="Sumber pipeline CI/CD dari Backend belum terhubung."
          icon={Play}
          label="Sumber Pipeline CI/CD"
          status="NOT_CONNECTED"
        />
      </section>

      {/* Pipeline Runs */}
      <section aria-labelledby="pipeline-runs-title" className={styles.section}>
        <ItSectionHeader
          eyebrow="Continuous Integration"
          id="pipeline-runs-title"
          subtitle="Eksekusi pipeline otomatis pada tahap build dan test"
          title="Riwayat Pipeline"
        />

        <ItDataTable
          ariaLabel="Registri riwayat pipeline CI/CD"
          columns={["Pipeline", "Branch", "Tahap", "Status", "Bukti Terakhir", "Sumber"]}
          minWidth={820}
        >
          <tr>
            <td className={styles.emptyTableRow} colSpan={6}>
              Sumber telemetri CI/CD dari Backend belum terhubung.
            </td>
          </tr>
        </ItDataTable>
      </section>

      {/* Quality Gates & Deployment Proof */}
      <section aria-labelledby="quality-gates-title" className={styles.section}>
        <ItSectionHeader
          eyebrow="Gate Verifikasi"
          id="quality-gates-title"
          subtitle="Gate otomatis untuk lint, unit test, pemindaian keamanan, dan verifikasi build"
          title="Quality Gate & Bukti Deployment"
        />

        <ItNotice
          title="Batas Verifikasi Build"
          variant="neutral"
        >
          Hasil quality gate dan bukti deployment memerlukan koneksi ke sumber build yang berwenang. Nomor build dan hasil test tidak dibuat oleh lapisan presentasi.
        </ItNotice>
      </section>
    </div>
  );
}
