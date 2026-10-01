"use client";
import { StrategyPerformance } from "@/features/business-records/strategy-performance";
import { ItLayout } from "../it-layout";
export function ItPerformancePage({ workspaceKey }: Readonly<{ workspaceKey?: string }>) {
  return <ItLayout workspaceKey={workspaceKey}>{(session) => <StrategyPerformance key={session.principal && "actor" in session.principal ? session.principal.active_workspace?.workspace.workspace_id : "unknown"} domain="IT" />}</ItLayout>;
}
