"use client";
import { DomainOverview } from "@/features/business-records/overview";
import { SalesLayout } from "../sales-layout";
import { salesApi } from "../api";
import { salesResources } from "../resources";

const labels = Object.fromEntries(Object.values(salesResources).map((resource) => [resource.key, resource.title]));
const unavailable = ["Conversion", "Biaya per Lead"];

export function SalesSummaryPage({ workspaceKey }: Readonly<{ workspaceKey?: string }>) {
  return <SalesLayout workspaceKey={workspaceKey}>{(session) => <DomainOverview domain="sales" key={session.principal && "actor" in session.principal ? session.principal.active_workspace?.workspace.workspace_id : "unknown"} title="Sales & Marketing" labels={labels} unavailable={unavailable} read={salesApi.overview} />}</SalesLayout>;
}
