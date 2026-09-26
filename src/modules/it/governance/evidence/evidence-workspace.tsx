"use client";

import { Fingerprint } from "lucide-react";
import { getModuleReadiness } from "@/features/workspace-routing";
import {
  ItDataTable,
  ItNotice,
  ItPageHeader,
  ItSectionHeader,
  ItStatusRow,
} from "@/modules/it/ui";
import styles from "./evidence.module.css";

export function EvidenceWorkspace() {
  const readiness = getModuleReadiness("evidence");

  return (
    <div className={styles.evidenceWrapper}>
      <ItPageHeader
        breadcrumb="ALOS / IT & TEKNOLOGI / TATA KELOLA / EVIDENCE"
        description="Bukti, sumber, waktu, keterkaitan, dan status validasi dari Backend."
        title="Evidence"
      />

      {/* Module Readiness */}
      <section aria-label="Kesiapan modul">
        <ItStatusRow
          detail={readiness.blockReason ?? "BACKEND_NOT_CONNECTED"}
          helper="Ketersediaan modul mengikuti matriks kesiapan terpusat."
          icon={Fingerprint}
          label="Kesiapan Modul"
          status={readiness.availability}
        />
      </section>

      {/* Evidence Source Status */}
      <section aria-label="Status sumber bukti">
        <ItStatusRow
          detail="NOT_CONNECTED"
          helper="Integrasi sumber bukti Backend belum tersedia."
          icon={Fingerprint}
          label="Sumber Bukti"
          status="NOT_CONNECTED"
        />
      </section>

      {/* Evidence Registry */}
      <section aria-labelledby="evidence-registry-title" className={styles.section}>
        <ItSectionHeader
          eyebrow="Bukti & Sumber"
          id="evidence-registry-title"
          subtitle="Referensi bukti dan status validasi dari sumber yang berwenang"
          title="Registri Bukti"
        />

        <ItDataTable
          ariaLabel="Registri bukti audit"
          columns={["ID Bukti", "Jenis Sumber", "Waktu", "Keterkaitan", "Status", "Referensi"]}
          minWidth={860}
        >
          <tr>
            <td className={styles.emptyTableRow} colSpan={6}>
              Sumber bukti dari Backend belum terhubung.
            </td>
          </tr>
        </ItDataTable>
      </section>

      {/* Validation / Freshness & Safe Citation Boundary */}
      <section aria-labelledby="evidence-boundary-title" className={styles.section}>
        <ItSectionHeader
          eyebrow="Validasi & Keamanan"
          id="evidence-boundary-title"
          subtitle="Referensi validasi tanpa menampilkan kredensial sensitif"
          title="Validasi & Referensi Aman"
        />

        <ItNotice
          title="Batas Sumber Bukti"
          variant="neutral"
        >
          Bukti dan referensi validasi berasal dari Backend. Saat sumber bukti belum terhubung, tidak ada status verifikasi yang diasumsikan. Kredensial sensitif tidak ditampilkan di client.
        </ItNotice>
      </section>
    </div>
  );
}
