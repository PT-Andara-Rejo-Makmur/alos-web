"use client";
import { DomainOverview } from "@/features/business-records/overview";
import { ItLayout } from "../it-layout";
import { itApi } from "../api";
import { itResources } from "../resources";
const labels = Object.fromEntries(Object.values(itResources).map((resource) => [resource.key, resource.title]));
export function ItSummaryPage({ workspaceKey }: Readonly<{ workspaceKey?: string }>) {
  return <ItLayout workspaceKey={workspaceKey}>{(session) => <DomainOverview session={session} domain="it" key={session.principal && "actor" in session.principal ? session.principal.active_workspace?.workspace.workspace_id : "unknown"} title="Operasional IT" labels={labels} read={itApi.overview} unavailable={["Live Monitoring", "Connector Eksternal", "Skor Keamanan", "Uptime", "MTTR", "Tingkat Keberhasilan Backup", "Aset IT", "Tiket Dukungan"]} />}</ItLayout>;
}
