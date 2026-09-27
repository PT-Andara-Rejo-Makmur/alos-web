"use client";

import { useMemo, useState } from "react";

import { Alert, DataTable, EmptyState, LoadingState, PageHeader, Section, Status, Tabs, type TabItem } from "@/components/ui";
import type { StrategyPlan } from "@/lib/contracts";

import { ExecutiveLayout } from "./executive-layout";
import { useExecutiveStrategyData } from "./executive-data";
import { corporateTargets, periodLabel } from "./executive-model";
import styles from "./executive.module.css";

export function ExecutivePlanningPage() {
  return <ExecutiveLayout>{() => <PlanningContent />}</ExecutiveLayout>;
}

function PlanningContent() {
  const { data, error, loading } = useExecutiveStrategyData();
  const [tab, setTab] = useState("strategic");
  const tabs: readonly TabItem[] = useMemo(() => [
    { id: "strategic", label: "Renstra" }, { id: "operating", label: "RKAP" }, { id: "objectives", label: "Sasaran" },
    { id: "targets", label: "Target" }, { id: "assumptions", label: "Asumsi & Cascade" }, { id: "sources", label: "Sumber" },
  ], []);
  const plans = data?.plans ?? [];
  const strategicPlans = plans.filter((plan) => plan.plan_type === "STRATEGIC_PLAN");
  const operatingPlans = plans.filter((plan) => plan.plan_type === "OPERATING_PLAN");
  const targets = corporateTargets(data?.targets ?? []);

  return <div className={styles.page}>
    <PageHeader description="Kelola dan telaah rencana, sasaran, target, asumsi, serta cascade sesuai authority Backend." eyebrow="STRATEGI & KINERJA" title="Rencana & Target" />
    {error ? <Alert message={error} title="Data belum dapat dimuat." variant="warning" /> : null}
    <Tabs ariaLabel="Rencana dan target" items={tabs} onValueChange={setTab} value={tab} />
    {loading ? <LoadingState label="Memuat rencana dan target" variant="table" /> : null}
    {!loading && tab === "strategic" ? <PlanTable plans={strategicPlans} title="Renstra" /> : null}
    {!loading && tab === "operating" ? <PlanTable plans={operatingPlans} title="RKAP" /> : null}
    {!loading && tab === "objectives" ? <Readiness title="Sasaran Strategis" text="Sasaran tersedia per rencana. Pilih rencana pada detail Renstra untuk melihat sasaran yang dapat diakses." /> : null}
    {!loading && tab === "targets" ? <TargetTable targets={targets} /> : null}
    {!loading && tab === "assumptions" ? <Assumptions assumptions={data?.assumptions ?? []} /> : null}
    {!loading && tab === "sources" ? <Readiness title="Sumber & Evidence" text="Sumber dan evidence ditampilkan dari referensi immutable yang diberikan Strategy. Ekstraksi dokumen belum terhubung." /> : null}
  </div>;
}

function PlanTable({ plans, title }: Readonly<{ plans: readonly StrategyPlan[]; title: string }>) {
  return <Section title={title} description="Data mengikuti lifecycle dan authority Strategy."><DataTable caption={title} columns={[
    { header: "Nama", key: "name", render: (plan) => plan.name }, { header: "Periode", key: "period", render: (plan) => periodLabel(plan.period) },
    { header: "Owner", key: "owner", render: (plan) => plan.owner_role_ref || "—" }, { header: "Status", key: "status", render: (plan) => <Status label={lifecycleLabel(plan.lifecycle_state)} variant="neutral" /> },
    { header: "Materiality", key: "materiality", render: (plan) => plan.materiality }, { header: "Versi", key: "version", render: (plan) => String(plan.version) }, { header: "Update", key: "updated", render: (plan) => formatDate(plan.updated_at) },
  ]} getRowKey={(plan) => `${plan.plan_id}-${plan.version}`} rows={plans} /></Section>;
}

function TargetTable({ targets }: Readonly<{ targets: readonly { target_id: string; name: string; code: string; plan_ref: { id: string }; scope: { label?: string | null; type: string }; owner_role_ref: string; lifecycle_state: string }[] }>) {
  return <Section title="Target" description="Nilai target dicatat sebagai observasi TARGET, bukan dipindahkan ke metadata target."><DataTable caption="Target perusahaan" columns={[
    { header: "Kode", key: "code", render: (target) => target.code }, { header: "Nama", key: "name", render: (target) => target.name }, { header: "Rencana", key: "plan", render: (target) => target.plan_ref.id },
    { header: "Scope", key: "scope", render: (target) => target.scope.label ?? target.scope.type }, { header: "Owner", key: "owner", render: (target) => target.owner_role_ref || "—" }, { header: "Status", key: "status", render: (target) => <Status label={lifecycleLabel(target.lifecycle_state)} variant="neutral" /> },
  ]} getRowKey={(target) => target.target_id} rows={targets} /></Section>;
}

function Assumptions({ assumptions }: Readonly<{ assumptions: readonly { assumption_id: string; name: string; category: string; unit: string; lifecycle_state: string; verification_state: string }[] }>) {
  return <Section title="Asumsi & Cascade" description="Preview cascade dan penerimaan hasil mengikuti API Strategy. Tidak ada target turunan yang dibuat otomatis."><DataTable caption="Asumsi perencanaan" columns={[
    { header: "Nama", key: "name", render: (item) => item.name }, { header: "Kategori", key: "category", render: (item) => item.category }, { header: "Unit", key: "unit", render: (item) => item.unit },
    { header: "Status", key: "status", render: (item) => <Status label={lifecycleLabel(item.lifecycle_state)} variant="neutral" /> }, { header: "Verifikasi", key: "verification", render: (item) => item.verification_state },
  ]} getRowKey={(item) => item.assumption_id} rows={assumptions} /></Section>;
}

function Readiness({ title, text }: Readonly<{ title: string; text: string }>) { return <Section title={title}><EmptyState description={text} title="Belum ada data yang dapat ditampilkan." /></Section>; }
function lifecycleLabel(state: string): string { return ({ DRAFT: "Draf", UNDER_REVIEW: "Dalam Peninjauan", APPROVED: "Disetujui", ACTIVE: "Aktif", SUPERSEDED: "Digantikan", ARCHIVED: "Diarsipkan" } as Record<string, string>)[state] ?? "Belum Dinilai"; }
function formatDate(value: string): string { const date = new Date(value); return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }); }
