import { emptyWorkFixture, executiveOverviewFixture } from "./executive-overview-fixture";
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ExecutiveDashboardPage } from "@/features/executive";
import type { AuthenticatedPrincipalProjection, BusinessTarget, MetricObservation, StrategyPlan } from "@/lib/contracts";
import * as api from "@/lib/api";
import { strategyApi } from "@/modules/strategy";

const replace = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => "/workspace/pusat-kendali-direksi/summary",
  useRouter: () => ({ replace, push: vi.fn(), refresh: vi.fn() }),
}));

const period = {
  ends_at: "2027-12-31",
  granularity: "ANNUAL" as const,
  label: "2027",
  starts_at: "2027-01-01",
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
      workspace_key: "pusat-kendali-direksi",
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

describe("Executive Workspace", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(strategyApi, "getExecutiveOverview").mockResolvedValue(executiveOverviewFixture({ plans: [activePlan], targets: [] }));
    vi.spyOn(strategyApi, "listAssumptions").mockResolvedValue([]);
    vi.spyOn(strategyApi, "getAuthority").mockResolvedValue({ authorized_actions: [] });
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

    vi.spyOn(strategyApi, "getExecutiveOverview").mockResolvedValueOnce(executiveOverviewFixture({ plans: [activePlan], targets: [{ ...target({ ref: null, type: "COMPANY" }, "Sasaran Perusahaan"), performance_state: "AT_RISK" }] }));

    render(<ExecutiveDashboardPage />);

    expect(await screen.findByRole("heading", { name: "Pusat Kendali Eksekutif" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ringkasan" })).toHaveAttribute("aria-current", "page");
    for (const label of ["Brief Eksekutif", "Rencana & Target", "Kinerja", "Inisiatif Strategis", "Review & Revisi", "Divisi", "Proyek", "Tugas", "Persetujuan", "Dokumen", "Laporan", "Temuan", "Tanya ARA"]) {
      expect(screen.getByRole("link", { name: label })).toBeInTheDocument();
    }
    expect(await screen.findByText("Sasaran Perusahaan")).toBeInTheDocument();
    expect(screen.getByText("Perlu Perhatian")).toBeInTheDocument();
    expect(screen.queryByText("Sasaran Divisi")).not.toBeInTheDocument();
    expect(screen.getAllByText("—").length).toBeGreaterThan(1);
    expect(screen.queryByText("0")).not.toBeInTheDocument();
    expect(screen.getAllByText("Belum Terhubung").length).toBeGreaterThanOrEqual(7);
    expect(screen.queryByRole("button", { name: /Setujui|Tolak|Tahan|Kembalikan/ })).not.toBeInTheDocument();
  }, 15000);

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
        role_refs: ["DIVISION_MEMBER"],
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
    const overview = vi.spyOn(strategyApi, "getExecutiveOverview").mockRejectedValue(new Error("Failed to fetch"));
    const plans = vi.spyOn(strategyApi, "listPlans");
    const targets = vi.spyOn(strategyApi, "listTargets");

    render(<ExecutiveDashboardPage />);

    expect(await screen.findByText("Data belum dapat dimuat.")).toBeInTheDocument();
    expect(screen.getByText("Data Executive belum dapat dimuat. Silakan coba kembali beberapa saat lagi.")).toBeInTheDocument();
    expect(screen.queryByText("Failed to fetch")).not.toBeInTheDocument();
    expect(screen.queryByText("Request failed")).not.toBeInTheDocument();

    expect(screen.queryByRole("button", { name: "Segarkan" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Coba lagi" })).not.toBeInTheDocument();
    expect(overview).toHaveBeenCalledTimes(1);
    expect(plans).not.toHaveBeenCalled();
    expect(targets).not.toHaveBeenCalled();
  });

  it("shows a neutral source state while Strategy data is still loading", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValueOnce(authenticatedSession());
    vi.spyOn(strategyApi, "getExecutiveOverview").mockImplementation(() => new Promise(() => {}));
    vi.spyOn(strategyApi, "listTargets").mockImplementation(() => new Promise(() => {}));

    render(<ExecutiveDashboardPage />);

    expect(await screen.findByRole("heading", { name: "Pusat Kendali Eksekutif" })).toBeInTheDocument();
    expect(screen.getAllByRole("status", { name: "Memuat" }).length).toBeGreaterThan(0);
    expect(screen.queryByText("Gagal Memuat")).not.toBeInTheDocument();
  });

  it("renders connected Shared Work using Backend counts and canonical approval states", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValueOnce(authenticatedSession());
    const work = emptyWorkFixture();
    const overview = executiveOverviewFixture({ work });
    const stamp = "2026-08-03T01:02:00Z";
    vi.spyOn(strategyApi, "getExecutiveOverview").mockResolvedValueOnce({
      ...overview,
      shared_work: { ...overview.shared_work, status: "CONNECTED", last_updated_at: stamp },
      last_updated_at: stamp,
      shared_work_data: {
        ...work, last_updated_at: stamp,
        counts: { ...work.counts, pending_approvals: 17, active_findings: 9 },
        approvals: ["PENDING", "APPROVED", "RETURNED", "REJECTED", "HELD"].map((status, i) => ({
          approval_id: `approval_${i}`, tenant_id: "tenant_1", organization_id: "org_1", workspace_ids: ["workspace_exec"],
          subject_id: `task_${i}`, subject_type: "TASK", requested_by: "actor_exec", requested_at: stamp,
          status: status as "PENDING" | "APPROVED" | "RETURNED" | "REJECTED" | "HELD",
        })),
        findings: [{ finding_id: "finding_1", tenant_id: "tenant_1", organization_id: "org_1", workspace_ids: ["workspace_exec"], title: "Temuan faktual", severity: "LOW", status: "OPEN", source_type: "MANUAL", created_at: stamp, updated_at: stamp }],
      },
    });
    const plans = vi.spyOn(strategyApi, "listPlans");
    const targets = vi.spyOn(strategyApi, "listTargets");
    render(<ExecutiveDashboardPage />);
    expect(await screen.findByText("Temuan faktual")).toBeInTheDocument();
    expect(within(screen.getByText("Keputusan Menunggu").closest("article")!).getByText("17")).toBeInTheDocument();
    expect(within(screen.getByText("Temuan Aktif").closest("article")!).getByText("9")).toBeInTheDocument();
    for (const label of ["Menunggu Keputusan", "Disetujui", "Dikembalikan", "Ditolak", "Ditahan", "Rendah"]) expect(screen.getByText(label)).toBeInTheDocument();
    for (const label of ["Pendapatan", "Penjualan / Closing", "Kas & Likuiditas", "Progres Proyek"]) {
      const card = within(screen.getByText(label).closest("article")!);
      expect(card.getByText("—")).toBeInTheDocument();
      expect(card.getByText("Belum Terhubung")).toBeInTheDocument();
    }
    expect(plans).not.toHaveBeenCalled();
    expect(targets).not.toHaveBeenCalled();
    expect(screen.queryByRole("button", { name: "Segarkan Data" })).not.toBeInTheDocument();
    expect(screen.queryByText(/baru saja diperbarui/i)).not.toBeInTheDocument();
  });

  it("distinguishes connected empty from unavailable and renders known empty counts only", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValueOnce(authenticatedSession());
    vi.spyOn(strategyApi, "getExecutiveOverview").mockResolvedValueOnce(executiveOverviewFixture({ work: emptyWorkFixture() }));
    render(<ExecutiveDashboardPage />);
    expect(await screen.findByText("Belum ada target perusahaan.")).toBeInTheDocument();
    expect(screen.getAllByText("Terhubung · Belum ada data").length).toBeGreaterThan(0);
    expect(within(screen.getByText("Keputusan Menunggu").closest("article")!).getByText("0")).toBeInTheDocument();
    expect(within(screen.getByText("Pendapatan").closest("article")!).queryByText("0")).not.toBeInTheDocument();
    expect(screen.getByText("Waktu sumber · —")).toBeInTheDocument();
  });

  it.each(["ERROR", "UNAVAILABLE"] as const)("keeps %s Shared Work unknown while Strategy succeeds", async (status) => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValueOnce(authenticatedSession());
    const overview = executiveOverviewFixture({ plans: [activePlan], targets: [target({ type: "COMPANY", ref: null }, "Target Authoritative")] });
    vi.spyOn(strategyApi, "getExecutiveOverview").mockResolvedValueOnce({ ...overview, shared_work: { ...overview.shared_work, status }, shared_work_data: null });
    render(<ExecutiveDashboardPage />);
    expect(await screen.findByText("Target Authoritative")).toBeInTheDocument();
    const card = within(screen.getByText("Keputusan Menunggu").closest("article")!);
    expect(card.getByText("—")).toBeInTheDocument();
    expect(card.queryByText("0")).not.toBeInTheDocument();
    expect(card.getByText(status === "ERROR" ? "Gagal Memuat" : "Belum Terhubung")).toBeInTheDocument();
  });

  it("keeps connected Shared Work when Strategy fails, without rendering old targets", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValueOnce(authenticatedSession());
    const overview = executiveOverviewFixture({ work: emptyWorkFixture() });
    vi.spyOn(strategyApi, "getExecutiveOverview").mockResolvedValueOnce({ ...overview, strategy: { ...overview.strategy, status: "ERROR" }, strategy_data: null });
    render(<ExecutiveDashboardPage />);
    expect((await screen.findAllByText("Gagal Memuat")).length).toBeGreaterThan(0);
    expect(screen.queryByText("Belum ada target perusahaan.")).not.toBeInTheDocument();
    expect(within(screen.getByText("Keputusan Menunggu").closest("article")!).getByText("0")).toBeInTheDocument();
  });
});
