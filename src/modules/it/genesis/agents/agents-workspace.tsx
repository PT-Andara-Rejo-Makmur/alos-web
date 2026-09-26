"use client";

import { Bot } from "lucide-react";
import { getModuleReadiness } from "@/features/workspace-routing";
import {
  ItDataTable,
  ItNotice,
  ItPageHeader,
  ItSectionHeader,
  ItStatusRow,
} from "@/modules/it/ui";
import styles from "./agents.module.css";

export function AgentsWorkspace() {
  const readiness = getModuleReadiness("agents");

  return (
    <div className={styles.agentWrapper}>
      <ItPageHeader
        breadcrumb="ALOS / IT & TEKNOLOGI / GENESIS / AGENTS"
        description="Registri agen teknis, tahap siklus, batas izin, dan tingkat risiko operasional."
        title="Agents"
      />

      {/* Module Readiness */}
      <section aria-label="Kesiapan modul">
        <ItStatusRow
          detail={readiness.blockReason ?? "BACKEND_NOT_CONNECTED"}
          helper="Ketersediaan modul mengikuti matriks kesiapan terpusat."
          icon={Bot}
          label="Kesiapan Modul"
          status={readiness.availability}
        />
      </section>

      {/* Agent Registry Source Status */}
      <section aria-label="Status sumber registri agen">
        <ItStatusRow
          detail="NOT_CONNECTED"
          helper="Integrasi registri kontrak agen Backend belum tersedia."
          icon={Bot}
          label="Sumber Registri Agen"
          status="NOT_CONNECTED"
        />
      </section>

      {/* Agent Registry */}
      <section aria-labelledby="agent-registry-title" className={styles.section}>
        <ItSectionHeader
          eyebrow="Agen Teknis"
          id="agent-registry-title"
          subtitle="Agen AI teknis, ringkasan kontrak, dan gate persetujuan"
          title="Registri Agen"
        />

        <ItDataTable
          ariaLabel="Registri agen teknis"
          columns={["Agen", "Tujuan", "Siklus", "Risiko", "Persetujuan", "Bukti"]}
          minWidth={840}
        >
          <tr>
            <td className={styles.emptyTableRow} colSpan={6}>
              Sumber registri agen dari Backend belum terhubung.
            </td>
          </tr>
        </ItDataTable>
      </section>

      {/* Security & Boundary Notice */}
      <section aria-labelledby="agent-boundary-title" className={styles.section}>
        <ItSectionHeader
          eyebrow="Batas Kerahasiaan"
          id="agent-boundary-title"
          subtitle="Perlindungan template prompt, rahasia penyedia, dan kebijakan tools internal"
          title="Batas Keamanan & Isolasi"
        />

        <ItNotice
          title="Batas Keamanan Agen Teknis"
          variant="neutral"
        >
          Agen teknis mengikuti kebijakan control plane. Template prompt mentah, kunci penyedia, dan instruksi sistem privat tidak ditampilkan pada client. Registri ini hanya mencakup otomasi teknis, terpisah dari agen tenaga kerja bisnis.
        </ItNotice>
      </section>
    </div>
  );
}
