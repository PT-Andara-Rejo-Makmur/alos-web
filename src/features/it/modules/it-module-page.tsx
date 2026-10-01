"use client";
import { EmptyState, PageHeader, Section } from "@/components/ui";
import { ItLayout } from "../it-layout";
import { ItCanonicalPage } from "../canonical-page";
import { AccountManagementPage } from "../account-management-page";
import { itResources } from "../resources";
export type ItModule = "services" | "systems" | "infrastructure" | "alos-genesis" | "integrations" | "access" | "security" | "changes" | "assets" | "support";
const modules = {
  "services": { title: "Layanan & Insiden", resources: [itResources.incidents, itResources.service_monitors], unavailable: ["Live Monitoring", "SLA", "Problem / Root Cause"] },
  "systems": { title: "Sistem & Aplikasi", resources: [itResources.systems], unavailable: ["Health Live"] },
  "infrastructure": { title: "Infrastruktur & Lingkungan", resources: [itResources.databases, itResources.environments, itResources.backup_policies, itResources.backup_runs, itResources.restore_tests, itResources.dr_plans], unavailable: ["Eksekusi Backup atau Restore"] },
  "alos-genesis": { title: "ALOS & GENESIS", resources: [itResources.systems], unavailable: ["Integrasi GENESIS", "Runtime Live", "ARA"] },
  "integrations": { title: "Integrasi & Connector", resources: [itResources.integrations], unavailable: ["Connector Eksternal", "Sinkronisasi Live"] },
  "security": { title: "Keamanan & Kepatuhan", resources: [itResources.security_findings, itResources.backup_policies, itResources.restore_tests, itResources.dr_plans], unavailable: ["Skor Keamanan", "Shared Work Finding Otomatis"] },
  "changes": { title: "Perubahan & Rilis", resources: [itResources.repositories, itResources.cicd_pipelines, itResources.ci_runs, itResources.releases, itResources.technical_debts], unavailable: ["Production Approve / Release / Rollback", "Eksekusi GitHub Live"] },
};
export function ItModulePage({ module, workspaceKey }: Readonly<{ module: ItModule; workspaceKey?: string }>) {
  if (module === "access") return <AccountManagementPage workspaceKey={workspaceKey ?? ""} />;
  if (module === "assets" || module === "support") return <ItLayout workspaceKey={workspaceKey}>{() => <div><PageHeader title={module === "assets" ? "Aset IT" : "Dukungan & Permintaan"} /><Section title="Sumber Data"><EmptyState title="Belum Tersedia" description="Belum ada persistence canonical untuk capability ini." /></Section></div>}</ItLayout>;
  return <ItCanonicalPage {...modules[module]} workspaceKey={workspaceKey} description="Inventaris dan hasil operasional tercatat dalam workspace aktif. Rekaman ini tidak menjalankan connector, infrastruktur, atau keputusan produksi." />;
}
