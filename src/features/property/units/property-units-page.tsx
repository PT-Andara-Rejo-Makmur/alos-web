"use client";
import { BusinessDataPage } from "@/features/business-records/data-page";
import { propertyResources } from "@/features/property/resources";
import { PropertyLayout } from "../property-layout";

const resources = [propertyResources.property_units, propertyResources.project_handovers];

export function PropertyUnitsPage({ workspaceKey }: Readonly<{ workspaceKey?: string }>) {
  return <PropertyLayout workspaceKey={workspaceKey}>{(session) => <BusinessDataPage session={session} resources={resources} title="Unit & Kesiapan" description="Pantau pekerjaan teknis, dokumen, dan pemeriksaan proyek." />}</PropertyLayout>;
}
