"use client";

import { ShieldCheck } from "lucide-react";
import { getModuleReadiness } from "@/features/workspace-routing";
import {
  ItDataTable,
  ItNotice,
  ItPageHeader,
  ItSectionHeader,
  ItStatusRow,
} from "@/modules/it/ui";
import styles from "./security.module.css";

export function SecurityWorkspace() {
  const readiness = getModuleReadiness("security");

  return (
    <div className={styles.securityWrapper}>
      <ItPageHeader
        breadcrumb="ALOS / IT & TEKNOLOGI / SECURITY"
        description="Registri temuan keamanan, pelacakan remediasi kerentanan, dan bukti kepatuhan."
        title="Security"
      />

      {/* Module Readiness */}
      <section aria-label="Kesiapan modul">
        <ItStatusRow
          detail={readiness.blockReason ?? "BACKEND_NOT_CONNECTED"}
          helper="Ketersediaan modul mengikuti matriks kesiapan terpusat."
          icon={ShieldCheck}
          label="Kesiapan Modul"
          status={readiness.availability}
        />
      </section>

      {/* Security Source Status */}
      <section aria-label="Status sumber keamanan">
        <ItStatusRow
          detail="NOT_CONNECTED"
          helper="Sumber telemetri temuan keamanan dari Backend belum terhubung."
          icon={ShieldCheck}
          label="Sumber Temuan Keamanan"
          status="NOT_CONNECTED"
        />
      </section>

      {/* Security Findings Register */}
      <section aria-labelledby="security-findings-title" className={styles.section}>
        <ItSectionHeader
          eyebrow="Kerentanan & Postur"
          id="security-findings-title"
          subtitle="Temuan kerentanan, audit dependency, dan postur pertahanan"
          title="Temuan Keamanan"
        />

        <ItDataTable
          ariaLabel="Registri temuan keamanan"
          columns={["Temuan", "Severity", "Pemilik", "Status", "Bukti", "Pembaruan Terakhir"]}
          minWidth={840}
        >
          <tr>
            <td className={styles.emptyTableRow} colSpan={6}>
              Sumber temuan keamanan belum terhubung.
            </td>
          </tr>
        </ItDataTable>
      </section>

      {/* Review / Remediation & Evidence Coverage */}
      <section aria-labelledby="remediation-coverage-title" className={styles.section}>
        <ItSectionHeader
          eyebrow="Remediasi & Kepatuhan"
          id="remediation-coverage-title"
          subtitle="Target remediasi dan cakupan bukti kepatuhan"
          title="Tinjauan & Cakupan Bukti"
        />

        <ItNotice
          title="Batas Bukti Keamanan"
          variant="neutral"
        >
          Postur keamanan, temuan kerentanan, dan target remediasi memerlukan telemetri dari sumber penilaian keamanan yang berwenang. Tanpa sumber terhubung, tidak ada asumsi bahwa kerentanan berjumlah nol atau kepatuhan telah penuh.
        </ItNotice>
      </section>
    </div>
  );
}
