"use client";
import { StrategyPerformance } from "@/features/business-records/strategy-performance";
import { LegalLayout } from "../legal-layout";
export function LegalPerformancePage({ workspaceKey }: Readonly<{ workspaceKey?: string }>) {
  return <LegalLayout workspaceKey={workspaceKey}>{(session) => <StrategyPerformance key={session.principal && "actor" in session.principal ? session.principal.active_workspace?.workspace.workspace_id : "unknown"} domain="LEGAL" />}</LegalLayout>;
}
