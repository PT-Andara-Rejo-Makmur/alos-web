import { authenticatedApiRequest } from "@/lib/api";
import type {
  BusinessTarget,
  CascadePreview,
  MetricObservation,
  PlanningAssumption,
  StrategicObjective,
  StrategyAuthorityProjection,
  StrategyPlan,
  StrategyPlanCreateRequest,
  TargetRelationship,
} from "@/lib/contracts";

export const STRATEGY_API = {
  plans: "/api/v1/strategy/plans",
  authority: "/api/v1/strategy/authority",
  objectives: "/api/v1/strategy/objectives",
  targets: "/api/v1/strategy/targets",
  assumptions: "/api/v1/strategy/assumptions",
  cascadePreview: "/api/v1/strategy/cascade/preview",
  cascadeRuns: "/api/v1/strategy/cascade-runs",
} as const;

export interface TargetDetailResponse {
  readonly target: BusinessTarget;
  readonly observations: readonly MetricObservation[];
  readonly relationships: readonly TargetRelationship[];
  readonly revisions: readonly Record<string, unknown>[];
}

export type StrategyRequest = typeof authenticatedApiRequest;

export const strategyApi = {
  getAuthority(signal?: AbortSignal, request: StrategyRequest = authenticatedApiRequest) {
    return request<StrategyAuthorityProjection>(STRATEGY_API.authority, { signal });
  },
  createPlan(payload: StrategyPlanCreateRequest, request: StrategyRequest = authenticatedApiRequest) {
    return request<StrategyPlan>(STRATEGY_API.plans, { method: "POST", body: payload });
  },
  updatePlan(planId: string, payload: Partial<Pick<StrategyPlanCreateRequest, "name" | "description" | "owner_role_ref" | "period" | "materiality" | "source_refs" | "evidence_refs">>, request: StrategyRequest = authenticatedApiRequest) {
    return request<StrategyPlan>(`${STRATEGY_API.plans}/${encodeURIComponent(planId)}`, { method: "PATCH", body: payload });
  },
  listPlans(signal?: AbortSignal, request: StrategyRequest = authenticatedApiRequest) {
    return request<StrategyPlan[]>(STRATEGY_API.plans, { signal });
  },
  getPlan(planId: string, signal?: AbortSignal, request: StrategyRequest = authenticatedApiRequest) {
    return request<StrategyPlan>(`${STRATEGY_API.plans}/${encodeURIComponent(planId)}`, { signal });
  },
  listObjectives(planId: string, signal?: AbortSignal, request: StrategyRequest = authenticatedApiRequest) {
    return request<StrategicObjective[]>(`${STRATEGY_API.objectives}?plan_id=${encodeURIComponent(planId)}`, { signal });
  },
  listAssumptions(signal?: AbortSignal, request: StrategyRequest = authenticatedApiRequest) {
    return request<PlanningAssumption[]>(STRATEGY_API.assumptions, { signal });
  },
  async listTargets(signal?: AbortSignal, request: StrategyRequest = authenticatedApiRequest) {
    const targets = await request<BusinessTarget[]>(STRATEGY_API.targets, { signal });
    return Promise.all(targets.map(async (target) => {
      const detail = await request<TargetDetailResponse>(`${STRATEGY_API.targets}/${encodeURIComponent(target.target_id)}`, { signal });
      return { ...detail.target, observations: detail.observations };
    }));
  },
  getTarget(targetId: string, signal?: AbortSignal, request: StrategyRequest = authenticatedApiRequest) {
    return request<TargetDetailResponse>(`${STRATEGY_API.targets}/${encodeURIComponent(targetId)}`, { signal });
  },
  previewCascade(payload: unknown, request: StrategyRequest = authenticatedApiRequest) {
    return request<CascadePreview>(STRATEGY_API.cascadePreview, { method: "POST", body: payload });
  },
  acceptCascade(cascadeRunId: string, derivedTargets: readonly unknown[], request: StrategyRequest = authenticatedApiRequest) {
    return request(`${STRATEGY_API.cascadeRuns}/${encodeURIComponent(cascadeRunId)}/accept`, {
      method: "POST",
      body: { derived_targets: derivedTargets },
    });
  },
  createObjective(payload: Record<string, unknown>, request: StrategyRequest = authenticatedApiRequest) {
    return request<StrategicObjective>(STRATEGY_API.objectives, { method: "POST", body: payload });
  },
  createTarget(payload: Record<string, unknown>, request: StrategyRequest = authenticatedApiRequest) {
    return request<BusinessTarget>(STRATEGY_API.targets, { method: "POST", body: payload });
  },
  createObservation(targetId: string, payload: Record<string, unknown>, request: StrategyRequest = authenticatedApiRequest) {
    return request<MetricObservation>(`${STRATEGY_API.targets}/${encodeURIComponent(targetId)}/observations`, {
      method: "POST",
      body: payload,
    });
  },
  createAssumption(payload: Record<string, unknown>, request: StrategyRequest = authenticatedApiRequest) {
    return request<PlanningAssumption>(STRATEGY_API.assumptions, { method: "POST", body: payload });
  },
  createRevision(targetId: string, payload: { reason: string }, request: StrategyRequest = authenticatedApiRequest) {
    return request<{ revision: Record<string, unknown>; target: BusinessTarget }>(
      `${STRATEGY_API.targets}/${encodeURIComponent(targetId)}/revisions`,
      { method: "POST", body: payload },
    );
  },
  listRevisions(targetId: string, signal?: AbortSignal, request: StrategyRequest = authenticatedApiRequest) {
    return request<Record<string, unknown>[]>(`${STRATEGY_API.targets}/${encodeURIComponent(targetId)}/revisions`, { signal });
  },
  transitionPlan(planId: string, action: "submit" | "approve" | "activate", request: StrategyRequest = authenticatedApiRequest) {
    return request<StrategyPlan>(`${STRATEGY_API.plans}/${encodeURIComponent(planId)}/${action}`, { method: "POST" });
  },
};
