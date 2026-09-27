"use client";

import { EmptyState, PageHeader, Section, Status } from "@/components/ui";

import { ExecutiveLayout } from "./executive-layout";
import styles from "./executive.module.css";

export function ExecutiveInitiativesPage() { return <ExecutiveLayout>{() => <div className={styles.page}>
  <PageHeader description="Hubungkan strategi dengan pekerjaan yang dijalankan tanpa menciptakan data pelaksanaan baru di frontend." eyebrow="STRATEGI & KINERJA" title="Inisiatif Strategis" />
  <Section title="Inisiatif Strategis"><EmptyState description="Kontrak Initiative tersedia sebagai kebutuhan strategi, tetapi endpoint public belum tersedia. Data akan ditampilkan setelah sumber authoritative terhubung." title="Inisiatif belum terhubung." /></Section>
  <Section title="Kebutuhan Data"><div className={styles.readinessRow}><Status label="Butuh Kontrak" variant="neutral" /><p>Budget, jadwal, milestone, project, dan progres tidak dibuat sebagai payload tambahan tanpa contract.</p></div></Section>
</div>}</ExecutiveLayout>; }
