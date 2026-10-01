"use client";
import { RecordDetail } from "@/features/business-records/record-detail";
import { HrLayout } from "../hr-layout";
import { hrResources } from "../resources";
const resources = { employee: hrResources.employees, candidate: hrResources.candidates, onboarding: hrResources.onboardings, review: hrResources.performance_reviews };
export function HrDetailPage({ kind, recordId, workspaceKey }: Readonly<{ kind: keyof typeof resources; recordId?: string; workspaceKey?: string }>) {
  return <HrLayout workspaceKey={workspaceKey}>{(session) => <RecordDetail key={`${session.principal && "actor" in session.principal ? session.principal.active_workspace?.workspace.workspace_id : "unknown"}-${kind}-${recordId}`} resource={resources[kind]} recordId={recordId} />}</HrLayout>;
}
