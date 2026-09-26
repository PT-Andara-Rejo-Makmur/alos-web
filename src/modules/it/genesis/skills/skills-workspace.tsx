"use client";

import { Blocks } from "lucide-react";
import { getModuleReadiness } from "@/features/workspace-routing";
import {
  ItDataTable,
  ItNotice,
  ItPageHeader,
  ItSectionHeader,
  ItStatusRow,
} from "@/modules/it/ui";
import styles from "./skills.module.css";

export function SkillsWorkspace() {
  const readiness = getModuleReadiness("skills");

  return (
    <div className={styles.skillWrapper}>
      <ItPageHeader
        breadcrumb="ALOS / IT & TEKNOLOGI / GENESIS / SKILLS"
        description="Modul kapabilitas teknis, tools agen yang dapat digunakan kembali, dan status siklus kapabilitas."
        title="Skills"
      />

      {/* Module Readiness */}
      <section aria-label="Kesiapan modul">
        <ItStatusRow
          detail={readiness.blockReason ?? "BACKEND_NOT_CONNECTED"}
          helper="Ketersediaan modul mengikuti matriks kesiapan terpusat."
          icon={Blocks}
          label="Kesiapan Modul"
          status={readiness.availability}
        />
      </section>

      {/* Skill Registry Source Status */}
      <section aria-label="Status sumber registri skill">
        <ItStatusRow
          detail="NOT_CONNECTED"
          helper="Integrasi registri skill Backend belum tersedia."
          icon={Blocks}
          label="Sumber Registri Skill"
          status="NOT_CONNECTED"
        />
      </section>

      {/* Skills Registry */}
      <section aria-labelledby="skills-registry-title" className={styles.section}>
        <ItSectionHeader
          eyebrow="Unit Kapabilitas"
          id="skills-registry-title"
          subtitle="Definisi skill teknis dan keterkaitannya dengan agen terdaftar"
          title="Registri Skills"
        />

        <ItDataTable
          ariaLabel="Registri skill teknis"
          columns={["Skill", "Tujuan", "Siklus", "Agen", "Sumber"]}
          minWidth={780}
        >
          <tr>
            <td className={styles.emptyTableRow} colSpan={5}>
              Sumber registri skill dari Backend belum terhubung.
            </td>
          </tr>
        </ItDataTable>
      </section>

      {/* Sandbox & Tool Boundary Notice */}
      <section aria-labelledby="skills-boundary-title" className={styles.section}>
        <ItSectionHeader
          eyebrow="Batas Eksekusi"
          id="skills-boundary-title"
          subtitle="Eksekusi kapabilitas dan penerapan batas akses"
          title="Batas Kapabilitas"
        />

        <ItNotice
          title="Pemanggilan Skill Terkendali"
          variant="neutral"
        >
          Skills merupakan unit eksekusi yang terkait dengan agen. Tanpa koneksi ke registri Backend yang berwenang, ketersediaan skill tidak diasumsikan dan tidak dibuat secara lokal.
        </ItNotice>
      </section>
    </div>
  );
}
