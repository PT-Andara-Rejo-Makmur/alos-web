"use client";
import { BusinessDataPage } from "@/features/business-records/data-page";
import { salesResources } from "@/features/sales/resources";
import { SalesLayout } from "../sales-layout";

const resources = [salesResources.opportunities, salesResources.pricings, salesResources.pricing_items];

export function SalesPipelinePage({ workspaceKey }: Readonly<{ workspaceKey?: string }>) {
  return <SalesLayout workspaceKey={workspaceKey}>{(session) => <BusinessDataPage session={session} resources={resources} title="Pipeline Penjualan" description="Rekaman internal authoritative; booking dan closing final menunggu authority lintas domain." />}</SalesLayout>;
}
