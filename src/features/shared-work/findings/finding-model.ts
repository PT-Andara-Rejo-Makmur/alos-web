import { authenticatedApiRequest, withQuery } from "@/lib/api";
import type {
  SharedWorkFindingCreateRequest,
  SharedWorkFindingProjection,
  SharedWorkFindingUpdateRequest,
} from "@/lib/contracts";

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

export function adaptFindingProjection(projection: SharedWorkFindingProjection): WorkFinding {
  return {
    id: projection.finding_id,
    title: projection.title,
    description: projection.description ?? null,
    severity: projection.severity,
    status: projection.status,
    sourceType: projection.source_type,
    ownerActorId: projection.owner_actor_id ?? null,
    createdAt: projection.created_at,
    identifiedAt: projection.identified_at ?? projection.created_at,
    workspaceIds: projection.workspace_ids,
    category: projection.category ?? null,
    dueDate: projection.due_date ?? null,
    workspaceName: projection.workspace_name ?? null,
    projectId: projection.project_id ?? null,
    projectName: projection.project_name ?? null,
    ownerName: projection.owner_name ?? null,
    verifierActorId: projection.verifier_actor_id ?? null,
    verifierName: projection.verifier_name ?? null,
    impact: projection.impact ?? null,
    rootCause: projection.root_cause ?? null,
    correctiveActionTaskId: projection.corrective_action_task_id ?? null,
    correctiveActionTaskTitle: projection.corrective_action_task_title ?? null,
    evidenceCount: projection.evidence_count ?? null,
    tasksCount: projection.tasks_count ?? null,
  };
}

export async function fetchFindings(
  options: FetchFindingsOptions = {},
): Promise<SourceHonestResponse<readonly WorkFinding[]>> {
  const query: Record<string, string | undefined> = {};
  if (options.search) query.search = options.search;
  if (options.status && options.status !== "ALL") query.status = options.status;
  if (options.severity && options.severity !== "ALL") query.severity = options.severity;
  if (options.sourceType && options.sourceType !== "ALL") query.source_type = options.sourceType;

  const path = withQuery("/api/v1/work/findings", query);

  try {
    const data = await authenticatedApiRequest<readonly SharedWorkFindingProjection[]>(path, {
      signal: options.signal,
    });
    return {
      connected: true,
      data: Array.isArray(data) ? data.map(adaptFindingProjection) : [],
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

export async function createFinding(
  payload: SharedWorkFindingCreateRequest,
): Promise<SourceHonestResponse<WorkFinding>> {
  try {
    const data = await authenticatedApiRequest<SharedWorkFindingProjection>(
      "/api/v1/work/findings",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );
    return {
      connected: true,
      data: adaptFindingProjection(data),
    };
  } catch (error) {
    const sourceState = sourceStateFor(error);
    return {
      connected: false,
      data: null as unknown as WorkFinding,
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
    return {
      connected: false,
      data: null,
      sourceState: "validation",
      message: "ID Temuan tidak valid.",
    };
  }

  try {
    const data = await authenticatedApiRequest<SharedWorkFindingProjection>(
      `/api/v1/work/findings/${findingId}`,
      { signal },
    );
    return {
      connected: true,
      data: adaptFindingProjection(data),
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

export async function updateFinding(
  findingId: string, payload: SharedWorkFindingUpdateRequest,
): Promise<WorkFinding> {
  const data = await authenticatedApiRequest<SharedWorkFindingProjection>(
    `/api/v1/work/findings/${encodeURIComponent(findingId)}`,
    { method: "PATCH", body: payload },
  );
  return adaptFindingProjection(data);
}

export async function assignFinding(
  findingId: string, ownerActorId: string,
): Promise<WorkFinding> {
  const data = await authenticatedApiRequest<SharedWorkFindingProjection>(
    `/api/v1/work/findings/${encodeURIComponent(findingId)}/assign`,
    { method: "POST", body: { owner_actor_id: ownerActorId } },
  );
  return adaptFindingProjection(data);
}

export type FindingTransition = "start" | "submit-verification" | "verify" | "close";

export async function transitionFinding(
  findingId: string, action: FindingTransition,
): Promise<WorkFinding> {
  const data = await authenticatedApiRequest<SharedWorkFindingProjection>(
    `/api/v1/work/findings/${encodeURIComponent(findingId)}/${action}`,
    { method: "POST" },
  );
  return adaptFindingProjection(data);
}
