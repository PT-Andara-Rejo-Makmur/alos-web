"use client";

import { Siren } from "lucide-react";
import { getModuleReadiness } from "@/features/workspace-routing";
import {
  ItDataTable,
  ItNotice,
  ItPageHeader,
  ItSectionHeader,
  ItStatusRow,
} from "@/modules/it/ui";
import styles from "./incidents.module.css";

export function IncidentsWorkspace() {
  const readiness = getModuleReadiness("incidents");

  return (
    <div className={styles.incidentWrapper}>
      <ItPageHeader
        breadcrumb="ALOS / IT & TEKNOLOGI / INCIDENTS"
        description="Respons incident operasional, tindak lanjut, dan telemetri dampak layanan."
        title="Incidents"
      />

      {/* Module Readiness */}
      <section aria-label="Kesiapan modul">
        <ItStatusRow
          detail={readiness.blockReason ?? "BACKEND_NOT_CONNECTED"}
          helper="Ketersediaan modul mengikuti matriks kesiapan terpusat."
          icon={Siren}
          label="Kesiapan Modul"
          status={readiness.availability}
        />
      </section>

      {/* Incident Source Status */}
      <section aria-label="Status sumber incident">
        <ItStatusRow
          detail="NOT_CONNECTED"
          helper="Sumber pengelolaan incident dari Backend belum terhubung."
          icon={Siren}
          label="Sumber Incident"
          status="NOT_CONNECTED"
        />
      </section>

      {/* Incident Registry */}
      <section aria-labelledby="incident-registry-title" className={styles.section}>
        <ItSectionHeader
          eyebrow="Triage & Operasi"
          id="incident-registry-title"
          subtitle="Gangguan operasional, penilaian severity, dan pelacakan respons"
          title="Registri Incident"
        />

        <ItDataTable
          ariaLabel="Registri pengelolaan incident"
          columns={["Incident", "Severity", "Dampak", "Status", "Pemilik", "Pembaruan Terakhir"]}
          minWidth={840}
        >
          <tr>
            <td className={styles.emptyTableRow} colSpan={6}>
              Sumber incident belum terhubung.
            </td>
          </tr>
        </ItDataTable>
      </section>

      {/* Response Timeline & Ownership Boundary */}
      <section aria-labelledby="response-timeline-title" className={styles.section}>
        <ItSectionHeader
          eyebrow="Tindak Lanjut"
          id="response-timeline-title"
          subtitle="Linimasa respons dan item tindakan mitigasi"
          title="Linimasa Respons & Kepemilikan"
        />

        <ItNotice
          title="Batas Telemetri Operasional"
          variant="neutral"
        >
          Linimasa respons, klasifikasi severity, dan tinjauan setelah incident memerlukan telemetri operasional yang berwenang. Tanpa sumber yang terhubung, sistem tidak mengasumsikan jumlah incident nol atau nilai MTTR tertentu.
        </ItNotice>
      </section>
    </div>
  );
}
