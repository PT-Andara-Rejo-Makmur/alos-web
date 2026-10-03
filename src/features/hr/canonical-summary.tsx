"use client";
import { DomainOverview } from "@/features/business-records/overview";
import { HrLayout } from "./hr-layout";
import { hrApi } from "./api";
import { hrResources } from "./resources";
const labels = Object.fromEntries(Object.values(hrResources).map((resource) => [resource.key, resource.title]));
export function HrCanonicalSummary({ workspaceKey }: Readonly<{ workspaceKey?: string }>) {
  return <HrLayout workspaceKey={workspaceKey}>{(session) => <DomainOverview domain="hr" key={session.principal && "actor" in session.principal ? session.principal.active_workspace?.workspace.workspace_id : "unknown"} title="HR & GA" labels={labels} read={hrApi.overview} unavailable={["Kompensasi & Benefit", "Turnover", "Rata-rata Kinerja", "Tingkat Kehadiran"]} />}</HrLayout>;
}
