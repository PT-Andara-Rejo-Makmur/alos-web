"use client";

import { BrainCircuit, Cpu } from "lucide-react";
import { getModuleReadiness } from "@/features/workspace-routing";
import {
  ItDataTable,
  ItNotice,
  ItPageHeader,
  ItSectionHeader,
  ItStatusRow,
} from "@/modules/it/ui";
import styles from "./models-tools.module.css";

export function ModelsToolsWorkspace() {
  const readiness = getModuleReadiness("models-tools");

  return (
    <div className={styles.modelsWrapper}>
      <ItPageHeader
        breadcrumb="ALOS / IT & TEKNOLOGI / GENESIS / MODELS & TOOLS"
        description="Registri model dan tools teknis, kebijakan penggunaan, serta batas runtime."
        title="Models & Tools"
      />

      {/* Module Readiness */}
      <section aria-label="Kesiapan modul">
        <ItStatusRow
          detail={readiness.blockReason ?? "BACKEND_NOT_CONNECTED"}
          helper="Ketersediaan modul mengikuti matriks kesiapan terpusat."
          icon={BrainCircuit}
          label="Kesiapan Modul"
          status={readiness.availability}
        />
      </section>

      {/* Registry Source Status */}
      <section aria-label="Status sumber registri">
        <ItStatusRow
          detail="NOT_CONNECTED"
          helper="Sumber model dan tools dari Backend belum terhubung."
          icon={Cpu}
          label="Sumber Model & Tools"
          status="NOT_CONNECTED"
        />
      </section>

      {/* Models Registry */}
      <section aria-labelledby="models-registry-title" className={styles.section}>
        <ItSectionHeader
          eyebrow="Model Teknis"
          id="models-registry-title"
          subtitle="Route model, batas konteks, dan kebijakan penggunaan"
          title="Registri Model"
        />

        <ItDataTable
          ariaLabel="Registri model teknis"
          columns={["Route Model", "Penyedia", "Kebijakan Kuota", "Batas Data", "Status", "Sumber"]}
          minWidth={840}
        >
          <tr>
            <td className={styles.emptyTableRow} colSpan={6}>
              Sumber registri model belum terhubung.
            </td>
          </tr>
        </ItDataTable>
      </section>

      {/* Tools Registry */}
      <section aria-labelledby="tools-registry-title" className={styles.section}>
        <ItSectionHeader
          eyebrow="Kapabilitas Runtime"
          id="tools-registry-title"
          subtitle="Tools runtime, lingkungan eksekusi, dan cakupan izin"
          title="Registri Tools"
        />

        <ItDataTable
          ariaLabel="Registri tools runtime"
          columns={["Key Tool", "Runtime", "Cakupan Izin", "Kebijakan Audit", "Status", "Sumber"]}
          minWidth={840}
        >
          <tr>
            <td className={styles.emptyTableRow} colSpan={6}>
              Sumber registri tools belum terhubung.
            </td>
          </tr>
        </ItDataTable>
      </section>

      {/* Credential & Telemetry Boundary Notice */}
      <section aria-labelledby="credential-boundary-title" className={styles.section}>
        <ItSectionHeader
          eyebrow="Keamanan & Isolasi"
          id="credential-boundary-title"
          subtitle="Perlindungan kredensial dan telemetri sesuai sumber"
          title="Kebijakan Penggunaan & Isolasi"
        />

        <ItNotice
          title="Batas Kredensial & Sumber"
          variant="neutral"
        >
          Model dan tools hanya ditampilkan jika tersedia melalui sumber Backend yang diizinkan. Kredensial penyedia, token rahasia, dan endpoint upstream tidak ditampilkan di browser. Ketersediaan model tidak diasumsikan tanpa telemetri Backend.
        </ItNotice>
      </section>
    </div>
  );
}
