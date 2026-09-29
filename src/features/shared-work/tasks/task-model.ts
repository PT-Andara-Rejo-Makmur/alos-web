import { authenticatedApiRequest, withQuery } from "@/lib/api";

import { sourceStateCopy, sourceStateFor } from "../shared/source-state";
import type { SourceHonestResponse, WorkTask } from "./task-types";

export interface FetchTasksOptions {
  readonly priority?: string;
  readonly search?: string;
  readonly signal?: AbortSignal;
  readonly status?: string;
  readonly workspaceKey?: string;
}

export async function fetchTasks(
  options: FetchTasksOptions = {},
): Promise<SourceHonestResponse<readonly WorkTask[]>> {
  const query: Record<string, string | undefined> = {};
  if (options.search) query.search = options.search;
  if (options.status && options.status !== "ALL") query.status = options.status;
  if (options.priority && options.priority !== "ALL") query.priority = options.priority;
  if (options.workspaceKey && options.workspaceKey !== "ALL") query.workspace_key = options.workspaceKey;

  const path = withQuery("/api/v1/tasks", query);

  try {
    const data = await authenticatedApiRequest<readonly WorkTask[]>(path, {
      signal: options.signal,
    });
    return {
      connected: true,
      data: Array.isArray(data) ? data : [],
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
    const data = await authenticatedApiRequest<WorkTask>(`/api/v1/tasks/${taskId}`, {
      signal,
    });
    return {
      connected: true,
      data,
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
