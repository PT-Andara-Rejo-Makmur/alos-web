import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ExecutiveDashboardPage } from "@/features/executive";
import type { AuthenticatedPrincipalProjection, BusinessTarget, MetricObservation, StrategyPlan } from "@/lib/contracts";
import * as api from "@/lib/api";
import { strategyApi } from "@/modules/strategy";

const replace = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => "/workspace/executive",
  useRouter: () => ({ replace, push: vi.fn(), refresh: vi.fn() }),
}));

const period = {
  ends_at: "2027-12-31T00:00:00Z",
  granularity: "ANNUAL" as const,
  label: "2027",
  starts_at: "2027-01-01T00:00:00Z",
};

const executivePrincipal: AuthenticatedPrincipalProjection = {
  actor: {
    actor_id: "actor_exec",
    active: true,
    display_name: "Pengguna Eksekutif",
    organization_id: "org_1",
    tenant_id: "tenant_1",
  },
  active_workspace: {
    active: true,
    data_scope: "COMPANY",
    permission_refs: [],
    role_refs: ["EXECUTIVE"],
    scope_refs: ["org_1"],
    workspace: {
      active: true,
      division_code: null,
      organization_id: "org_1",
      workspace_id: "workspace_exec",
      workspace_key: "executive",
      workspace_name: "Pusat Kendali",
      workspace_type: "EXECUTIVE",
    },
  },
  email: "executive@example.test",
  expires_at: "2027-12-31T00:00:00Z",
  issued_at: "2027-01-01T00:00:00Z",
  workspace_access: [],
};

const activePlan: StrategyPlan = {
  correlation_id: "corr_plan",
  created_at: "2027-01-01T00:00:00Z",
  created_by: "actor_exec",
  description: "Rencana contoh",
  evidence_refs: [],
  lifecycle_state: "ACTIVE",
  materiality: "MATERIAL",
  name: "Rencana Strategis 2027",
  organization_id: "org_1",
  owner_role_ref: "EXECUTIVE",
  owner_workspace_id: "workspace_exec",
  period,
  plan_id: "plan_2027",
  plan_type: "STRATEGIC_PLAN",
  scope: { ref: null, type: "COMPANY" },
  source_refs: [],
  tenant_id: "tenant_1",
  updated_at: "2027-01-01T00:00:00Z",
  version: 1,
};

function target(
  scope: BusinessTarget["scope"],
  name: string,
): BusinessTarget & { readonly observations: readonly MetricObservation[] } {
  return {
    code: name.toLowerCase().replaceAll(" ", "_"),
    created_at: "2027-01-01T00:00:00Z",
    created_by: "actor_exec",
    evidence_refs: [],
    lifecycle_state: "ACTIVE",
    materiality: "MATERIAL",
    measurement_type: "HIGHER_IS_BETTER",
    metric_code: "EXAMPLE_METRIC",
    name,
    objective_ref: null,
    organization_id: "org_1",
    owner_role_ref: "EXECUTIVE",
    owner_workspace_id: "workspace_exec",
    performance_state: "ON_TRACK",
    period,
    plan_ref: { id: "plan_2027", version: 1 },
    scope,
    source_refs: [],
    target_id: name.toLowerCase().replaceAll(" ", "_"),
    tenant_id: "tenant_1",
    unit: "COUNT",
    updated_at: "2027-01-01T00:00:00Z",
    version: 1,
    observations: [
      {
        evidence_refs: [],
        kind: "TARGET",
        observation_id: `${name}-target`,
        observed_at: "2027-01-02T00:00:00Z",
        organization_id: "org_1",
        period,
        source_mode: "SOURCE_LINKED",
        target_id: name.toLowerCase().replaceAll(" ", "_"),
        target_version: 1,
        tenant_id: "tenant_1",
        unit: "COUNT",
        value: 100,
        verification_state: "VERIFIED",
      },
    ],
  };
}

function authenticatedSession(principal = executivePrincipal) {
  return { authenticated: true, principal };
}

