"use client";

import Link from "next/link";

import { EmptyState, PageHeader, Section, Status } from "@/components/ui";

import { ExecutiveLayout } from "./executive-layout";
import styles from "./executive.module.css";

const briefSections = [
  ["Kondisi perusahaan saat ini", "Kondisi akan diringkas ketika sumber authoritative tersedia."],
  ["Sorotan utama", "Sorotan lintas domain belum tersedia."],
  ["Keputusan hari ini", "Keputusan yang memerlukan perhatian tersedia melalui Persetujuan."],
  ["Risiko dan peringatan", "Risiko akan ditampilkan dari Temuan yang dapat diakses."],
  ["Progres penting", "Progres lintas pekerjaan belum tersedia."],
  ["Agenda dan tenggat", "Agenda akan ditampilkan saat sumber pekerjaan tersedia."],
] as const;

export function ExecutiveBriefPage() {
  return <ExecutiveLayout>{() => (
    <div className={styles.page}>
      <PageHeader description="Kondisi perusahaan yang dapat dibaca singkat untuk mendukung arahan dan keputusan." eyebrow="EKSEKUTIF" title="Brief Eksekutif" />
      <div className={styles.briefGrid}>
        {briefSections.map(([title, description]) => <Section bordered key={title} title={title}><div className={styles.readinessRow}><Status label="Belum Terhubung" variant="neutral" /><p>{description}</p></div></Section>)}
      </div>
      <Section title="Arahan" description="Arahan akan dibuat sebagai tugas Shared Work setelah tindakan dan permission canonical tersedia.">
        <EmptyState action={<Link className={styles.detailLink} href="/workspace/executive/tasks">Buka Tugas</Link>} description="Tidak ada tindakan yang dapat dibuat dari halaman ini tanpa permission dan mutation task yang tersedia." title="Arahan belum siap dibuat." />
      </Section>
      <Section title="Analisis GENESIS"><div className={styles.readinessRow}><Status label="Belum Terhubung" variant="neutral" /><p>Advisory GENESIS belum tersedia.</p></div></Section>
    </div>
  )}</ExecutiveLayout>;
}
