"use client";
import { BusinessDataPage } from "@/features/business-records/data-page";
import { propertyResources } from "@/features/property/resources";
import { PropertyLayout } from "../property-layout";

const resources = [propertyResources.construction_packages, propertyResources.construction_updates, propertyResources.change_orders, propertyResources.payment_certificates];

export function PropertyExecutionPage({ workspaceKey }: Readonly<{ workspaceKey?: string }>) {
  return <PropertyLayout workspaceKey={workspaceKey}>{(session) => <BusinessDataPage session={session} resources={resources} title="Pekerjaan & Milestone" description="Data teknis tercatat; change order dan payment certificate tidak menyebabkan pembayaran atau approval material." />}</PropertyLayout>;
}
