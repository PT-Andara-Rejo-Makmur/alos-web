import { authenticatedApiRequest, withQuery } from "@/lib/api";
import type { SharedWorkTaskCreateRequest, SharedWorkTaskProjection } from "@/lib/contracts";

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
    projectName: null,
    projectCode: null,
    ownerActorId: task.owner_actor_id ?? null,
    ownerName: null,
    createdBy: task.created_by,
    creatorName: null,
    dueAt: task.due_at ?? null,
    startDate: null,
    workspaceIds: task.workspace_ids,
    workspaceName: null,
    createdAt: task.created_at,
    updatedAt: task.updated_at,
    documentsCount: null,
    findingsCount: null,
    evidenceCount: null,
    commentsCount: null,
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
