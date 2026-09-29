import { authenticatedApiRequest, withQuery } from "@/lib/api";

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

export async function fetchReportResults(
  options: FetchReportResultsOptions = {},
): Promise<SourceHonestResponse<readonly WorkReportResult[]>> {
  const query: Record<string, string | undefined> = {};
  if (options.search) query.search = options.search;
  if (options.status && options.status !== "ALL") query.status = options.status;
  if (options.reportType && options.reportType !== "ALL") query.report_type = options.reportType;
  if (options.workspaceKey && options.workspaceKey !== "ALL") query.workspace_key = options.workspaceKey;

  const path = withQuery("/api/v1/work/reports/results", query);

  try {
    const data = await authenticatedApiRequest<readonly WorkReportResult[]>(path, {
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
      message: sourceStateCopy(sourceState, "Laporan").message,
    };
  }
}

export async function fetchReportDefinitions(
  options: FetchReportDefinitionsOptions = {},
): Promise<SourceHonestResponse<readonly WorkReportDefinition[]>> {
  const query: Record<string, string | undefined> = {};
  if (options.search) query.search = options.search;
  if (options.frequency && options.frequency !== "ALL") query.frequency = options.frequency;
  if (options.workspaceKey && options.workspaceKey !== "ALL") query.workspace_key = options.workspaceKey;

  const path = withQuery("/api/v1/work/reports/definitions", query);

  try {
    const data = await authenticatedApiRequest<readonly WorkReportDefinition[]>(path, {
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
      message: sourceStateCopy(sourceState, "Laporan").message,
    };
  }
}

export async function fetchReportDetail(
  reportId: string,
  signal?: AbortSignal,
): Promise<SourceHonestResponse<WorkReportResult | null>> {
  if (!reportId) {
    return { connected: false, data: null, sourceState: "validation", message: "ID Laporan tidak valid." };
  }

  try {
    const data = await authenticatedApiRequest<WorkReportResult>(
      `/api/v1/work/reports/results/${reportId}`,
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
      message: sourceStateCopy(sourceState, "Laporan").message,
    };
  }
}
