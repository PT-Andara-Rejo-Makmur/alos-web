"use client";
import { StrategyPerformance } from "@/features/business-records/strategy-performance";
import { PropertyLayout } from "../property-layout";

export function PropertyPerformancePage({ workspaceKey }: Readonly<{ workspaceKey?: string }>) {
  return <PropertyLayout workspaceKey={workspaceKey}>{(session) => <StrategyPerformance key={session.principal && "actor" in session.principal ? session.principal.active_workspace?.workspace.workspace_id : "unknown"} domain="Property & Teknik" />}</PropertyLayout>;
}
