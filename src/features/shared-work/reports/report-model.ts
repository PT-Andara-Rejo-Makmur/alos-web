import { authenticatedApiRequest, withQuery } from "@/lib/api";
import type {
  SharedWorkReportCreateRequest,
  SharedWorkReportProjection,
} from "@/lib/contracts";

import { sourceStateCopy, sourceStateFor } from "../shared/source-state";
import type {
  SourceHonestResponse,
  WorkReportDefinition,
  WorkReportResult,
} from "./report-types";

export interface FetchReportResultsOptions {
  readonly reportType?: string;
  readonly search?: string;
  readonly signal?: AbortSignal;
  readonly status?: string;
  readonly workspaceKey?: string;
}

export interface FetchReportDefinitionsOptions {
  readonly frequency?: string;
  readonly search?: string;
  readonly signal?: AbortSignal;
  readonly workspaceKey?: string;
}

export function adaptReportProjection(projection: SharedWorkReportProjection): WorkReportResult {
  return {
    id: projection.report_id,
    title: projection.title,
    reportType: projection.report_type,
    ownerActorId: projection.owner_actor_id ?? null,
    status: projection.status,
    createdAt: projection.created_at,
    workspaceIds: projection.workspace_ids,
    description: null,
    periodStart: null,
    periodEnd: null,
    scope: null,
    ownerName: null,
    workspaceName: null,
    publishedAt: null,
    evidenceCount: null,
    commentsCount: null,
  };
}

export async function fetchReportResults(
  options: FetchReportResultsOptions = {},
): Promise<SourceHonestResponse<readonly WorkReportResult[]>> {
  const query: Record<string, string | undefined> = {};
  if (options.search) query.search = options.search;
  if (options.status && options.status !== "ALL") query.status = options.status;
  if (options.reportType && options.reportType !== "ALL") query.report_type = options.reportType;
  if (options.workspaceKey && options.workspaceKey !== "ALL") {
    query.workspace_key = options.workspaceKey;
  }

  const path = withQuery("/api/v1/work/reports/results", query);

  try {
    const data = await authenticatedApiRequest<readonly SharedWorkReportProjection[]>(path, {
      signal: options.signal,
    });
    return {
      connected: true,
      data: Array.isArray(data) ? data.map(adaptReportProjection) : [],
    };
  } catch (error) {
    const sourceState = sourceStateFor(error);
    return {
      connected: false,
      data: [],
      sourceState,
      message: sourceStateCopy(sourceState, "Laporan").message,
    };
  }
}

export async function createReportResult(
  payload: SharedWorkReportCreateRequest,
): Promise<SourceHonestResponse<WorkReportResult>> {
  try {
    const data = await authenticatedApiRequest<SharedWorkReportProjection>(
      "/api/v1/work/reports/results",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );
    return {
      connected: true,
      data: adaptReportProjection(data),
    };
  } catch (error) {
    const sourceState = sourceStateFor(error);
    return {
      connected: false,
      data: null as unknown as WorkReportResult,
      sourceState,
      message: sourceStateCopy(sourceState, "Laporan").message,
    };
  }
}

export async function fetchReportDefinitions(
  options: FetchReportDefinitionsOptions = {},
): Promise<SourceHonestResponse<readonly WorkReportDefinition[]>> {
  void options;
  return {
    connected: false,
    data: [],
    sourceState: "unavailable",
    message: "Fitur definisi laporan belum tersedia di backend.",
  };
}

export async function fetchReportDetail(
  reportId: string,
  signal?: AbortSignal,
): Promise<SourceHonestResponse<WorkReportResult | null>> {
  if (!reportId) {
    return {
      connected: false,
      data: null,
      sourceState: "validation",
      message: "ID Laporan tidak valid.",
    };
  }

  try {
    const data = await authenticatedApiRequest<SharedWorkReportProjection>(
      `/api/v1/work/reports/results/${reportId}`,
      { signal },
    );
    return {
      connected: true,
      data: adaptReportProjection(data),
    };
  } catch (error) {
    const sourceState = sourceStateFor(error, "detail");
    return {
      connected: false,
      data: null,
      sourceState,
      message: sourceStateCopy(sourceState, "Laporan").message,
    };
  }
}
