"use client";
import { UnavailableFeature } from "@/components/unavailable-feature";
import { HrLayout } from "./hr-layout";
import { HrCanonicalPage } from "./canonical-page";
import { hrResources } from "./resources";
import { StrategyPerformance } from "@/features/business-records/strategy-performance";
import { HrCanonicalSummary } from "./canonical-summary";

const modules = {
  ga: { title: "GA & Fasilitas", resources: [hrResources.facility_requests, hrResources.inventory_items, hrResources.asset_handovers, hrResources.maintenance_records, hrResources.service_assessments], unavailable: ["Sinkronisasi Sistem Aset Eksternal", "Eksekusi Penyedia Eksternal"] },
  organization: { title: "Organisasi & Tenaga Kerja", resources: [hrResources.employees], unavailable: ["Hierarki Organisasi"] },
  recruitment: { title: "Rekrutmen & Kandidat", resources: [hrResources.recruitments, hrResources.candidates, hrResources.interviews], unavailable: ["Telaah ARA"] },
  onboarding: { title: "Onboarding & Masa Percobaan", resources: [hrResources.onboardings], unavailable: ["Masa Percobaan"] },
  employees: { title: "Karyawan", resources: [hrResources.employees], unavailable: ["Penyediaan Akun dari HR", "Revokasi Akses dari HR"] },
  attendance: { title: "Kehadiran & Cuti", resources: [hrResources.attendances, hrResources.leave_requests], unavailable: ["Koreksi Kehadiran", "Saldo Cuti", "Lembur"] },
  peoplePerformance: { title: "Kinerja & Pengembangan", resources: [hrResources.performance_reviews, hrResources.trainings, hrResources.training_enrollments, hrResources.successions, hrResources.succession_candidates], unavailable: ["Penilaian Otomatis"] },
  compliance: { title: "Dokumen & Kepatuhan", resources: [hrResources.employment_contracts, hrResources.personnel_files, hrResources.grievances], unavailable: ["Penandatanganan Digital Kontrak Kerja", "Kepatuhan Regulasi Otomatis"] },
  offboarding: { title: "Perubahan & Offboarding", resources: [hrResources.employees], unavailable: [] },
};
export function HrModulePage({ module, workspaceKey }: Readonly<{ module: keyof typeof modules | "compensation" | "ga"; workspaceKey?: string }>) {
  if (module === "compensation") return <HrLayout workspaceKey={workspaceKey}>{() => <UnavailableFeature feature="Kompensasi & Benefit" backHref={workspaceKey ? `/workspace/${encodeURIComponent(workspaceKey)}/summary` : "/workspace"} backLabel="Kembali ke Ringkasan HR & GA" />}</HrLayout>;
  const config = modules[module];
  return <HrCanonicalPage {...config} workspaceKey={workspaceKey} description="Kelola kebutuhan karyawan, kesiapan kerja, dan tindak lanjut layanan perusahaan." />;
}
export const HrSummaryPage = HrCanonicalSummary;
export function HrPerformancePage({ workspaceKey }: Readonly<{ workspaceKey?: string }>) {
  return <HrLayout workspaceKey={workspaceKey}>{(session) => <StrategyPerformance key={session.principal && "actor" in session.principal ? session.principal.active_workspace?.workspace.workspace_id : "unknown"} domain="HR & GA" />}</HrLayout>;
}
