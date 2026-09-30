import { authenticatedApiRequest, withQuery } from "@/lib/api";
import type {
  SharedWorkReportCreateRequest,
  SharedWorkReportDefinitionCreateRequest,
  SharedWorkReportDefinitionProjection,
  SharedWorkReportDefinitionUpdateRequest,
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
    description: projection.description ?? null,
    periodStart: projection.period_start ?? null,
    periodEnd: projection.period_end ?? null,
    scope: projection.scope ?? null,
    ownerName: projection.owner_name ?? null,
    workspaceName: projection.workspace_name ?? null,
    publishedAt: projection.published_at ?? null,
    evidenceCount: projection.evidence_count ?? null,
    commentsCount: projection.comments_count ?? null,
  };
}

export async function fetchReportResults(
  options: FetchReportResultsOptions = {},
): Promise<SourceHonestResponse<readonly WorkReportResult[]>> {
  const query: Record<string, string | undefined> = {};
  if (options.search) query.search = options.search;
  if (options.status && options.status !== "ALL") query.status = options.status;
  if (options.reportType && options.reportType !== "ALL") query.report_type = options.reportType;

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
  try {
    const data = await authenticatedApiRequest<readonly SharedWorkReportDefinitionProjection[]>(
      "/api/v1/work/reports/definitions", { signal: options.signal },
    );
    const query = options.search?.trim().toLowerCase();
    return {
      connected: true,
      data: data.map(adaptReportDefinition).filter((definition) =>
        (!query || definition.name.toLowerCase().includes(query)) &&
        (!options.frequency || definition.frequency === options.frequency),
      ),
    };
  } catch (error) {
    const sourceState = sourceStateFor(error);
    return { connected: false, data: [], sourceState,
      message: sourceStateCopy(sourceState, "Definisi laporan").message };
  }
}

export function adaptReportDefinition(
  projection: SharedWorkReportDefinitionProjection,
): WorkReportDefinition {
  return {
    id: projection.report_definition_id,
    name: projection.name,
    description: projection.description ?? null,
    reportType: projection.report_type,
    frequency: projection.frequency,
    scope: projection.scope ?? null,
    ownerActorId: projection.owner_actor_id,
    ownerName: projection.owner_name ?? null,
    workspaceIds: [projection.workspace_id],
    workspaceName: projection.workspace_name ?? null,
    reviewRequired: projection.review_required,
    recipients: projection.recipients,
    sections: projection.sections,
    dataSources: projection.data_sources,
    scheduleConfig: projection.schedule_config,
    createdAt: projection.created_at,
    updatedAt: projection.updated_at,
  };
}

export async function createReportDefinition(
  payload: SharedWorkReportDefinitionCreateRequest,
): Promise<WorkReportDefinition> {
  const result = await authenticatedApiRequest<SharedWorkReportDefinitionProjection>(
    "/api/v1/work/reports/definitions",
    { method: "POST", body: JSON.stringify(payload) },
  );
  return adaptReportDefinition(result);
}

export async function updateReportDefinition(
  id: string, payload: SharedWorkReportDefinitionUpdateRequest,
): Promise<WorkReportDefinition> {
  const result = await authenticatedApiRequest<SharedWorkReportDefinitionProjection>(
    `/api/v1/work/reports/definitions/${encodeURIComponent(id)}`,
    { method: "PATCH", body: JSON.stringify(payload) },
  );
  return adaptReportDefinition(result);
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

export type ReportTransition = "submit-review" | "review" | "publish" | "archive";

export async function transitionReport(
  reportId: string, action: ReportTransition,
): Promise<WorkReportResult> {
  const data = await authenticatedApiRequest<SharedWorkReportProjection>(
    `/api/v1/work/reports/results/${encodeURIComponent(reportId)}/${action}`,
    { method: "POST" },
  );
  return adaptReportProjection(data);
}
