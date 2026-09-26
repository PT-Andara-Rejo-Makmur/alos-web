"use client";

import { GitBranch, GitFork } from "lucide-react";
import { getModuleReadiness } from "@/features/workspace-routing";
import {
  ItDataTable,
  ItNotice,
  ItPageHeader,
  ItSectionHeader,
  ItStatusRow,
} from "@/modules/it/ui";
import styles from "./repositories.module.css";

export function RepositoriesWorkspace() {
  const readiness = getModuleReadiness("repositories");

  return (
    <div className={styles.repoWrapper}>
      <ItPageHeader
        breadcrumb="ALOS / IT & TEKNOLOGI / REPOSITORIES"
        description="Inventaris repositori, referensi version control source code, dan tata kelola kebijakan branch."
        title="Repositories"
      />

      {/* Kesiapan Modul */}
      <section aria-label="Kesiapan modul">
        <ItStatusRow
          detail={readiness.blockReason ?? "BACKEND_NOT_CONNECTED"}
          helper="Ketersediaan modul mengikuti matriks kesiapan terpusat."
          icon={GitBranch}
          label="Kesiapan Modul"
          status={readiness.availability}
        />
      </section>

      {/* Status Sumber Repositori */}
      <section aria-label="Status sumber repositori">
        <ItStatusRow
          detail="NOT_CONNECTED"
          helper="Integrasi inventaris repositori Backend belum tersedia."
          icon={GitFork}
          label="Sumber Repositori"
          status="NOT_CONNECTED"
        />
      </section>

      {/* Repository Registry */}
      <section aria-labelledby="repo-registry-title" className={styles.section}>
        <ItSectionHeader
          eyebrow="Version Control"
          id="repo-registry-title"
          subtitle="Codebase perusahaan dan tata kelola branch yang dipantau"
          title="Registri Repositori"
        />

        <ItDataTable
          ariaLabel="Registri inventaris repositori"
          columns={["Repositori", "Tujuan", "Pemilik", "Status", "Bukti Terakhir", "Sumber"]}
          minWidth={820}
        >
          <tr>
            <td className={styles.emptyTableRow} colSpan={6}>
              Sumber inventaris repositori dari Backend belum terhubung.
            </td>
          </tr>
        </ItDataTable>
      </section>

      {/* Authority & Security Boundary */}
      <section aria-labelledby="repo-security-title" className={styles.section}>
        <ItSectionHeader
          eyebrow="Keamanan & Akses"
          id="repo-security-title"
          subtitle="Browser tidak terhubung langsung ke penyedia VCS"
          title="Batas Otoritas"
        />

        <ItNotice
          title="Telemetri VCS Melalui Backend"
          variant="neutral"
        >
          ALOS Web tidak mengambil data GitHub atau penyedia VCS eksternal langsung dari browser. Inventaris repositori, riwayat commit, dan gate kepatuhan memerlukan sumber Backend yang berwenang. Token akses tidak disimpan di client.
        </ItNotice>
      </section>
    </div>
  );
}
