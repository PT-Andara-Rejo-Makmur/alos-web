"use client";

import { FlaskConical } from "lucide-react";
import { getModuleReadiness } from "@/features/workspace-routing";
import {
  ItDataTable,
  ItNotice,
  ItPageHeader,
  ItSectionHeader,
  ItStatusRow,
} from "@/modules/it/ui";
import styles from "./uat.module.css";

export function UatWorkspace() {
  const readiness = getModuleReadiness("uat");

  return (
    <div className={styles.uatWrapper}>
      <ItPageHeader
        breadcrumb="ALOS / IT & TEKNOLOGI / TATA KELOLA / UAT & GATES"
        description="Hasil UAT, status gate, catatan, dan tindak lanjut dari sumber Backend."
        title="UAT & Gates"
      />

      {/* Module Readiness */}
      <section aria-label="Kesiapan modul">
        <ItStatusRow
          detail={readiness.blockReason ?? "BACKEND_NOT_CONNECTED"}
          helper="Ketersediaan modul mengikuti matriks kesiapan terpusat."
          icon={FlaskConical}
          label="Kesiapan Modul"
          status={readiness.availability}
        />
      </section>

      {/* UAT Source Status */}
      <section aria-label="Status sumber UAT">
        <ItStatusRow
          detail="NOT_CONNECTED"
          helper="Sumber bukti UAT dan gate dari Backend belum terhubung."
          icon={FlaskConical}
          label="Sumber Bukti UAT"
          status="NOT_CONNECTED"
        />
      </section>

      {/* Gate Registry */}
      <section aria-labelledby="gate-registry-title" className={styles.section}>
        <ItSectionHeader
          eyebrow="Gate Verifikasi"
          id="gate-registry-title"
          subtitle="Kriteria UAT dan persyaratan gate promosi rilis"
          title="Registri Gate"
        />

        <ItDataTable
          ariaLabel="Registri UAT dan gate rilis"
          columns={["Gate", "Target Rilis", "Hasil UAT", "Status", "Catatan", "Bukti"]}
          minWidth={860}
        >
          <tr>
            <td className={styles.emptyTableRow} colSpan={6}>
              Sumber bukti UAT dan gate belum terhubung.
            </td>
          </tr>
        </ItDataTable>
      </section>

      {/* Outstanding Gates & Approval Boundary */}
      <section aria-labelledby="outstanding-gates-title" className={styles.section}>
        <ItSectionHeader
          eyebrow="Tindak Lanjut"
          id="outstanding-gates-title"
          subtitle="Kriteria yang perlu ditindaklanjuti sebelum persetujuan promosi"
          title="Gate Belum Terpenuhi"
        />

        <ItNotice
          title="Batas Verifikasi UAT"
          variant="neutral"
        >
          Hasil UAT, validasi gate, catatan, dan tindak lanjut ditampilkan dari sumber Backend yang berwenang. Status lulus tidak dibuat oleh lapisan presentasi client.
        </ItNotice>
      </section>
    </div>
  );
}
