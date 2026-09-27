import { authenticatedApiRequest, withQuery } from "@/lib/api";

import type { SourceHonestResponse, WorkFinding } from "./finding-types";

export interface FetchFindingsOptions {
  readonly projectId?: string;
  readonly search?: string;
  readonly severity?: string;
  readonly signal?: AbortSignal;
  readonly sourceType?: string;
  readonly status?: string;
  readonly workspaceKey?: string;
}

export async function fetchFindings(
  options: FetchFindingsOptions = {},
): Promise<SourceHonestResponse<readonly WorkFinding[]>> {
  const query: Record<string, string | undefined> = {};
  if (options.search) query.search = options.search;
  if (options.status && options.status !== "ALL") query.status = options.status;
  if (options.severity && options.severity !== "ALL") query.severity = options.severity;
  if (options.sourceType && options.sourceType !== "ALL") query.source_type = options.sourceType;
  if (options.projectId && options.projectId !== "ALL") query.project_id = options.projectId;
  if (options.workspaceKey && options.workspaceKey !== "ALL") query.workspace_key = options.workspaceKey;

  const path = withQuery("/api/v1/work/findings", query);

  try {
    const data = await authenticatedApiRequest<readonly WorkFinding[]>(path, {
      signal: options.signal,
    });
    return {
      connected: true,
      data: Array.isArray(data) ? data : [],
    };
  } catch {
    return {
      connected: false,
      data: [],
      message: "Data temuan belum terhubung. Daftar temuan akan ditampilkan setelah sumber data tersedia.",
    };
  }
}

export async function fetchFindingDetail(
  findingId: string,
  signal?: AbortSignal,
): Promise<SourceHonestResponse<WorkFinding | null>> {
  if (!findingId) {
    return { connected: false, data: null, message: "ID Temuan tidak valid." };
  }

  try {
    const data = await authenticatedApiRequest<WorkFinding>(
      `/api/v1/work/findings/${findingId}`,
      { signal },
    );
    return {
      connected: true,
      data,
    };
  } catch {
    return {
      connected: false,
      data: null,
      message: "Data temuan belum terhubung. Detail temuan akan ditampilkan setelah sumber data tersedia.",
    };
  }
}
