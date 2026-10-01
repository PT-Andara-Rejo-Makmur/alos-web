"use client";
import { StrategyPerformance } from "@/features/business-records/strategy-performance";
import { FinanceLayout } from "../finance-layout";

export function FinancePerformancePage({ workspaceKey }: Readonly<{ workspaceKey?: string }>) {
  return <FinanceLayout workspaceKey={workspaceKey}>{(session) => <StrategyPerformance key={session.principal && "actor" in session.principal ? session.principal.active_workspace?.workspace.workspace_id : "unknown"} domain="Finance & Pajak" />}</FinanceLayout>;
}
