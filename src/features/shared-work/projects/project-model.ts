import { ApiRequestError, apiMessage, authenticatedApiRequest, withQuery } from "@/lib/api";
import type { SharedWorkProjectCreateRequest, SharedWorkProjectProjection, SharedWorkProjectUpdateRequest } from "@/lib/contracts";

import { sourceStateCopy, sourceStateFor } from "../shared/source-state";
import type { SourceHonestResponse, WorkProject } from "./project-types";

export interface FetchProjectsOptions {
  readonly search?: string;
  readonly signal?: AbortSignal;
  readonly status?: string;
}

export function projectMutationMessage(error: unknown, ownerSelected: boolean): string {
  // The Backend uses the same non-disclosing 404 for an inaccessible Project
  // and a rejected owner. Preserve that ambiguity in the user-facing message.
  if (ownerSelected && error instanceof ApiRequestError && error.status === 404 && error.code === "WORK_RECORD_NOT_FOUND") {
    return "Penanggung jawab yang dipilih tidak memiliki akses ke ruang kerja proyek ini, atau proyek sudah tidak tersedia. Muat ulang data lalu coba lagi.";
  }
  return apiMessage(error);
}

export function projectFromProjection(project: SharedWorkProjectProjection): WorkProject {
  const riskLabels = {
    LOW: "RENDAH", MEDIUM: "SEDANG", HIGH: "TINGGI", CRITICAL: "KRITIS",
  } as const;
  return {
    id: project.project_id,
    code: project.code,
    name: project.name,
    description: project.description ?? null,
    objective: project.objective ?? null,
    priority: project.priority ?? "NORMAL",
    status: project.status,
    ownerActorId: project.owner_actor_id ?? null,
    ownerName: project.owner_name ?? null,
    workspaceIds: project.workspace_ids,
    workspaceName: project.workspace_name ?? null,
    startDate: project.start_date ?? null,
    targetEndDate: project.target_end_date ?? null,
    createdAt: project.created_at,
    updatedAt: project.updated_at,
    progressPercentage: project.progress_percentage ?? null,
    riskLevel: project.risk_level ? riskLabels[project.risk_level] : null,
    tasksCount: project.tasks_count ?? null,
    documentsCount: project.documents_count ?? null,
    approvalsCount: project.approvals_count ?? null,
    findingsCount: project.findings_count ?? null,
    reportsCount: project.reports_count ?? null,
    evidenceCount: project.evidence_count ?? null,
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

export async function updateProject(projectId: string, request: SharedWorkProjectUpdateRequest): Promise<WorkProject> {
  const data = await authenticatedApiRequest<SharedWorkProjectProjection>(`/api/v1/projects/${encodeURIComponent(projectId)}`, {
    method: "PATCH",
    body: request,
  });
  return projectFromProjection(data);
}

export async function archiveProject(projectId: string): Promise<WorkProject> {
  const data = await authenticatedApiRequest<SharedWorkProjectProjection>(`/api/v1/projects/${encodeURIComponent(projectId)}/archive`, {
    method: "POST",
  });
  return projectFromProjection(data);
}
