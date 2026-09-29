import { authenticatedApiRequest, withQuery } from "@/lib/api";

import { sourceStateCopy, sourceStateFor } from "../shared/source-state";
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
  } catch (error) {
    const sourceState = sourceStateFor(error);
    return {
      connected: false,
      data: [],
      sourceState,
      message: sourceStateCopy(sourceState, "Temuan").message,
    };
  }
}

export async function fetchFindingDetail(
  findingId: string,
  signal?: AbortSignal,
): Promise<SourceHonestResponse<WorkFinding | null>> {
  if (!findingId) {
    return { connected: false, data: null, sourceState: "validation", message: "ID Temuan tidak valid." };
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
  } catch (error) {
    const sourceState = sourceStateFor(error, "detail");
    return {
      connected: false,
      data: null,
      sourceState,
      message: sourceStateCopy(sourceState, "Temuan").message,
    };
  }
}
