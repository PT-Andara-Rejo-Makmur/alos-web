"use client";

import { Scale } from "lucide-react";
import { getModuleReadiness } from "@/features/workspace-routing";
import {
  ItDataTable,
  ItNotice,
  ItPageHeader,
  ItSectionHeader,
  ItStatusRow,
} from "@/modules/it/ui";
import styles from "./decisions.module.css";

export function DecisionsWorkspace() {
  const readiness = getModuleReadiness("decisions");

  return (
    <div className={styles.decisionsWrapper}>
      <ItPageHeader
        breadcrumb="ALOS / IT & TEKNOLOGI / TATA KELOLA / DECISIONS"
        description="Keputusan teknologi, pihak yang memutuskan, alasan, waktu, dan bukti pendukung."
        title="Decisions"
      />

      {/* Module Readiness */}
      <section aria-label="Kesiapan modul">
        <ItStatusRow
          detail={readiness.blockReason ?? "BACKEND_NOT_CONNECTED"}
          helper="Ketersediaan modul mengikuti matriks kesiapan terpusat."
          icon={Scale}
          label="Kesiapan Modul"
          status={readiness.availability}
        />
      </section>

      {/* Decision Source Status */}
      <section aria-label="Status sumber keputusan">
        <ItStatusRow
          detail="NOT_CONNECTED"
          helper="Integrasi sumber keputusan teknologi Backend belum tersedia."
          icon={Scale}
          label="Sumber Keputusan Teknologi"
          status="NOT_CONNECTED"
        />
      </section>

      {/* Technology Decision Register */}
      <section aria-labelledby="decisions-register-title" className={styles.section}>
        <ItSectionHeader
          eyebrow="Tata Kelola Teknologi"
          id="decisions-register-title"
          subtitle="Keputusan teknologi dan bukti pendukung dari sumber yang berwenang"
          title="Registri Keputusan Teknologi"
        />

        <ItDataTable
          ariaLabel="Registri keputusan teknologi"
          columns={["Keputusan", "Pihak", "Alasan", "Status", "Bukti", "Waktu"]}
          minWidth={860}
        >
          <tr>
            <td className={styles.emptyTableRow} colSpan={6}>
              Sumber keputusan teknologi dari Backend belum terhubung.
            </td>
          </tr>
        </ItDataTable>
      </section>

      {/* Evidence Links & Decision Boundary */}
      <section aria-labelledby="evidence-links-title" className={styles.section}>
        <ItSectionHeader
          eyebrow="Bukti Pendukung"
          id="evidence-links-title"
          subtitle="Keterkaitan keputusan dengan bukti yang tersedia"
          title="Referensi Bukti"
        />

        <ItNotice
          title="Batas Sumber Keputusan"
          variant="neutral"
        >
          Keputusan teknologi ditampilkan dari sumber Backend yang berwenang. Jika sumber keputusan belum tersedia, tidak ada keputusan yang dibuat secara lokal.
        </ItNotice>
      </section>
    </div>
  );
}
