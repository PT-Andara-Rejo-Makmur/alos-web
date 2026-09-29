import { authenticatedApiRequest, withQuery } from "@/lib/api";

import { sourceStateCopy, sourceStateFor } from "../shared/source-state";
import type { SourceHonestResponse, WorkProject } from "./project-types";

export interface FetchProjectsOptions {
  readonly search?: string;
  readonly signal?: AbortSignal;
  readonly status?: string;
  readonly workspaceKey?: string;
}

export async function fetchProjects(
  options: FetchProjectsOptions = {},
): Promise<SourceHonestResponse<readonly WorkProject[]>> {
  const query: Record<string, string | undefined> = {};
  if (options.search) query.search = options.search;
  if (options.status && options.status !== "ALL") query.status = options.status;
  if (options.workspaceKey && options.workspaceKey !== "ALL") query.workspace_key = options.workspaceKey;

  const path = withQuery("/api/v1/projects", query);

  try {
    const data = await authenticatedApiRequest<readonly WorkProject[]>(path, {
      signal: options.signal,
    });
    return {
      connected: true,
      data: Array.isArray(data) ? data : [],
    };
  } catch (error) {
    // Source honesty: If the Backend has not yet exposed the public projects endpoint (e.g. 404/501),
    // report "Belum Terhubung" without creating fake fallback records or crashing.
    const sourceState = sourceStateFor(error);
    return {
      connected: false,
      data: [],
      sourceState,
      message: sourceStateCopy(sourceState, "Proyek").message,
    };
  }
}

export async function fetchProjectDetail(
  projectId: string,
  signal?: AbortSignal,
): Promise<SourceHonestResponse<WorkProject | null>> {
  if (!projectId) {
    return { connected: false, data: null, sourceState: "validation", message: "ID Proyek tidak valid." };
  }

  try {
    const data = await authenticatedApiRequest<WorkProject>(`/api/v1/projects/${projectId}`, {
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
      message: sourceStateCopy(sourceState, "Proyek").message,
    };
  }
}
