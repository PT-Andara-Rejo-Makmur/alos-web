/**
 * Universal Shared Work Types for ALOS Enterprise Control System.
 * Canonical Backend authority remains in alos-backend / alos-contracts.
 */

import type {
  SharedWorkApprovalStatus,
  SharedWorkDataClassification,
  SharedWorkDocumentStatus,
  SharedWorkFindingSeverity,
  SharedWorkFindingStatus,
  SharedWorkProjectStatus,
  SharedWorkTaskPriority,
  SharedWorkTaskStatus,
} from "@/lib/contracts";

export type CanonicalProjectStatus = SharedWorkProjectStatus;

/** Task status values from the generated Shared Work contract. */
export type TaskStatusPresentationValue = SharedWorkTaskStatus;

/** Task priority values from the generated Shared Work contract. */
export type TaskPriorityPresentationValue = SharedWorkTaskPriority;

/** Compatibility alias for existing presentation components. */
export type CanonicalTaskStatus = TaskStatusPresentationValue;
/** Compatibility alias for existing presentation components. */
export type CanonicalTaskPriority = TaskPriorityPresentationValue;

export type CanonicalApprovalStatus = SharedWorkApprovalStatus;

export type CanonicalDocumentStatus = SharedWorkDocumentStatus;

export type CanonicalDataClassification = SharedWorkDataClassification;

export type CanonicalFindingSeverity = SharedWorkFindingSeverity;

export type CanonicalFindingStatus = SharedWorkFindingStatus;

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
  readonly sourceState?: import("./source-state").SourceState;
  readonly message?: string;
  readonly errorCode?: number;
}
