"use client";
import { StrategyPerformance } from "@/features/business-records/strategy-performance";
import { SalesLayout } from "../sales-layout";

export function SalesPerformancePage({ workspaceKey }: Readonly<{ workspaceKey?: string }>) {
  return <SalesLayout workspaceKey={workspaceKey}>{(session) => <StrategyPerformance key={session.principal && "actor" in session.principal ? session.principal.active_workspace?.workspace.workspace_id : "unknown"} domain="Sales & Marketing" />}</SalesLayout>;
}
