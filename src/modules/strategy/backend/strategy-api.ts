import { authenticatedApiRequest } from "@/lib/api";
import type {
  BusinessTarget,
  BusinessTargetCreateRequest,
  BusinessTargetUpdateRequest,
  StrategyVerificationRequest,
  TargetRevisionResponse,
  ExecutiveOverviewProjection,
  CascadeAcceptRequest,
  CascadeRun,
  BusinessTargetDetail,
  CascadePreviewRequest,
  MetricObservationCreateRequest,
  PlanningAssumptionCreateRequest,
  StrategicObjectiveCreateRequest,
  StrategyPlanUpdateRequest,
  TargetRevision,
  TargetRevisionCreateRequest,
  CascadePreview,
  MetricObservation,
  PlanningAssumption,
  StrategicObjective,
  StrategyAuthorityProjection,
  StrategyPlan,
  StrategyPlanCreateRequest,
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

export type StrategyRequest = typeof authenticatedApiRequest;

export const strategyApi = {
  async listTargetDetails(signal?: AbortSignal, request: StrategyRequest = authenticatedApiRequest) {
    const targets = await request<BusinessTarget[]>(STRATEGY_API.targets, { signal });
    return Promise.all(targets.map((target) => request<BusinessTargetDetail>(
      `${STRATEGY_API.targets}/${encodeURIComponent(target.target_id)}?version=${target.version}`, { signal },
    )));
  },
  getExecutiveOverview(signal?: AbortSignal, request: StrategyRequest = authenticatedApiRequest) {
    return request<ExecutiveOverviewProjection>("/api/v1/executive/overview", { signal });
  },
  getAuthority(signal?: AbortSignal, request: StrategyRequest = authenticatedApiRequest) {
    return request<StrategyAuthorityProjection>(STRATEGY_API.authority, { signal });
  },
  createPlan(payload: StrategyPlanCreateRequest, request: StrategyRequest = authenticatedApiRequest) {
    return request<StrategyPlan>(STRATEGY_API.plans, { method: "POST", body: payload });
  },
  updatePlan(planId: string, payload: StrategyPlanUpdateRequest, request: StrategyRequest = authenticatedApiRequest) {
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
  async listAssumptions(signal?: AbortSignal, request: StrategyRequest = authenticatedApiRequest) {
    const history = await request<PlanningAssumption[]>(STRATEGY_API.assumptions, { signal });
    return history.filter((item) => !history.some((other) => other.assumption_id === item.assumption_id && other.version > item.version));
  },
  async listTargets(signal?: AbortSignal, request: StrategyRequest = authenticatedApiRequest): Promise<BusinessTarget[]> {
    const targets = await request<BusinessTarget[]>(STRATEGY_API.targets, { signal });
    return Promise.all(targets.map(async (target) => {
      const detail = await request<BusinessTargetDetail>(`${STRATEGY_API.targets}/${encodeURIComponent(target.target_id)}?version=${target.version}`, { signal });
      return { ...detail.target, observations: detail.observations, selected_observations: detail.selected_observations, authorized_actions: detail.authorized_actions, last_updated_at: detail.last_updated_at };
    }));
  },
  getTarget(targetId: string, signal?: AbortSignal, request: StrategyRequest = authenticatedApiRequest) {
    return request<BusinessTargetDetail>(`${STRATEGY_API.targets}/${encodeURIComponent(targetId)}`, { signal });
  },
  previewCascade(payload: CascadePreviewRequest, request: StrategyRequest = authenticatedApiRequest) {
    return request<CascadePreview>(STRATEGY_API.cascadePreview, { method: "POST", body: payload });
  },
  acceptCascade(cascadeRunId: string, payload: CascadeAcceptRequest, request: StrategyRequest = authenticatedApiRequest) {
    return request<CascadeRun>(`${STRATEGY_API.cascadeRuns}/${encodeURIComponent(cascadeRunId)}/accept`, {
      method: "POST",
      body: payload,
    });
  },
  createObjective(payload: StrategicObjectiveCreateRequest, request: StrategyRequest = authenticatedApiRequest) {
    return request<StrategicObjective>(STRATEGY_API.objectives, { method: "POST", body: payload });
  },
  createTarget(payload: BusinessTargetCreateRequest, request: StrategyRequest = authenticatedApiRequest) {
    return request<BusinessTarget>(STRATEGY_API.targets, { method: "POST", body: payload });
  },
  createObservation(targetId: string, payload: MetricObservationCreateRequest, request: StrategyRequest = authenticatedApiRequest) {
    return request<MetricObservation>(`${STRATEGY_API.targets}/${encodeURIComponent(targetId)}/observations`, {
      method: "POST",
      body: payload,
    });
  },
  createAssumption(payload: PlanningAssumptionCreateRequest, request: StrategyRequest = authenticatedApiRequest) {
    return request<PlanningAssumption>(STRATEGY_API.assumptions, { method: "POST", body: payload });
  },
  createRevision(targetId: string, payload: TargetRevisionCreateRequest, request: StrategyRequest = authenticatedApiRequest) {
    return request<TargetRevisionResponse>(
      `${STRATEGY_API.targets}/${encodeURIComponent(targetId)}/revisions`,
      { method: "POST", body: payload },
    );
  },
  listRevisions(targetId: string, signal?: AbortSignal, request: StrategyRequest = authenticatedApiRequest) {
    return request<TargetRevision[]>(`${STRATEGY_API.targets}/${encodeURIComponent(targetId)}/revisions`, { signal });
  },
  verifyObservation(targetId: string, observationId: string, payload: StrategyVerificationRequest, version?: number, request: StrategyRequest = authenticatedApiRequest) {
    const query = version === undefined ? "" : `?version=${version}`;
    return request<MetricObservation>(`${STRATEGY_API.targets}/${encodeURIComponent(targetId)}/observations/${encodeURIComponent(observationId)}/verification${query}`, { method: "POST", body: payload });
  },
  verifyAssumption(assumptionId: string, payload: StrategyVerificationRequest, request: StrategyRequest = authenticatedApiRequest) {
    return request<PlanningAssumption>(`${STRATEGY_API.assumptions}/${encodeURIComponent(assumptionId)}/verification`, { method: "POST", body: payload });
  },
  updateTarget(targetId: string, payload: BusinessTargetUpdateRequest, request: StrategyRequest = authenticatedApiRequest) {
    return request<BusinessTarget>(`${STRATEGY_API.targets}/${encodeURIComponent(targetId)}`, { method: "PATCH", body: payload });
  },
  transitionTarget(targetId: string, action: "submit" | "approve" | "activate", request: StrategyRequest = authenticatedApiRequest) {
    return request<BusinessTarget>(`${STRATEGY_API.targets}/${encodeURIComponent(targetId)}/${action}`, { method: "POST" });
  },
  transitionPlan(planId: string, action: "submit" | "approve" | "activate" | "archive", version?: number, request: StrategyRequest = authenticatedApiRequest) {
    const query = action === "archive" && version !== undefined ? `?version=${version}` : "";
    return request<StrategyPlan>(`${STRATEGY_API.plans}/${encodeURIComponent(planId)}/${action}${query}`, { method: "POST" });
  },
};
