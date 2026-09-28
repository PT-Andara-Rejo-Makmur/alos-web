/**
 * Universal Shared Work Types for ALOS Enterprise Control System.
 * Canonical Backend authority remains in alos-backend / alos-contracts.
 */

export type CanonicalProjectStatus =
  | "PLANNED"
  | "ACTIVE"
  | "ON_HOLD"
  | "COMPLETED"
  | "CANCELLED"
  | "ARCHIVED";

/**
 * Presentation values for Task Status.
 * NOTE: In alos-backend migration 0013_shared_work, column `status` has server_default="OPEN"
 * without an enum constraint. All other values are PROVISIONAL presentation states (NEEDS DECISION from Backend/Contracts).
 */
export type TaskStatusPresentationValue =
  | "OPEN"
  | "IN_PROGRESS"
  | "BLOCKED"
  | "UNDER_REVIEW"
  | "COMPLETED"
  | "CANCELLED";

/**
 * Presentation values for Task Priority.
 * NOTE: In alos-backend migration 0013_shared_work, column `priority` has server_default="NORMAL"
 * without an enum constraint. All other values are PROVISIONAL presentation states (NEEDS DECISION from Backend/Contracts).
 */
export type TaskPriorityPresentationValue = "LOW" | "NORMAL" | "HIGH" | "CRITICAL";

/** @deprecated Use TaskStatusPresentationValue instead of inventing canonical contract */
export type CanonicalTaskStatus = TaskStatusPresentationValue;
/** @deprecated Use TaskPriorityPresentationValue instead of inventing canonical contract */
export type CanonicalTaskPriority = TaskPriorityPresentationValue;

export type CanonicalApprovalStatus =
  | "PENDING"
  | "APPROVED"
  | "RETURNED"
  | "REJECTED"
  | "HELD";

export type CanonicalDocumentStatus =
  | "DRAFT"
  | "IN_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "RETIRED";

export type CanonicalDataClassification =
  | "PUBLIC"
  | "INTERNAL"
  | "CONFIDENTIAL"
  | "RESTRICTED";

export type CanonicalFindingSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type CanonicalFindingStatus =
  | "OPEN"
  | "IN_PROGRESS"
  | "VERIFICATION_PENDING"
  | "RESOLVED"
  | "CLOSED";

/** Universal Project projection from Backend */
export interface WorkProject {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly description: string | null;
  readonly status: CanonicalProjectStatus | string;
  readonly ownerActorId: string | null;
  readonly ownerName: string | null;
  readonly workspaceIds: readonly string[];
  readonly workspaceName: string | null;
  readonly startDate: string | null;
  readonly targetEndDate: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly progressPercentage: number | null;
  readonly riskLevel: "RENDAH" | "SEDANG" | "TINGGI" | "KRITIS" | null;
  readonly tasksCount: number | null;
  readonly documentsCount: number | null;
  readonly approvalsCount: number | null;
  readonly findingsCount: number | null;
  readonly reportsCount: number | null;
  readonly evidenceCount: number | null;
}

/** Related items counts for quick view & detail pages */
export interface RelationshipCounts {
  readonly tasksCount: number | null;
  readonly documentsCount: number | null;
  readonly approvalsCount: number | null;
  readonly findingsCount: number | null;
  readonly reportsCount: number | null;
  readonly evidenceCount: number | null;
}

/** Timeline activity record */
export interface ActivityItem {
  readonly id: string;
  readonly occurredAt: string;
  readonly actorName: string;
  readonly actionText: string;
  readonly detailText?: string | null;
  readonly correlationId?: string | null;
}

/** Supporting evidence record */
export interface EvidenceItem {
  readonly id: string;
  readonly title: string;
  readonly source: string;
  readonly verificationStatus: "VERIFIED" | "PENDING" | "UNVERIFIED";
  readonly occurredAt: string;
  readonly version?: string | null;
  readonly contentHash?: string | null;
}

/** API connection response wrapper enforcing source honesty */
export interface SourceHonestResponse<T> {
  readonly connected: boolean;
  readonly data: T;
  /** Distinguishes an absent integration from a temporary/request failure. */
  readonly sourceState?: "available" | "unavailable" | "error";
  readonly message?: string;
  readonly errorCode?: number;
}
