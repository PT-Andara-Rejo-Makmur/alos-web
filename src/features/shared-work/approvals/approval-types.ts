import type { SourceHonestResponse } from "../shared/types";
import type { SharedWorkApprovalDecision, SharedWorkApprovalStatus, SharedWorkApprovalSubjectType } from "@/lib/contracts";

/** Approval status values from the generated Shared Work contract. */
export type ApprovalStatusPresentationValue = SharedWorkApprovalStatus;

export type ApprovalSubjectType = SharedWorkApprovalSubjectType;

export interface WorkApproval {
  readonly id: string;
  readonly subjectType: ApprovalSubjectType;
  readonly subjectId: string;
  readonly subjectTitle: string | null;
  readonly requestedBy: string;
  readonly requesterName: string | null;
  readonly approverActorId: string | null;
  readonly approverName: string | null;
  readonly status: ApprovalStatusPresentationValue;
  readonly decision: SharedWorkApprovalDecision | null;
  readonly reason: string | null;
  readonly decisionReason: string | null;
  readonly requestedAt: string;
  readonly decidedAt: string | null;
  readonly workspaceIds: readonly string[];
  readonly workspaceName: string | null;
  readonly materialityValue?: string | null;
  readonly documentsCount: number | null;
  readonly evidenceCount: number | null;
  readonly commentsCount: number | null;
}

export interface ApprovalFilterState {
  readonly activeTab: string;
  readonly search: string;
  readonly status: string;
  readonly subjectType: string;
  readonly workspaceKey?: string;
}

export type { SourceHonestResponse };
