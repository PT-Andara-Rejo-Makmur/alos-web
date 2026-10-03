"use client";
import { BusinessDataPage } from "@/features/business-records/data-page";
import { propertyResources } from "@/features/property/resources";
import { PropertyLayout } from "../property-layout";

const resources = [propertyResources.quality_inspections, propertyResources.quality_ncrs, propertyResources.safety_incidents];

export function PropertyQualityPage({ workspaceKey }: Readonly<{ workspaceKey?: string }>) {
  return <PropertyLayout workspaceKey={workspaceKey}>{(session) => <BusinessDataPage session={session} resources={resources} title="Inspeksi & Kualitas" description="Pantau pekerjaan teknis, dokumen, dan pemeriksaan proyek." />}</PropertyLayout>;
}
