import type {
  SourceHonestResponse,
  TaskPriorityPresentationValue,
  TaskStatusPresentationValue,
} from "../shared/types";

export interface WorkTask {
  readonly id: string;
  readonly title: string;
  readonly description: string | null;
  readonly status: TaskStatusPresentationValue | string;
  readonly priority: TaskPriorityPresentationValue | string;
  readonly projectId: string | null;
  readonly projectName: string | null;
  readonly projectCode: string | null;
  readonly ownerActorId: string | null;
  readonly ownerName: string | null;
  readonly createdBy: string;
  readonly creatorName: string | null;
  readonly dueAt: string | null;
  readonly startDate: string | null;
  readonly workspaceIds: readonly string[];
  readonly workspaceName: string | null;
  readonly blockedBy?: readonly string[];
  readonly blockedByTitles?: readonly string[];
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly documentsCount: number | null;
  readonly findingsCount: number | null;
  readonly evidenceCount: number | null;
  readonly commentsCount: number | null;
}

export interface TaskFilterState {
  readonly activeTab: string;
  readonly priority: string;
  readonly search: string;
  readonly status: string;
  readonly workspaceKey?: string;
}

export type {
  SourceHonestResponse,
  TaskPriorityPresentationValue,
  TaskStatusPresentationValue,
};
