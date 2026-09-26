"use client";

import { Rocket } from "lucide-react";
import { getModuleReadiness } from "@/features/workspace-routing";
import {
  ItDataTable,
  ItNotice,
  ItPageHeader,
  ItSectionHeader,
  ItStatusRow,
} from "@/modules/it/ui";
import styles from "./releases.module.css";

export function ReleasesWorkspace() {
  const readiness = getModuleReadiness("releases");

  return (
    <div className={styles.releaseWrapper}>
      <ItPageHeader
        breadcrumb="ALOS / IT & TEKNOLOGI / RELEASES"
        description="Registri rilis perangkat lunak, verifikasi gate rilis, dan bukti rollback deployment."
        title="Releases"
      />

      {/* Module Readiness */}
      <section aria-label="Kesiapan modul">
        <ItStatusRow
          detail={readiness.blockReason ?? "BACKEND_NOT_CONNECTED"}
          helper="Ketersediaan modul mengikuti matriks kesiapan terpusat."
          icon={Rocket}
          label="Kesiapan Modul"
          status={readiness.availability}
        />
      </section>

      {/* Release Source Status */}
      <section aria-label="Status sumber rilis">
        <ItStatusRow
          detail="NOT_CONNECTED"
          helper="Integrasi siklus rilis Backend belum tersedia."
          icon={Rocket}
          label="Sumber Siklus Rilis"
          status="NOT_CONNECTED"
        />
      </section>

      {/* Release Registry */}
      <section aria-labelledby="release-registry-title" className={styles.section}>
        <ItSectionHeader
          eyebrow="Siklus Rilis"
          id="release-registry-title"
          subtitle="Paket deployment dan riwayat promosi yang dikelola"
          title="Registri Rilis"
        />

        <ItDataTable
          ariaLabel="Registri siklus rilis"
          columns={["Rilis", "Versi", "Environment", "Status Gate", "Persetujuan", "Bukti"]}
          minWidth={840}
        >
          <tr>
            <td className={styles.emptyTableRow} colSpan={6}>
              Sumber siklus rilis dari Backend belum terhubung.
            </td>
          </tr>
        </ItDataTable>
      </section>

      {/* Gate Summary & Rollback Evidence */}
      <section aria-labelledby="rollback-evidence-title" className={styles.section}>
        <ItSectionHeader
          eyebrow="Tata Kelola & Rollback"
          id="rollback-evidence-title"
          subtitle="Persetujuan promosi dan bukti mekanisme rollback"
          title="Ringkasan Gate & Bukti Rollback"
        />

        <ItNotice
          title="Batas Tata Kelola Gate Rilis"
          variant="neutral"
        >
          Catatan tata kelola rilis, metrik canary, dan bukti rollback memerlukan sumber siklus rilis dari Backend. Versi, tanggal, dan persetujuan rilis tidak dibuat oleh lapisan presentasi client.
        </ItNotice>
      </section>
    </div>
  );
}
