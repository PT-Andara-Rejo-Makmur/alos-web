"use client";
import { DomainOverview } from "@/features/business-records/overview";
import { PropertyLayout } from "../property-layout";
import { propertyApi } from "../api";
import { propertyResources } from "../resources";

const labels = Object.fromEntries(Object.values(propertyResources).map((resource) => [resource.key, resource.title]));
const unavailable = ["Progres Fisik Perusahaan", "Deviasi Jadwal", "Kesiapan Teknis Unit"];

export function PropertySummaryPage({ workspaceKey }: Readonly<{ workspaceKey?: string }>) {
  return <PropertyLayout workspaceKey={workspaceKey}>{(session) => <DomainOverview session={session} domain="property" key={session.principal && "actor" in session.principal ? session.principal.active_workspace?.workspace.workspace_id : "unknown"} title="Ringkasan Property" labels={labels} unavailable={unavailable} read={propertyApi.overview} />}</PropertyLayout>;
}
