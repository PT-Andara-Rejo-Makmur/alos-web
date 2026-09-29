"use client";

import { useState } from "react";
import { PageHeader, Section, Tabs, type TabItem } from "@/components/ui";
import { HrLayout } from "../hr-layout";
import { HrSourceStateView } from "./hr-ui";
import styles from "../hr.module.css";

const detailTabs: Record<string, readonly TabItem[]> = {
  employee: ["Ringkasan", "Pekerjaan", "Dokumen", "Kehadiran", "Cuti", "Kinerja", "Pengembangan", "Kompensasi", "Akses", "Perubahan", "Riwayat"].map((label) => ({ id: label, label })),
  candidate: ["Ringkasan", "CV & Dokumen", "Aktivitas", "Interview", "Assessment", "Offer", "Catatan", "Riwayat"].map((label) => ({ id: label, label })),
  onboarding: ["Ringkasan", "Checklist", "Dokumen", "Akses", "Peralatan", "Orientasi", "Masa Percobaan", "Riwayat"].map((label) => ({ id: label, label })),
  review: ["Ringkasan", "Sasaran", "Kompetensi", "Umpan Balik", "Pengembangan", "Riwayat"].map((label) => ({ id: label, label })),
};

const detailDescriptions: Record<string, string> = {
  "CV & Dokumen": "CV dan dokumen kandidat belum tersedia dari sumber dokumen resmi.",
  "Kompensasi": "Informasi kompensasi memerlukan kewenangan khusus dan sumber resmi.",
  Akses: "Status akses dijalankan oleh IT/Identity dan belum tersedia di HR.",
  Peralatan: "Status peralatan berasal dari GA/IT dan belum tersedia.",
  Offer: "Offer dan persetujuannya belum tersedia dari sumber rekrutmen resmi.",
};

export function HrDetailPage({ kind, workspaceKey }: Readonly<{ kind: keyof typeof detailTabs; recordId?: string; workspaceKey?: string }>) {
  return <HrLayout workspaceKey={workspaceKey}>{() => <HrDetail kind={kind} />}</HrLayout>;
}

function HrDetail({ kind }: Readonly<{ kind: keyof typeof detailTabs }>) {
  const [activeTab, setActiveTab] = useState(detailTabs[kind][0]?.id ?? "");
  const title = kind === "employee" ? "Detail Karyawan" : kind === "candidate" ? "Detail Kandidat" : kind === "onboarding" ? "Detail Onboarding" : "Detail Review Kinerja";
  const description = detailDescriptions[activeTab] ?? `Data ${activeTab.toLowerCase()} belum tersedia dari sumber SDM resmi.`;
  return <div className={styles.page}><PageHeader description="Detail ditampilkan berdasarkan kewenangan ruang kerja; ID pada URL tidak menentukan akses." eyebrow="SDM" title={title} /><Tabs ariaLabel={`Navigasi ${title}`} items={detailTabs[kind]} onValueChange={setActiveTab} value={activeTab} /><Section title={activeTab}><HrSourceStateView description={description} state="unavailable" /></Section></div>;
}
