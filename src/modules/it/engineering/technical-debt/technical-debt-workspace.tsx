"use client";

import { Wrench } from "lucide-react";
import { getModuleReadiness } from "@/features/workspace-routing";
import {
  ItDataTable,
  ItNotice,
  ItPageHeader,
  ItSectionHeader,
  ItStatusRow,
} from "@/modules/it/ui";
import styles from "./technical-debt.module.css";

export function TechnicalDebtWorkspace() {
  const readiness = getModuleReadiness("tech-debt");

  return (
    <div className={styles.debtWrapper}>
      <ItPageHeader
        breadcrumb="ALOS / IT & TEKNOLOGI / TECHNICAL DEBT"
        description="Registri technical debt, item remediasi arsitektur, dan prioritas refactoring."
        title="Technical Debt"
      />

      {/* Module Readiness */}
      <section aria-label="Kesiapan modul">
        <ItStatusRow
          detail={readiness.blockReason ?? "BACKEND_NOT_CONNECTED"}
          helper="Ketersediaan modul mengikuti matriks kesiapan terpusat."
          icon={Wrench}
          label="Kesiapan Modul"
          status={readiness.availability}
        />
      </section>

      {/* Tech Debt Source Status */}
      <section aria-label="Status sumber technical debt">
        <ItStatusRow
          detail="NOT_CONNECTED"
          helper="Sumber registri technical debt dari Backend belum terhubung."
          icon={Wrench}
          label="Sumber Registri Technical Debt"
          status="NOT_CONNECTED"
        />
      </section>

      {/* Technical Debt Registry */}
      <section aria-labelledby="debt-registry-title" className={styles.section}>
        <ItSectionHeader
          eyebrow="Backlog Remediasi"
          id="debt-registry-title"
          subtitle="Item technical debt, kompromi arsitektur, dan pemilik remediasi"
          title="Registri Technical Debt"
        />

        <ItDataTable
          ariaLabel="Registri technical debt"
          columns={["Item", "Area", "Dampak", "Prioritas", "Pemilik", "Status", "Bukti"]}
          minWidth={880}
        >
          <tr>
            <td className={styles.emptyTableRow} colSpan={7}>
              Sumber registri technical debt belum terhubung.
            </td>
          </tr>
        </ItDataTable>
      </section>

      {/* Backlog Boundary Notice */}
      <section aria-labelledby="debt-boundary-title" className={styles.section}>
        <ItSectionHeader
          eyebrow="Batas Integritas"
          id="debt-boundary-title"
          subtitle="Sinkronisasi backlog memerlukan sumber yang berwenang"
          title="Batas Remediasi"
        />

        <ItNotice
          title="Batas Sumber Backlog"
          variant="neutral"
        >
          Pelacakan technical debt memerlukan data backlog engineering dari Backend. Item contoh, mock, atau estimasi tidak ditampilkan agar informasi tetap dapat diaudit dan sesuai sumber.
        </ItNotice>
      </section>
    </div>
  );
}
