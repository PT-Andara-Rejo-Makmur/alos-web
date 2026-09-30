import type { SourceHonestResponse } from "../shared/types";
import type { SharedWorkApprovalStatus } from "@/lib/contracts";

/** Approval status values from the generated Shared Work contract. */
export type ApprovalStatusPresentationValue = SharedWorkApprovalStatus;

export type ApprovalSubjectType =
  | "PROJECT"
  | "TASK"
  | "DOCUMENT"
  | "REPORT"
  | "FINDING"
  | "BUDGET"
  | "CONTRACT"
  | "PAYMENT";

export type ApprovalStage = "REVIEW" | "APPROVAL" | "COMPLETED";

export interface WorkApproval {
  readonly id: string;
  readonly subjectType: ApprovalSubjectType | string;
  readonly subjectId: string;
  readonly subjectTitle: string | null;
  readonly requestedBy: string;
  readonly requesterName: string | null;
  readonly approverActorId: string | null;
  readonly approverName: string | null;
  readonly status: ApprovalStatusPresentationValue | string;
  readonly decision: string | null;
  readonly reason: string | null;
  readonly requestedAt: string;
  readonly decidedAt: string | null;
  readonly workspaceIds: readonly string[];
  readonly workspaceName: string | null;
  readonly stage?: ApprovalStage | string | null;
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
