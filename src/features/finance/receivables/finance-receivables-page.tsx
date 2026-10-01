"use client";
import { BusinessDataPage } from "@/features/business-records/data-page";
import { financeResources } from "@/features/finance/resources";
import { FinanceLayout } from "../finance-layout";

const resources = [financeResources.receivables, financeResources.receivable_payments];

export function FinanceReceivablesPage({ workspaceKey }: Readonly<{ workspaceKey?: string }>) {
  return <FinanceLayout workspaceKey={workspaceKey}>{(session) => <BusinessDataPage session={session} resources={resources} title="Piutang & Penerimaan" description="Catatan keuangan internal. Saldo bank, arus kas final, dan pelaporan resmi DJP belum tersedia." />}</FinanceLayout>;
}
