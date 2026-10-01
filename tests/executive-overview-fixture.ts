import type { BusinessTarget, ExecutiveOverviewProjection, ExecutiveSharedWorkSummary, StrategyPlan } from "@/lib/contracts";

export function executiveOverviewFixture({ plans = [], targets = [], work = null }: {
  plans?: readonly StrategyPlan[];
  targets?: readonly BusinessTarget[];
  work?: ExecutiveSharedWorkSummary | null;
} = {}): ExecutiveOverviewProjection {
  return {
    tenant_id: "tenant_1", organization_id: "org_1", workspace_id: "workspace_exec",
    strategy: { source: "strategy", status: plans.length || targets.length ? "CONNECTED" : "CONNECTED_EMPTY", authoritative: true, last_updated_at: null },
    shared_work: { source: "shared_work", status: work ? "CONNECTED_EMPTY" : "UNAVAILABLE", authoritative: true, last_updated_at: work?.last_updated_at ?? null },
    domains: ["SALES", "FINANCE", "PROPERTY", "LEGAL", "HR", "IT"].map((domain) => ({ domain, status: "UNAVAILABLE", sources: [], last_verified_at: null })),
    last_updated_at: null,
    strategy_data: {
      plans, active_strategic_plans: plans.filter((plan): plan is Extract<StrategyPlan, { plan_type: "STRATEGIC_PLAN" }> => plan.plan_type === "STRATEGIC_PLAN" && plan.lifecycle_state === "ACTIVE"),
      active_operating_plans: plans.filter((plan): plan is Extract<StrategyPlan, { plan_type: "OPERATING_PLAN" }> => plan.plan_type === "OPERATING_PLAN" && plan.lifecycle_state === "ACTIVE"),
      objectives: [], assumptions: [], last_updated_at: null,
      targets: targets.filter((target) => target.scope.type === "COMPANY").map((target) => ({
        target, observations: target.observations ?? [], relationships: [], revisions: [],
        selected_observations: target.selected_observations ?? {
          target: target.observations?.find((item) => item.kind === "TARGET") ?? null,
          actual: target.observations?.find((item) => item.kind === "ACTUAL") ?? null,
          forecast: target.observations?.find((item) => item.kind === "FORECAST") ?? null,
        },
        performance_state: target.performance_state, authorized_actions: [], last_updated_at: null,
      })),
    },
    shared_work_data: work,
  };
}

export function emptyWorkFixture(): ExecutiveSharedWorkSummary {
  return {
    counts: { projects: 0, active_projects: 0, on_hold_projects: 0, completed_projects: 0, tasks: 0, overdue_tasks: 0, blocked_tasks: 0, critical_tasks: 0, pending_review_tasks: 0, approvals: 0, pending_approvals: 0, findings: 0, open_findings: 0, active_findings: 0, critical_findings: 0, high_findings: 0, pending_verification_findings: 0, reports: 0, documents: 0 },
    projects: [], tasks: [], approvals: [], findings: [], reports: [], documents: [], last_updated_at: null,
  };
}
