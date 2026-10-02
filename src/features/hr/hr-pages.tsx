"use client";
import { EmptyState, PageHeader, Section } from "@/components/ui";
import { HrLayout } from "./hr-layout";
import { HrCanonicalPage } from "./canonical-page";
import { hrResources } from "./resources";
import { StrategyPerformance } from "@/features/business-records/strategy-performance";
import { HrCanonicalSummary } from "./canonical-summary";

const modules = {
  ga: { title: "GA & Fasilitas", resources: [hrResources.facility_requests, hrResources.inventory_items, hrResources.asset_handovers, hrResources.maintenance_records, hrResources.service_assessments], unavailable: ["Sinkronisasi Sistem Aset Eksternal", "Eksekusi Penyedia Eksternal"] },
  organization: { title: "Organisasi & Tenaga Kerja", resources: [hrResources.employees], unavailable: ["Hierarki Organisasi", "Kebutuhan Tenaga Kerja"] },
  recruitment: { title: "Rekrutmen & Kandidat", resources: [hrResources.recruitments, hrResources.candidates, hrResources.interviews], unavailable: ["Offer", "Keputusan Hiring atau Rejection Final", "Telaah ARA"] },
  onboarding: { title: "Onboarding & Masa Percobaan", resources: [hrResources.onboardings], unavailable: ["Masa Percobaan", "Penyediaan Akses dan Peralatan"] },
  employees: { title: "Karyawan", resources: [hrResources.employees], unavailable: ["Penyediaan Akun dari HR", "Revokasi Akses dari HR"] },
  attendance: { title: "Kehadiran & Cuti", resources: [hrResources.attendances, hrResources.leave_requests], unavailable: ["Approval Cuti Final", "Koreksi Kehadiran", "Saldo Cuti", "Lembur"] },
  peoplePerformance: { title: "Kinerja & Pengembangan", resources: [hrResources.performance_reviews, hrResources.trainings, hrResources.training_enrollments, hrResources.successions, hrResources.succession_candidates], unavailable: ["Penilaian Otomatis"] },
  compliance: { title: "Dokumen & Kepatuhan", resources: [hrResources.employment_contracts, hrResources.personnel_files, hrResources.grievances], unavailable: ["Signing Kontrak Kerja Final", "Kepatuhan Regulasi Otomatis"] },
  offboarding: { title: "Perubahan & Offboarding", resources: [hrResources.employees], unavailable: ["Workflow Offboarding", "Serah Terima dan Pencabutan Akses Lintas Domain"] },
};
export function HrModulePage({ module, workspaceKey }: Readonly<{ module: keyof typeof modules | "compensation" | "ga"; workspaceKey?: string }>) {
  if (module === "compensation") return <HrLayout workspaceKey={workspaceKey}>{() => <div><PageHeader title={"Kompensasi & Benefit"} /><Section title="Sumber Data"><EmptyState title="Belum Tersedia" description="Belum ada persistence canonical untuk capability ini. —" /></Section></div>}</HrLayout>;
  const config = modules[module];
  return <HrCanonicalPage {...config} workspaceKey={workspaceKey} description="Rekaman operasional HR dalam workspace aktif. Data karyawan, akun dan akses mempunyai kewenangan terpisah." />;
}
export const HrSummaryPage = HrCanonicalSummary;
export function HrPerformancePage({ workspaceKey }: Readonly<{ workspaceKey?: string }>) {
  return <HrLayout workspaceKey={workspaceKey}>{(session) => <StrategyPerformance key={session.principal && "actor" in session.principal ? session.principal.active_workspace?.workspace.workspace_id : "unknown"} domain="HR & GA" />}</HrLayout>;
}
