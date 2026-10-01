"use client";
import { BusinessDataPage } from "@/features/business-records/data-page";
import { propertyResources } from "@/features/property/resources";
import { PropertyLayout } from "../property-layout";

const resources = [propertyResources.construction_updates, propertyResources.project_milestones];

export function PropertyProgressPage({ workspaceKey }: Readonly<{ workspaceKey?: string }>) {
  return <PropertyLayout workspaceKey={workspaceKey}>{(session) => <BusinessDataPage session={session} resources={resources} title="Progres & Jadwal" description="Data teknis tercatat; change order dan payment certificate tidak menyebabkan pembayaran atau approval material." />}</PropertyLayout>;
}