describe("Executive Golden Dashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("uses Executive session authority and renders only corporate Strategy targets", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValueOnce(authenticatedSession());
    vi.spyOn(strategyApi, "listPlans").mockResolvedValueOnce([activePlan]);
    vi.spyOn(strategyApi, "listTargets").mockResolvedValueOnce([
      {
        ...target({ label: "Perusahaan", ref: null, type: "COMPANY" }, "Sasaran Perusahaan"),
        performance_state: "AT_RISK",
      },
      target({ label: "Sales", ref: "sales", type: "DIVISION" }, "Sasaran Divisi"),
    ]);

    render(<ExecutiveDashboardPage />);

    expect(await screen.findByRole("heading", { name: "Pusat Kendali Eksekutif" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Pusat Kendali" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByText("Sasaran Perusahaan")).toBeInTheDocument();
    expect(screen.getByText("Perlu Perhatian")).toBeInTheDocument();
    expect(screen.queryByText("Sasaran Divisi")).not.toBeInTheDocument();
    expect(screen.getAllByText("—").length).toBeGreaterThan(1);
    expect(screen.queryByText("0")).not.toBeInTheDocument();
    expect(screen.getAllByText("Belum Terhubung").length).toBeGreaterThanOrEqual(7);
    expect(screen.queryByRole("button", { name: /Setujui|Tolak|Tahan|Kembalikan/ })).not.toBeInTheDocument();
  });

  it("fails closed for an unauthenticated session and does not call Strategy", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValueOnce({ authenticated: false, principal: null });
    const plans = vi.spyOn(strategyApi, "listPlans");
    const targets = vi.spyOn(strategyApi, "listTargets");

    render(<ExecutiveDashboardPage />);

    expect(await screen.findByRole("heading", { name: "Anda tidak memiliki akses ke halaman ini." })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Pusat Kendali Eksekutif" })).not.toBeInTheDocument();
    expect(plans).not.toHaveBeenCalled();
    expect(targets).not.toHaveBeenCalled();
  });

  it("fails closed when the active workspace is not Executive", async () => {
    const businessPrincipal: AuthenticatedPrincipalProjection = {
      ...executivePrincipal,
      active_workspace: {
        ...executivePrincipal.active_workspace!,
        data_scope: "WORKSPACE",
        role_refs: ["WORKSPACE_MEMBER"],
        workspace: { ...executivePrincipal.active_workspace!.workspace, workspace_type: "BUSINESS" },
      },
    };
    vi.spyOn(api, "sessionApiRequest").mockResolvedValueOnce(authenticatedSession(businessPrincipal));
    const plans = vi.spyOn(strategyApi, "listPlans");

    render(<ExecutiveDashboardPage />);

    expect(await screen.findByRole("heading", { name: "Anda tidak memiliki akses ke halaman ini." })).toBeInTheDocument();
    expect(plans).not.toHaveBeenCalled();
  });

  it("keeps Strategy failures human-friendly without exposing a refresh action", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValueOnce(authenticatedSession());
    const plans = vi.spyOn(strategyApi, "listPlans").mockRejectedValue(new Error("Failed to fetch"));
    const targets = vi.spyOn(strategyApi, "listTargets").mockRejectedValue(new Error("Request failed"));

    render(<ExecutiveDashboardPage />);

    expect(await screen.findByText("Target perusahaan belum dapat dimuat.")).toBeInTheDocument();
    expect(screen.getByText("Silakan coba kembali.")).toBeInTheDocument();
    expect(screen.queryByText("Failed to fetch")).not.toBeInTheDocument();
    expect(screen.queryByText("Request failed")).not.toBeInTheDocument();

    expect(screen.queryByRole("button", { name: "Segarkan" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Coba lagi" })).not.toBeInTheDocument();
    expect(plans).toHaveBeenCalledTimes(1);
    expect(targets).toHaveBeenCalledTimes(1);
  });
});
