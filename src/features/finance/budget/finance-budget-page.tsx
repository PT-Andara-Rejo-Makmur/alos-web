"use client";
import { BusinessDataPage } from "@/features/business-records/data-page";
import { financeResources } from "@/features/finance/resources";
import { FinanceLayout } from "../finance-layout";

const resources = [financeResources.budgets, financeResources.budget_lines];

export function FinanceBudgetPage({ workspaceKey }: Readonly<{ workspaceKey?: string }>) {
  return <FinanceLayout workspaceKey={workspaceKey}>{(session) => <BusinessDataPage session={session} resources={resources} title="Anggaran" description="Draft dan telaah internal anggaran tersedia. Persetujuan, aktivasi, dan penutupan anggaran memerlukan persetujuan independen sesuai tindakan serta eksekusi eksplisit oleh owner; rekaman ini tidak memindahkan dana." />}</FinanceLayout>;
}
