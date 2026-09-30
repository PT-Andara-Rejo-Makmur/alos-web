import { authenticatedApiRequest, withQuery } from "@/lib/api";
import type { SharedWorkProjectCreateRequest, SharedWorkProjectProjection } from "@/lib/contracts";

import { sourceStateCopy, sourceStateFor } from "../shared/source-state";
import type { SourceHonestResponse, WorkProject } from "./project-types";

export interface FetchProjectsOptions {
  readonly search?: string;
  readonly signal?: AbortSignal;
  readonly status?: string;
}

export function projectFromProjection(project: SharedWorkProjectProjection): WorkProject {
  return {
    id: project.project_id,
    code: project.code,
    name: project.name,
    description: project.description ?? null,
    status: project.status,
    ownerActorId: project.owner_actor_id ?? null,
    ownerName: null,
    workspaceIds: project.workspace_ids,
    workspaceName: null,
    startDate: project.start_date ?? null,
    targetEndDate: project.target_end_date ?? null,
    createdAt: project.created_at,
    updatedAt: project.updated_at,
    progressPercentage: null,
    riskLevel: null,
    tasksCount: null,
    documentsCount: null,
    approvalsCount: null,
    findingsCount: null,
    reportsCount: null,
    evidenceCount: null,
  };
}

export async function fetchProjects(
  options: FetchProjectsOptions = {},
): Promise<SourceHonestResponse<readonly WorkProject[]>> {
  const query: Record<string, string | undefined> = {};
  if (options.search) query.search = options.search;
  if (options.status && options.status !== "ALL") query.status = options.status;

  const path = withQuery("/api/v1/projects", query);

  try {
    const data = await authenticatedApiRequest<readonly SharedWorkProjectProjection[]>(path, {
      signal: options.signal,
    });
    return {
      connected: true,
      data: Array.isArray(data) ? data.map(projectFromProjection) : [],
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
    const data = await authenticatedApiRequest<SharedWorkProjectProjection>(`/api/v1/projects/${encodeURIComponent(projectId)}`, {
      signal,
    });
    return {
      connected: true,
      data: projectFromProjection(data),
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

export async function createProject(
  request: SharedWorkProjectCreateRequest,
): Promise<WorkProject> {
  const data = await authenticatedApiRequest<SharedWorkProjectProjection>("/api/v1/projects", {
    method: "POST",
    body: request,
  });
  return projectFromProjection(data);
}
