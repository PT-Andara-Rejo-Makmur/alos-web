"use client";
import { BusinessDataPage } from "@/features/business-records/data-page";
import { salesResources } from "@/features/sales/resources";
import { SalesLayout } from "../sales-layout";

const resources = [salesResources.site_visits, salesResources.customer_followups, salesResources.customer_complaints];

export function SalesActivitiesPage({ workspaceKey }: Readonly<{ workspaceKey?: string }>) {
  return <SalesLayout workspaceKey={workspaceKey}>{(session) => <BusinessDataPage session={session} resources={resources} title="Aktivitas & Tindak Lanjut" description="Rekaman internal authoritative. Konfirmasi booking dan penyelesaian closing memerlukan persetujuan independen dan eksekusi eksplisit; rekaman ini tidak membuktikan settlement, tanda tangan, atau eksekusi Legal." />}</SalesLayout>;
}
