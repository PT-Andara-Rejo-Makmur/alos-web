"use client";

import { EmptyState, PageHeader, Section, Status } from "@/components/ui";

import { ExecutiveLayout } from "./executive-layout";
import styles from "./executive.module.css";

export function ExecutiveAraPage() { return <ExecutiveLayout>{() => <div className={styles.page}>
  <PageHeader description="ARA membantu membaca informasi yang dapat diakses oleh principal dan ruang kerja aktif Anda." eyebrow="ARA" title="Tanya ARA" />
  <Section title="Kesiapan ARA"><EmptyState description="Integrasi ARA belum tersedia. Tidak ada percakapan atau jawaban yang dibuat secara simulasi." title="ARA belum terhubung." /></Section>
  <Section title="Batas Akses"><div className={styles.readinessRow}><Status label="Mengikuti Backend" variant="neutral" /><p>ARA hanya dapat membaca data sesuai principal, workspace, permission, scope, dan classification yang diberikan Backend.</p></div></Section>
</div>}</ExecutiveLayout>; }
