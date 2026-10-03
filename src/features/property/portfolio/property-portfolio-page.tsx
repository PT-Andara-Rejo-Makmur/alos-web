"use client";
import { BusinessDataPage } from "@/features/business-records/data-page";
import { ProjectReferences } from "@/features/business-records/project-references";
import { propertyResources } from "@/features/property/resources";
import { PropertyLayout } from "../property-layout";

const resources = [propertyResources.project_milestones, propertyResources.project_handovers, propertyResources.land_pipeline];

export function PropertyPortfolioPage({ workspaceKey }: Readonly<{ workspaceKey?: string }>) {
  return <PropertyLayout workspaceKey={workspaceKey}>{(session) => <BusinessDataPage session={session} resources={resources} title="Portofolio Proyek" description="Pantau pekerjaan teknis, dokumen, dan pemeriksaan proyek."><ProjectReferences key={session.principal && "actor" in session.principal ? session.principal.active_workspace?.workspace.workspace_id : "unknown"} workspaceKey={session.principal && "actor" in session.principal ? session.principal.active_workspace?.workspace.workspace_key ?? "" : ""} /></BusinessDataPage>}</PropertyLayout>;
}
