import { authenticatedApiRequest, withQuery } from "@/lib/api";
import type { SharedWorkApprovalDecisionRequest, SharedWorkApprovalProjection, SharedWorkApprovalRequest } from "@/lib/contracts";

import { sourceStateCopy, sourceStateFor } from "../shared/source-state";
import type { SourceHonestResponse, WorkApproval } from "./approval-types";

export interface FetchApprovalsOptions {
  readonly search?: string;
  readonly signal?: AbortSignal;
  readonly status?: string;
  readonly subjectType?: string;
}

export function approvalFromProjection(approval: SharedWorkApprovalProjection): WorkApproval {
  return {
    id: approval.approval_id,
    subjectType: approval.subject_type,
    subjectId: approval.subject_id,
    subjectTitle: approval.subject_title ?? null,
    requestedBy: approval.requested_by,
    requesterName: approval.requester_name ?? null,
    approverActorId: approval.approver_actor_id ?? null,
    approverName: approval.approver_name ?? null,
    status: approval.status,
    decision: approval.decision ?? null,
    reason: approval.reason ?? null,
    decisionReason: approval.decision_reason ?? null,
    requestedAt: approval.requested_at,
    decidedAt: approval.decided_at ?? null,
    workspaceIds: approval.workspace_ids,
    workspaceName: approval.workspace_name ?? null,
    materialityValue: approval.materiality_value == null ? null : new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 }).format(approval.materiality_value),
    documentsCount: approval.documents_count ?? null,
    evidenceCount: approval.evidence_count ?? null,
    commentsCount: approval.comments_count ?? null,
  };
}

export async function fetchApprovals(
  options: FetchApprovalsOptions = {},
): Promise<SourceHonestResponse<readonly WorkApproval[]>> {
  const query: Record<string, string | undefined> = {};
  if (options.search) query.search = options.search;
  if (options.status && options.status !== "ALL") query.status = options.status;
  if (options.subjectType && options.subjectType !== "ALL") query.subject_type = options.subjectType;

  const path = withQuery("/api/v1/approvals", query);

  try {
    const data = await authenticatedApiRequest<readonly SharedWorkApprovalProjection[]>(path, {
      signal: options.signal,
    });
    return {
      connected: true,
      data: Array.isArray(data) ? data.map(approvalFromProjection) : [],
    };
  } catch (error) {
    const sourceState = sourceStateFor(error);
    return {
      connected: false,
      data: [],
      sourceState,
      message: sourceStateCopy(sourceState, "Persetujuan").message,
    };
  }
}

export async function fetchApprovalDetail(
  approvalId: string,
  signal?: AbortSignal,
): Promise<SourceHonestResponse<WorkApproval | null>> {
  if (!approvalId) {
    return { connected: false, data: null, sourceState: "validation", message: "ID Persetujuan tidak valid." };
  }

  try {
    const data = await authenticatedApiRequest<SharedWorkApprovalProjection>(`/api/v1/approvals/${encodeURIComponent(approvalId)}`, {
      signal,
    });
    return {
      connected: true,
      data: approvalFromProjection(data),
    };
  } catch (error) {
    const sourceState = sourceStateFor(error, "detail");
    return {
      connected: false,
      data: null,
      sourceState,
      message: sourceStateCopy(sourceState, "Persetujuan").message,
    };
  }
}

export async function createApproval(request: SharedWorkApprovalRequest): Promise<WorkApproval> {
  const data = await authenticatedApiRequest<SharedWorkApprovalProjection>("/api/v1/approvals", {
    method: "POST",
    body: request,
  });
  return approvalFromProjection(data);
}

export type ApprovalAction = "approve" | "return" | "reject" | "hold";

export async function decideApproval(
  approvalId: string, action: ApprovalAction, request: SharedWorkApprovalDecisionRequest,
): Promise<WorkApproval> {
  const data = await authenticatedApiRequest<SharedWorkApprovalProjection>(
    `/api/v1/approvals/${encodeURIComponent(approvalId)}/${action}`,
    { method: "POST", body: request },
  );
  return approvalFromProjection(data);
}
