import { authenticatedApiRequest, withQuery } from "@/lib/api";

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
  } catch {
    // Source honesty: If the Backend has not yet exposed the public projects endpoint (e.g. 404/501),
    // report "Belum Terhubung" without creating fake fallback records or crashing.
    return {
      connected: false,
      data: [],
      message:
        "Layanan proyek Backend belum terhubung. Endpoint /api/v1/projects belum didaftarkan di alos-backend.",
    };
  }
}

export async function fetchProjectDetail(
  projectId: string,
  signal?: AbortSignal,
): Promise<SourceHonestResponse<WorkProject | null>> {
  if (!projectId) {
    return { connected: false, data: null, message: "ID Proyek tidak valid." };
  }

  try {
    const data = await authenticatedApiRequest<WorkProject>(`/api/v1/projects/${projectId}`, {
      signal,
    });
    return {
      connected: true,
      data,
    };
  } catch {
    return {
      connected: false,
      data: null,
      message:
        "Detail proyek belum dapat dimuat dari Backend. Endpoint /api/v1/projects/:id belum tersedia.",
    };
  }
}
