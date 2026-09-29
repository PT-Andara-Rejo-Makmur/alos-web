"use client";
import { PageHeader, Section, Tabs, type TabItem } from "@/components/ui";
import { HrLayout } from "../hr-layout";
import { HrSourceStateView } from "./hr-ui";
import styles from "../hr.module.css";

const detailTabs: Record<string, readonly TabItem[]> = {
  employee: ["Ringkasan", "Posisi", "Kehadiran", "Kinerja", "Dokumen", "Perubahan"].map((label) => ({ id: label, label })),
  candidate: ["Ringkasan", "Kontak", "Lamaran", "Interview", "Dokumen", "Keputusan"].map((label) => ({ id: label, label })),
  onboarding: ["Ringkasan", "Checklist", "Masa Percobaan", "Dokumen", "Aktivitas"].map((label) => ({ id: label, label })),
  review: ["Ringkasan", "Sasaran", "Kompetensi", "Umpan Balik", "Pengembangan"].map((label) => ({ id: label, label })),
};
export function HrDetailPage({ kind, workspaceKey }: Readonly<{ kind: keyof typeof detailTabs; recordId?: string; workspaceKey?: string }>) { return <HrLayout workspaceKey={workspaceKey}>{() => <div className={styles.page}><PageHeader description="Detail belum tersedia dari sumber SDM resmi." eyebrow="SDM" title={kind === "employee" ? "Detail Karyawan" : kind === "candidate" ? "Detail Kandidat" : kind === "onboarding" ? "Detail Onboarding" : "Detail Review Kinerja"} /><Tabs ariaLabel="Navigasi detail SDM" items={detailTabs[kind]} /><Section title="Sumber Data"><HrSourceStateView description="Data detail belum terhubung. Identitas pada URL tidak menentukan kewenangan." state="unavailable" /></Section></div>}</HrLayout>; }
