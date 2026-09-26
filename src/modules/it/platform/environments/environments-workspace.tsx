"use client";

import { Boxes, Server } from "lucide-react";
import { getModuleReadiness } from "@/features/workspace-routing";
import {
  ItDataTable,
  ItNotice,
  ItPageHeader,
  ItSectionHeader,
  ItStatusRow,
} from "@/modules/it/ui";
import styles from "./environments.module.css";

export function EnvironmentsWorkspace() {
  const readiness = getModuleReadiness("environments");

  return (
    <div className={styles.envWrapper}>
      <ItPageHeader
        breadcrumb="ALOS / IT & TEKNOLOGI / ENVIRONMENTS"
        description="Bukti operasional, tingkat deployment, dan batas konfigurasi untuk Development, Staging, dan Production."
        title="Environments"
      />

      {/* Module Readiness */}
      <section aria-label="Kesiapan modul">
        <ItStatusRow
          detail={readiness.blockReason ?? "BACKEND_NOT_CONNECTED"}
          helper="Ketersediaan modul ditentukan oleh matriks kesiapan terpusat."
          icon={Boxes}
          label="Kesiapan Modul"
          status={readiness.availability}
        />
      </section>

      {/* Environment Source Status */}
      <section aria-label="Status sumber environment">
        <ItStatusRow
          detail="NO_SOURCE"
          helper="Integrasi inventaris environment Backend belum tersedia."
          icon={Server}
          label="Sumber Inventaris Environment"
          status="NOT_CONNECTED"
        />
      </section>

      {/* Environment Registry */}
      <section aria-labelledby="env-registry-title" className={styles.section}>
        <ItSectionHeader
          eyebrow="Tingkat & Deployment"
          id="env-registry-title"
          subtitle="Tingkat deployment runtime dan batas konfigurasi aktif"
          title="Registri Environment"
        />

        <ItDataTable
          ariaLabel="Registri tingkat deployment environment"
          columns={["Environment", "Versi", "Status Deployment", "Bukti Terakhir", "Sumber"]}
          minWidth={760}
        >
          <tr>
            <td className={styles.emptyTableRow} colSpan={5}>
              Sumber inventaris environment dari Backend belum terhubung.
            </td>
          </tr>
        </ItDataTable>
      </section>

      {/* Configuration & Secret Boundary Notice */}
      <section aria-labelledby="env-boundary-title" className={styles.section}>
        <ItSectionHeader
          eyebrow="Keamanan & Isolasi"
          id="env-boundary-title"
          subtitle="Isolasi antara tingkat development, staging, dan production"
          title="Batas Konfigurasi"
        />

        <ItNotice
          title="Batas Konfigurasi & Perlindungan Secret"
          variant="neutral"
        >
          Descriptor environment runtime, digest rilis, dan bukti deployment memerlukan telemetri Backend yang berwenang. Environment variable sensitif, DSN, dan kredensial infrastruktur disamarkan dan tidak ditampilkan pada browser.
        </ItNotice>
      </section>
    </div>
  );
}
