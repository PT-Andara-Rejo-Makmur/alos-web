import type { SourceHonestResponse } from "../shared/types";

export type FindingSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type FindingStatus =
  | "OPEN"
  | "IN_REVIEW"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "PENDING_VERIFICATION"
  | "VERIFIED"
  | "CLOSED"
  | "CANCELLED"
  | "DUPLICATE";

export interface WorkFinding {
  readonly id: string;
  readonly title: string;
  readonly description?: string | null;
  readonly severity: FindingSeverity | string;
  readonly status: FindingStatus | string;
  readonly sourceType: string;
  readonly category?: string | null;
  readonly identifiedAt: string;
  readonly dueDate?: string | null;
  readonly workspaceIds: readonly string[];
  readonly workspaceName: string | null;
  readonly projectId?: string | null;
  readonly projectName?: string | null;
  readonly ownerActorId?: string | null;
  readonly ownerName?: string | null;
  readonly verifierActorId?: string | null;
  readonly verifierName?: string | null;
  readonly impact?: string | null;
  readonly rootCause?: string | null;
  readonly correctiveActionTaskId?: string | null;
  readonly correctiveActionTaskTitle?: string | null;
  readonly evidenceCount?: number | null;
  readonly tasksCount?: number | null;
  readonly createdAt: string;
}

export interface FindingFilterState {
  readonly activeTab: string;
  readonly projectFilter?: string;
  readonly search: string;
  readonly severityFilter: string;
  readonly sourceFilter: string;
  readonly statusFilter: string;
  readonly workspaceKey?: string;
}

export type { SourceHonestResponse };
