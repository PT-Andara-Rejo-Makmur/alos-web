"use client";
import { BusinessDataPage } from "@/features/business-records/data-page";
import { financeResources } from "@/features/finance/resources";
import { FinanceLayout } from "../finance-layout";

const resources = [financeResources.reconciliations, financeResources.reconciliation_items, financeResources.month_closes, financeResources.month_close_items];

export function FinanceReconciliationPage({ workspaceKey }: Readonly<{ workspaceKey?: string }>) {
  return <FinanceLayout workspaceKey={workspaceKey}>{(session) => <BusinessDataPage session={session} resources={resources} title="Rekonsiliasi & Penutupan Bulan" description="Rekonsiliasi dan checklist internal tersedia. Penutupan bulan final belum tersedia karena authority keputusan canonical belum tersedia. Periode historis CLOSED tetap terkunci." />}</FinanceLayout>;
}
