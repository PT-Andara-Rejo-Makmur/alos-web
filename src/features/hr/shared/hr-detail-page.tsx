"use client";

import { useState } from "react";
import { Button, PageHeader, Section, Tabs, type TabItem } from "@/components/ui";
import { HrLayout } from "../hr-layout";
import { HrSourceStateView, HrUnavailableFormDrawer, type HrFormField } from "./hr-ui";
import styles from "../hr.module.css";

const detailTabs: Record<string, readonly TabItem[]> = {
  employee: ["Ringkasan", "Pekerjaan", "Dokumen", "Kehadiran", "Cuti", "Kinerja", "Pengembangan", "Kompensasi", "Akses", "Perubahan", "Riwayat"].map((label) => ({ id: label, label })),
  candidate: ["Ringkasan", "CV & Dokumen", "Aktivitas", "Wawancara", "Penilaian", "Penawaran", "Catatan", "Riwayat"].map((label) => ({ id: label, label })),
  onboarding: ["Ringkasan", "Checklist", "Dokumen", "Akses", "Peralatan", "Orientasi", "Masa Percobaan", "Riwayat"].map((label) => ({ id: label, label })),
  review: ["Ringkasan", "Sasaran", "Kompetensi", "Umpan Balik", "Pengembangan", "Riwayat"].map((label) => ({ id: label, label })),
};

const detailDescriptions: Record<string, string> = {
  "CV & Dokumen": "CV dan dokumen kandidat belum tersedia dari sumber dokumen resmi.",
  "Kompensasi": "Informasi kompensasi memerlukan kewenangan khusus dan sumber resmi.",
  Akses: "Status akses dijalankan oleh IT/Identity dan belum tersedia di HR.",
  Peralatan: "Status peralatan berasal dari GA/IT dan belum tersedia.",
  Penawaran: "Penawaran dan persetujuannya belum tersedia dari sumber rekrutmen resmi.",
};

const employeeReadiness: readonly { readonly label: string; readonly fields: readonly HrFormField[]; readonly restricted?: boolean; readonly description?: string }[] = [
  { label: "Data Pribadi", fields: [{ label: "Karyawan", name: "employee", relation: true, required: true }, { label: "Nama", name: "name", required: true }, { label: "Kontak", name: "contact" }] },
  { label: "Penugasan Kerja", fields: [{ label: "Karyawan", name: "employee", relation: true, required: true }, { label: "Posisi", name: "position", relation: true, required: true }, { label: "Divisi", name: "division", relation: true, required: true }, { label: "Tanggal Berlaku", name: "effective_date", type: "date", required: true }] },
  { label: "Kompensasi", fields: [{ label: "Karyawan", name: "employee", relation: true, required: true }, { label: "Tanggal Berlaku", name: "effective_date", type: "date", required: true }], restricted: true, description: "Informasi kompensasi memerlukan kewenangan khusus dan belum tersedia." },
  { label: "Dokumen", fields: [{ label: "Karyawan", name: "employee", relation: true, required: true }, { label: "Dokumen Pendukung", name: "document", relation: true, required: true }] },
  { label: "Kontak Darurat", fields: [{ label: "Karyawan", name: "employee", relation: true, required: true }, { label: "Nama Kontak", name: "contact_name", required: true }, { label: "Hubungan", name: "relationship", required: true }, { label: "Kontak", name: "contact", required: true }] },
  { label: "Bank", fields: [{ label: "Karyawan", name: "employee", relation: true, required: true }], restricted: true, description: "Data rekening dibatasi dan belum tersedia dari sumber berwenang." },
  { label: "Pajak", fields: [{ label: "Karyawan", name: "employee", relation: true, required: true }], restricted: true, description: "Data pajak dibatasi dan belum tersedia dari sumber berwenang." },
];

export function HrDetailPage({ kind, workspaceKey }: Readonly<{ kind: keyof typeof detailTabs; recordId?: string; workspaceKey?: string }>) {
  return <HrLayout workspaceKey={workspaceKey}>{() => <HrDetail kind={kind} />}</HrLayout>;
}

function HrDetail({ kind }: Readonly<{ kind: keyof typeof detailTabs }>) {
  const [activeTab, setActiveTab] = useState(detailTabs[kind][0]?.id ?? "");
  const title = kind === "employee" ? "Detail Karyawan" : kind === "candidate" ? "Detail Kandidat" : kind === "onboarding" ? "Detail Onboarding" : "Detail Review Kinerja";
  const description = detailDescriptions[activeTab] ?? `Data ${activeTab.toLowerCase()} belum tersedia dari sumber SDM resmi.`;
  return <div className={styles.page}><PageHeader description="Detail ditampilkan berdasarkan kewenangan ruang kerja; ID pada URL tidak menentukan akses." eyebrow="SDM" title={title} /><Tabs ariaLabel={`Navigasi ${title}`} items={detailTabs[kind]} onValueChange={setActiveTab} value={activeTab} /><Section title={activeTab}><HrSourceStateView description={description} state="unavailable" /></Section>{kind === "employee" && activeTab === "Ringkasan" ? <Section description="Setiap permukaan disiapkan terpisah. Data sensitif tidak ditampilkan tanpa kewenangan sumber." title="Kesiapan Form Karyawan"><div className={styles.formStack}>{employeeReadiness.map((item) => <EmployeeReadinessAction key={item.label} {...item} />)}</div></Section> : null}</div>;
}

function EmployeeReadinessAction({ description, fields, label, restricted }: (typeof employeeReadiness)[number]) {
  const [open, setOpen] = useState(false);
  return <div><Button disabled={restricted} onClick={() => setOpen(true)} size="sm" variant="secondary">{label}</Button>{restricted ? <p>{description}</p> : <HrUnavailableFormDrawer description="Form disiapkan sebagai readiness. Penyimpanan belum tersedia." fields={fields} onClose={() => setOpen(false)} open={open} title={label} />}</div>;
}
