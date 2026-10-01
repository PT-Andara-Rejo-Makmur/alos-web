"use client";
import { BusinessDataPage } from "@/features/business-records/data-page";
import { financeResources } from "@/features/finance/resources";
import { FinanceLayout } from "../finance-layout";

const resources = [financeResources.reconciliations, financeResources.reconciliation_items, financeResources.month_closes, financeResources.month_close_items];

export function FinanceReconciliationPage({ workspaceKey }: Readonly<{ workspaceKey?: string }>) {
  return <FinanceLayout workspaceKey={workspaceKey}>{(session) => <BusinessDataPage session={session} resources={resources} title="Rekonsiliasi & Penutupan Bulan" description="Catatan keuangan internal. Saldo bank, arus kas final, dan pelaporan resmi DJP belum tersedia." />}</FinanceLayout>;
}
