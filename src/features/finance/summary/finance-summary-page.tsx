"use client";
import { DomainOverview } from "@/features/business-records/overview";
import { FinanceLayout } from "../finance-layout";
import { financeApi } from "../api";
import { financeResources } from "../resources";

const labels = Object.fromEntries(Object.values(financeResources).map((resource) => [resource.key, resource.title]));
const unavailable = ["Kas Tersedia", "Arus Kas Final", "Anggaran vs Realisasi", "Kepatuhan Pajak Resmi"];

export function FinanceSummaryPage({ workspaceKey }: Readonly<{ workspaceKey?: string }>) {
  return <FinanceLayout workspaceKey={workspaceKey}>{(session) => <DomainOverview session={session} domain="finance" key={session.principal && "actor" in session.principal ? session.principal.active_workspace?.workspace.workspace_id : "unknown"} title="Finance & Pajak" labels={labels} unavailable={unavailable} read={financeApi.overview} />}</FinanceLayout>;
}
