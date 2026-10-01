"use client";
import { BusinessDataPage } from "@/features/business-records/data-page";
import { financeResources } from "@/features/finance/resources";
import { FinanceLayout } from "../finance-layout";

const resources = [financeResources.budgets, financeResources.budget_lines];

export function FinanceBudgetPage({ workspaceKey }: Readonly<{ workspaceKey?: string }>) {
  return <FinanceLayout workspaceKey={workspaceKey}>{(session) => <BusinessDataPage session={session} resources={resources} title="Anggaran" description="Catatan keuangan internal. Saldo bank, arus kas final, dan pelaporan resmi DJP belum tersedia." />}</FinanceLayout>;
}
