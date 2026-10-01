"use client";
import { RecordDetail } from "@/features/business-records/record-detail";
import { LegalLayout } from "../legal-layout";
import { legalResources } from "../resources";
const resources = { contract: legalResources.contracts, permit: legalResources.permits, case: legalResources.cases, asset: legalResources.land_documents };
export function LegalDetailPage({ kind, recordId, workspaceKey }: Readonly<{ kind: keyof typeof resources; recordId?: string; workspaceKey?: string }>) {
  return <LegalLayout workspaceKey={workspaceKey}>{(session) => <RecordDetail key={`${session.principal && "actor" in session.principal ? session.principal.active_workspace?.workspace.workspace_id : "unknown"}-${kind}-${recordId}`} resource={resources[kind]} recordId={recordId} />}</LegalLayout>;
}
