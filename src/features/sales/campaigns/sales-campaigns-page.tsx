"use client";
import { BusinessDataPage } from "@/features/business-records/data-page";
import { marketingResources } from "@/features/marketing/resources";
import { SalesLayout } from "../sales-layout";

const resources = [marketingResources.campaigns, marketingResources.channels, marketingResources.attributions, marketingResources.contents];

export function SalesCampaignsPage({ workspaceKey }: Readonly<{ workspaceKey?: string }>) {
  return <SalesLayout workspaceKey={workspaceKey}>{(session) => <BusinessDataPage session={session} resources={resources} title="Kampanye & Saluran" description="Kampanye dan pricing draft dapat disiapkan. Aktivasi pricing belum tersedia karena authority keputusan canonical belum tersedia." />}</SalesLayout>;
}
