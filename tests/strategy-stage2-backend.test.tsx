import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/lib/api";
import * as api from "@/lib/api";
import type { BusinessTarget, CascadePreview, StrategyPlan } from "@/lib/contracts";
import { CascadePreviewView, RenstraWorkspace, TargetsWorkspace, strategyApi } from "@/modules/strategy";

const context = {
  workspaceKey: "executive",
  workspaceLabel: "Executive",
  divisionCode: "EXECUTIVE",
  isCompanyWide: true,
};

const plan: StrategyPlan = {
  plan_id: "plan-rkap",
  version: 2,
  tenant_id: "tenant-1",
  organization_id: "org-1",
  plan_type: "STRATEGIC_PLAN",
  name: "Renstra 2027–2031",
  owner_workspace_id: "executive",
  owner_role_ref: "EXECUTIVE",
  period: { granularity: "CUSTOM", starts_at: "2027-01-01", ends_at: "2031-12-31" },
  scope: { type: "COMPANY", ref: null },
  lifecycle_state: "DRAFT",
  materiality: "MATERIAL",
  source_refs: [],
  evidence_refs: ["evidence:renstra"],
  created_by: "actor-1",
  created_at: "2026-09-27T00:00:00Z",
  updated_at: "2026-09-27T00:00:00Z",
  correlation_id: "corr-plan",
  authorized_actions: [],
};

const target: BusinessTarget = {
  target_id: "target-closing",
  version: 3,
  tenant_id: "tenant-1",
  organization_id: "org-1",
  code: "KPI-SM-01",
  name: "Closing",
  plan_ref: { id: "plan-rkap", version: 2 },
  objective_ref: { id: "objective-growth", version: 1 },
  metric_code: "KPI-SM-01",
  scope: { type: "DIVISION", ref: "sales" },
  period: { granularity: "ANNUAL", starts_at: "2027-01-01", ends_at: "2027-12-31" },
  measurement_type: "HIGHER_IS_BETTER",
  unit: "COUNT",
  owner_workspace_id: "sales",
  owner_role_ref: "WORKSPACE_LEAD",
  materiality: "MATERIAL",
  lifecycle_state: "DRAFT",
  evidence_refs: [],
  source_refs: [],
  created_by: "actor-1",
  created_at: "2026-09-27T00:00:00Z",
  updated_at: "2026-09-27T00:00:00Z",
  observations: [
    {
      observation_id: "obs-target",
      tenant_id: "tenant-1",
      organization_id: "org-1",
      target_id: "target-closing",
      target_version: 3,
      kind: "TARGET",
      value: 12,
      unit: "COUNT",
      period: { granularity: "ANNUAL", starts_at: "2027-01-01", ends_at: "2027-12-31" },
      source_mode: "MANUAL_EVIDENCED",
      actor_id: "actor-1",
      observed_at: "2026-09-27T00:00:00Z",
      verification_state: "PENDING_VERIFICATION",
      evidence_refs: ["evidence:target"],
    },
  ],
};

