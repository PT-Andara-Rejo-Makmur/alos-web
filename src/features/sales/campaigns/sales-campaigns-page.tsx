"use client";
import { BusinessDataPage } from "@/features/business-records/data-page";
import { marketingResources } from "@/features/marketing/resources";
import { SalesLayout } from "../sales-layout";

const resources = [marketingResources.campaigns, marketingResources.channels, marketingResources.attributions, marketingResources.contents];

export function SalesCampaignsPage({ workspaceKey }: Readonly<{ workspaceKey?: string }>) {
  return <SalesLayout workspaceKey={workspaceKey}>{(session) => <BusinessDataPage session={session} resources={resources} title="Kampanye & Saluran" description="Rekaman internal authoritative; booking dan closing final menunggu authority lintas domain." />}</SalesLayout>;
}
