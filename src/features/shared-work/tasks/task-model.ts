import { authenticatedApiRequest, withQuery } from "@/lib/api";
import type { SharedWorkTaskAssignRequest, SharedWorkTaskCreateRequest, SharedWorkTaskProjection, SharedWorkTaskUpdateRequest } from "@/lib/contracts";

import { sourceStateCopy, sourceStateFor } from "../shared/source-state";
import type { SourceHonestResponse, WorkTask } from "./task-types";

export interface FetchTasksOptions {
  readonly priority?: string;
  readonly search?: string;
  readonly signal?: AbortSignal;
  readonly status?: string;
}

export function taskFromProjection(task: SharedWorkTaskProjection): WorkTask {
  return {
    id: task.task_id,
    title: task.title,
    description: task.description ?? null,
    status: task.status,
    priority: task.priority,
    projectId: task.project_id ?? null,
    projectName: task.project_name ?? null,
    projectCode: task.project_code ?? null,
    ownerActorId: task.owner_actor_id ?? null,
    ownerName: task.owner_name ?? null,
    createdBy: task.created_by,
    creatorName: task.creator_name ?? null,
    dueAt: task.due_at ?? null,
    startDate: task.start_date ?? null,
    workspaceIds: task.workspace_ids,
    workspaceName: task.workspace_name ?? null,
    createdAt: task.created_at,
    updatedAt: task.updated_at,
    documentsCount: task.documents_count ?? null,
    findingsCount: task.findings_count ?? null,
    evidenceCount: task.evidence_count ?? null,
    commentsCount: task.comments_count ?? null,
    blockedBy: task.blocked_by?.map((dependency) => dependency.blocked_by_task_id) ?? [],
    blockedByTitles: task.blocked_by?.map((dependency) => dependency.title) ?? [],
  };
}

export async function fetchTasks(
  options: FetchTasksOptions = {},
): Promise<SourceHonestResponse<readonly WorkTask[]>> {
  const query: Record<string, string | undefined> = {};
  if (options.search) query.search = options.search;
  if (options.status && options.status !== "ALL") query.status = options.status;
  if (options.priority && options.priority !== "ALL") query.priority = options.priority;

  const path = withQuery("/api/v1/tasks", query);

  try {
    const data = await authenticatedApiRequest<readonly SharedWorkTaskProjection[]>(path, {
      signal: options.signal,
    });
    return {
      connected: true,
      data: Array.isArray(data) ? data.map(taskFromProjection) : [],
    };
  } catch (error) {
    // Source honesty: If the Backend has not yet exposed the public tasks endpoint,
    // report unconnected state with user-facing message and empty data without crashing.
    const sourceState = sourceStateFor(error);
    return {
      connected: false,
      data: [],
      sourceState,
      message: sourceStateCopy(sourceState, "Tugas").message,
    };
  }
}

export async function fetchTaskDetail(
  taskId: string,
  signal?: AbortSignal,
): Promise<SourceHonestResponse<WorkTask | null>> {
  if (!taskId) {
    return { connected: false, data: null, sourceState: "validation", message: "ID Tugas tidak valid." };
  }

  try {
    const data = await authenticatedApiRequest<SharedWorkTaskProjection>(`/api/v1/tasks/${encodeURIComponent(taskId)}`, {
      signal,
    });
    return {
      connected: true,
      data: taskFromProjection(data),
    };
  } catch (error) {
    const sourceState = sourceStateFor(error, "detail");
    return {
      connected: false,
      data: null,
      sourceState,
      message: sourceStateCopy(sourceState, "Tugas").message,
    };
  }
}

export async function createTask(request: SharedWorkTaskCreateRequest): Promise<WorkTask> {
  const data = await authenticatedApiRequest<SharedWorkTaskProjection>("/api/v1/tasks", {
    method: "POST",
    body: request,
  });
  return taskFromProjection(data);
}

export async function updateTask(taskId: string, request: SharedWorkTaskUpdateRequest): Promise<WorkTask> {
  const data = await authenticatedApiRequest<SharedWorkTaskProjection>(`/api/v1/tasks/${encodeURIComponent(taskId)}`, {
    method: "PATCH",
    body: request,
  });
  return taskFromProjection(data);
}

export async function assignTask(taskId: string, request: SharedWorkTaskAssignRequest): Promise<WorkTask> {
  const data = await authenticatedApiRequest<SharedWorkTaskProjection>(`/api/v1/tasks/${encodeURIComponent(taskId)}/assign`, {
    method: "POST",
    body: request,
  });
  return taskFromProjection(data);
}

export async function completeTask(taskId: string): Promise<WorkTask> {
  const data = await authenticatedApiRequest<SharedWorkTaskProjection>(`/api/v1/tasks/${encodeURIComponent(taskId)}/complete`, {
    method: "POST",
  });
  return taskFromProjection(data);
}

export async function addTaskDependency(taskId: string, blockedByTaskId: string): Promise<WorkTask> {
  const data = await authenticatedApiRequest<SharedWorkTaskProjection>(`/api/v1/tasks/${encodeURIComponent(taskId)}/dependencies`, {
    method: "POST",
    body: { blocked_by_task_id: blockedByTaskId },
  });
  return taskFromProjection(data);
}

export async function removeTaskDependency(taskId: string, blockedByTaskId: string): Promise<WorkTask> {
  const data = await authenticatedApiRequest<SharedWorkTaskProjection>(`/api/v1/tasks/${encodeURIComponent(taskId)}/dependencies/${encodeURIComponent(blockedByTaskId)}`, {
    method: "DELETE",
  });
  return taskFromProjection(data);
}
