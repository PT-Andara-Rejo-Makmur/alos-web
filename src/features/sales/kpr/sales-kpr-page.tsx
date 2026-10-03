"use client";

import { BusinessDataPage } from "@/features/business-records/data-page";
import { SalesLayout } from "../sales-layout";
import { financingResource } from "./financing-resource";

export function SalesKprPage({ workspaceKey }: Readonly<{ workspaceKey?: string }>) {
  return <SalesLayout workspaceKey={workspaceKey}>{session => <BusinessDataPage session={session}
    resources={[financingResource]} title="KPR & Akad"
    description="Catat cara pembayaran, kelengkapan dokumen, rujukan bank, SP3K, dan pelaksanaan akad pada Booking. Status ini berdasarkan bukti yang dicatat Sales; pembayaran tetap dicatat oleh Finance dan kontrak diperiksa oleh Legal." />}</SalesLayout>;
}
