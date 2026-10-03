"use client";
import { DomainOverview } from "@/features/business-records/overview";
import { LegalLayout } from "../legal-layout";
import { legalApi } from "../api";
import { legalResources } from "../resources";
const labels = Object.fromEntries(Object.values(legalResources).map((resource) => [resource.key, resource.title]));
export function LegalSummaryPage({ workspaceKey }: Readonly<{ workspaceKey?: string }>) {
  return <LegalLayout workspaceKey={workspaceKey}>{(session) => <DomainOverview session={session} domain="legal" key={session.principal && "actor" in session.principal ? session.principal.active_workspace?.workspace.workspace_id : "unknown"} title="Legal" labels={labels} read={legalApi.overview} unavailable={["Skor Kepatuhan Resmi", "Verifikasi Eksternal", "Signing Final", "ARA"]} />}</LegalLayout>;
}
