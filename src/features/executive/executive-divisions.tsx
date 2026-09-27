"use client";

import Link from "next/link";

import { DataTable, EmptyState, PageHeader, Section, Status, Tabs } from "@/components/ui";

import { ExecutiveLayout } from "./executive-layout";
import styles from "./executive.module.css";

const divisionRows = [
  ["Sales & Marketing", "sales"], ["Property & Teknik", "property"], ["Finance & Pajak", "finance"], ["Legal", "legal"], ["HR/GA", "hr"], ["IT", "it"],
] as const;

export function ExecutiveDivisionsPage() { return <ExecutiveLayout>{() => <div className={styles.page}>
  <PageHeader description="Pantau kesiapan data dan keterkaitan pekerjaan tiap divisi sesuai scope yang diberikan Backend." eyebrow="ORGANISASI" title="Divisi" />
  <Section title="Status Divisi"><DataTable caption="Daftar divisi" columns={[
    { header: "Divisi", key: "name", render: (row: readonly string[]) => row[0] }, { header: "Pemimpin / Owner", key: "owner", render: () => "—" }, { header: "Target Utama", key: "target", render: () => "—" }, { header: "Performance", key: "performance", render: () => "—" }, { header: "Proyek Aktif", key: "projects", render: () => "—" }, { header: "Tugas Terlambat", key: "tasks", render: () => "—" }, { header: "Temuan", key: "findings", render: () => "—" }, { header: "Persetujuan", key: "approvals", render: () => "—" }, { header: "Status Data", key: "status", render: () => <Status label="Belum Terhubung" variant="neutral" /> },
  ]} getRowKey={(row) => row[1]} rowAction={(row) => <Link className={styles.detailLink} href={`/workspace/executive/divisions/${row[1]}`}>Lihat Detail</Link>} rows={divisionRows} /></Section>
</div>}</ExecutiveLayout>; }

export function ExecutiveDivisionDetailPage({ divisionKey }: Readonly<{ divisionKey: string }>) {
  const division = divisionRows.find((row) => row[1] === divisionKey);
  return <ExecutiveLayout>{() => <div className={styles.page}>
    <PageHeader description="Kinerja dan pekerjaan divisi ditampilkan sesuai scope dan klasifikasi data yang diberikan Backend." eyebrow="ORGANISASI" title={division?.[0] ?? "Divisi"} />
    {!division ? <EmptyState action={<Link className={styles.detailLink} href="/workspace/executive/divisions">Kembali ke Divisi</Link>} description="Divisi yang diminta tidak tersedia pada ruang kerja ini." title="Divisi tidak ditemukan." /> : <>
      <Tabs ariaLabel="Detail divisi" items={[{ id: "summary", label: "Ringkasan" }, { id: "performance", label: "Kinerja" }, { id: "projects", label: "Proyek" }, { id: "tasks", label: "Tugas" }, { id: "approvals", label: "Persetujuan" }, { id: "findings", label: "Temuan" }, { id: "reports", label: "Laporan" }]} />
      <Section title="Ringkasan"><div className={styles.readinessRow}><Status label="Belum Terhubung" variant="neutral" /><p>Data detail divisi belum tersedia dari sumber authoritative.</p></div></Section>
      <Section title="Pekerjaan Divisi"><div className={styles.detailLinks}><Link className={styles.detailLink} href="/workspace/executive/projects">Proyek</Link><Link className={styles.detailLink} href="/workspace/executive/tasks">Tugas</Link><Link className={styles.detailLink} href="/workspace/executive/approvals">Persetujuan</Link><Link className={styles.detailLink} href="/workspace/executive/findings">Temuan</Link><Link className={styles.detailLink} href="/workspace/executive/reports">Laporan</Link></div></Section>
    </>}
  </div>}</ExecutiveLayout>;
}
