"use client";

import { Alert, EmptyState, PageHeader, Section, Status } from "@/components/ui";

import type { AraContext } from "./ara-model";
import styles from "./ara.module.css";

export function AraReadiness({ context }: Readonly<{ context: AraContext }>) {
  const scopeSummary = context.scopeRefs.length > 0
    ? context.scopeRefs.join(", ")
    : context.activeWorkspace.workspaceKey;

  return (
    <div className={styles.page}>
      <PageHeader
        description="ARA membaca dan menganalisis informasi sesuai ruang kerja aktif, kewenangan, dan klasifikasi data Anda."
        eyebrow="ARA · ASISTEN RUANG KERJA"
        metadata={`Ruang kerja aktif: ${context.activeWorkspace.workspaceName}`}
        title="Tanya ARA"
      />

      <div className={styles.contextBanner}>
        <div className={styles.contextItem}>
          <span className={styles.contextLabel}>Ruang Kerja</span>
          <span className={styles.contextValue}>{context.activeWorkspace.workspaceName}</span>
        </div>
        <div className={styles.contextItem}>
          <span className={styles.contextLabel}>Pengguna</span>
          <span className={styles.contextValue}>{context.actor.displayName}</span>
        </div>
        <div className={styles.contextItem}>
          <span className={styles.contextLabel}>Klasifikasi Maksimum</span>
          <span className={styles.contextValue}>{context.classificationLabel}</span>
        </div>
        <div className={styles.contextItem}>
          <span className={styles.contextLabel}>Lingkup Kerja</span>
          <span className={styles.contextValue}>{scopeSummary}</span>
        </div>
      </div>

      <Section title="Kesiapan ARA">
        <EmptyState
          description="Integrasi ARA belum tersedia. Tidak ada percakapan atau jawaban yang dibuat secara simulasi."
          title="ARA belum terhubung."
        />
      </Section>

      <Section title="Batas Akses">
        <div className={styles.readinessRow}>
          <Status label="Kewenangan Aktif" variant="neutral" />
          <p>ARA hanya dapat membaca data sesuai ruang kerja, hak akses, ruang lingkup, dan klasifikasi yang berlaku.</p>
        </div>
      </Section>

      <Section title="Batas Percakapan">
        <Alert
          message="Setiap interaksi ARA terikat pada identitas pengguna dan ruang kerja aktif. Riwayat percakapan tidak dibagikan atau dicampur lintas ruang kerja."
          title="Thread Terisolasi Berdasarkan Ruang Kerja"
          variant="neutral"
        />
      </Section>
    </div>
  );
}