describe("Stage 2 strategy Backend integration", () => {
  beforeEach(() => vi.restoreAllMocks());
  afterEach(cleanup);

  it("loads Renstra from the canonical Backend endpoint without inferring actions", async () => {
    const request = vi.spyOn(api, "authenticatedApiRequest").mockImplementation(async (path) => {
      if (path === "/api/v1/strategy/authority") return { authorized_actions: [] } as never;
      if (path.startsWith("/api/v1/strategy/objectives")) return [] as never;
      return [plan] as never;
    });
    render(<RenstraWorkspace context={context} />);
    expect(await screen.findByText("Renstra 2027–2031")).toBeInTheDocument();
    expect(request).toHaveBeenCalledWith("/api/v1/strategy/plans", expect.any(Object));
    expect(screen.queryByRole("button", { name: "Ajukan" })).not.toBeInTheDocument();
    expect(screen.getByText("v2")).toBeInTheDocument();
  });

  it("shows plan creation only from Backend authority and posts a canonical DRAFT request", async () => {
    const request = vi.spyOn(api, "authenticatedApiRequest").mockImplementation(async (path, options) => {
      if (path === "/api/v1/strategy/authority") return { authorized_actions: ["CREATE_COMPANY_PLAN"] } as never;
      if (path.startsWith("/api/v1/strategy/objectives")) return [] as never;
      if (path === "/api/v1/strategy/plans" && options?.method === "POST") return plan as never;
      return [] as never;
    });
    render(<RenstraWorkspace context={context} />);
    fireEvent.click(await screen.findByRole("button", { name: "Buat DRAFT" }));
    fireEvent.change(screen.getByLabelText("ID Plan"), { target: { value: "plan-renstra-2027" } });
    fireEvent.change(screen.getByLabelText("Nama"), { target: { value: "Renstra 2027" } });
    fireEvent.change(screen.getByLabelText("Mulai"), { target: { value: "2027-01-01" } });
    fireEvent.change(screen.getByLabelText("Selesai"), { target: { value: "2027-12-31" } });
    fireEvent.click(screen.getByRole("button", { name: "Simpan DRAFT" }));
    await vi.waitFor(() => expect(request).toHaveBeenCalledWith("/api/v1/strategy/plans", expect.objectContaining({ method: "POST", body: expect.objectContaining({ plan_id: "plan-renstra-2027", plan_type: "STRATEGIC_PLAN" }) })));
  });

  it("keeps TARGET, ACTUAL, FORECAST, and ASSUMPTION separate and never converts missing to zero", async () => {
    vi.spyOn(api, "authenticatedApiRequest").mockImplementation(async (path) => {
      if (path === "/api/v1/strategy/targets") return [target] as never;
      return { target, observations: target.observations, relationships: [], revisions: [] } as never;
    });
    render(<TargetsWorkspace context={context} />);
    expect(await screen.findByText(/KPI-SM-01/)).toBeInTheDocument();
    for (const kind of ["TARGET", "ACTUAL", "FORECAST", "ASSUMPTION"]) {
      expect(screen.getByText(kind)).toBeInTheDocument();
    }
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getAllByText("—").length).toBeGreaterThanOrEqual(3);
    expect(screen.queryByText(/^0$/)).not.toBeInTheDocument();
    expect(screen.getByText(/PENDING_VERIFICATION/)).toBeInTheDocument();
  });

  it.each([403, 409])("fails closed for Backend status %s", async (status) => {
    vi.spyOn(api, "authenticatedApiRequest").mockRejectedValue(new ApiError(status, "Ditolak Backend", "corr-test"));
    render(<RenstraWorkspace context={context} />);
    expect(await screen.findByText(status === 403 ? "Akses ditolak" : "State berubah")).toBeInTheDocument();
    expect(screen.getByText(/Tidak ada perubahan state yang diasumsikan berhasil/)).toBeInTheDocument();
  });

  it("renders FAIL and UNKNOWN constraints and prevents cascade accept", () => {
    const preview: CascadePreview = {
      cascade_run_id: "cascade-1",
      status: "INCOMPLETE",
      root_target_ref: { id: "target-company", version: 1 },
      derived_targets: [],
      calculation_trace: [],
      assumptions_used: [],
      constraint_results: [
        { constraint_id: "inventory", result: "UNKNOWN", critical: true, message: "Source missing" },
        { constraint_id: "budget", result: "FAIL", critical: true, message: "Budget exceeded" },
      ],
      blocking_conditions: ["inventory UNKNOWN", "budget FAIL"],
      input_hash: `sha256:${"a".repeat(64)}`,
      result_hash: `sha256:${"b".repeat(64)}`,
    };
    render(<CascadePreviewView preview={preview} onBack={vi.fn()} onAccept={vi.fn()} />);
    expect(screen.getByText("UNKNOWN · KRITIS")).toBeInTheDocument();
    expect(screen.getByText("FAIL · KRITIS")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Terima sebagai Draft" })).toBeDisabled();
  });

  it("uses only canonical contract endpoints and sends no authoritative calculation", async () => {
    const request = vi.fn().mockResolvedValue({});
    await strategyApi.transitionPlan("plan-1", "submit", request);
    expect(request).toHaveBeenCalledWith("/api/v1/strategy/plans/plan-1/submit", { method: "POST" });
    expect(request.mock.calls[0][1]).not.toHaveProperty("body");
  });
});
