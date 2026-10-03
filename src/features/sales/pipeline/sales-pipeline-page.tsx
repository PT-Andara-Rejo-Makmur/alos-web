"use client";
import { BusinessDataPage } from "@/features/business-records/data-page";
import { salesResources } from "@/features/sales/resources";
import { SalesLayout } from "../sales-layout";
import { OpportunityBoard } from "./opportunity-board";

const resources = [salesResources.opportunities, salesResources.pricings, salesResources.pricing_items];

export function SalesPipelinePage({ workspaceKey }: Readonly<{ workspaceKey?: string }>) {
  return <SalesLayout workspaceKey={workspaceKey}>{(session) => <BusinessDataPage session={session} resources={resources} title="Pipeline Penjualan" description="Kelola penjualan dan tindak lanjut pelanggan." renderSummary={(resource, rows) => resource.key === "opportunities" ? <OpportunityBoard rows={rows} /> : null} />}</SalesLayout>;
}
