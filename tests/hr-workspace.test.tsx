import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import WorkspacePage from "@/app/workspace/page";
import WorkspaceKeyRoot from "@/app/workspace/[workspaceKey]/page";
import SummaryRoute from "@/app/workspace/[workspaceKey]/(domain)/summary/page";
import PerformanceRoute from "@/app/workspace/[workspaceKey]/(domain)/performance/page";
import GaRoute from "@/app/workspace/[workspaceKey]/(domain)/ga/page";
import EmployeesRoute from "@/app/workspace/[workspaceKey]/(domain)/employees/page";
import ComplianceRoute from "@/app/workspace/[workspaceKey]/(domain)/compliance/page";
import EmployeeDetailRoute from "@/app/workspace/[workspaceKey]/(domain)/employees/[employeeId]/page";
import { hasGaScope, hasHrContext, activeHrWorkspaceKey } from "@/features/hr/hr-model";
import { HrSourceStateView } from "@/features/hr/shared/hr-ui";
import { hrNavigation } from "@/features/hr/navigation";
import { resolveWorkspaceDomain } from "@/features/session";
import type { AuthenticatedPrincipalProjection } from "@/lib/contracts";
import * as api from "@/lib/api";

const mockReplace = vi.fn();
vi.mock("next/navigation", () => ({ usePathname: () => "/workspace/sdm-utama/summary", useRouter: () => ({ push: vi.fn(), refresh: vi.fn(), replace: mockReplace }) }));

function hrSession(workspaceKey = "sdm-utama", divisionCode = "HR") {
  const principal: AuthenticatedPrincipalProjection = {
    actor: { actor_id: "actor_hr", active: true, display_name: "HR Lead", organization_id: "org_1", tenant_id: "tenant_1" },
    active_workspace: { active: true, data_scope: "WORKSPACE", permission_refs: [], role_refs: ["WORKSPACE_LEAD"], scope_refs: [`workspace_${workspaceKey}`], workspace: { active: true, division_code: divisionCode, organization_id: "org_1", workspace_id: "ws_hr", workspace_key: workspaceKey, workspace_name: "Ruang SDM", workspace_type: "BUSINESS" } },
    email: "hr@example.test", expires_at: "2026-10-01T00:00:00Z", issued_at: "2026-09-27T00:00:00Z", workspace_access: [],
  };
  return { authenticated: true, principal };
}

function params<T extends Record<string, string>>(value: T) { return { params: value }; }

describe("HR / GA workspace", () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => { cleanup(); vi.restoreAllMocks(); });

  it("uses resolver authority, actual key, and fail-closes mismatch", () => {
    expect(hasHrContext(hrSession())).toBe(true);
    expect(activeHrWorkspaceKey(hrSession("sdm & people"))).toBe("sdm & people");
    expect(hasHrContext(hrSession("sales-space", "SALES"))).toBe(false);
    expect(resolveWorkspaceDomain(hrSession(), "sdm-lain")).toMatchObject({ valid: false, failureReason: "key_mismatch" });
  });

  it("distinguishes HR scope from HR/GA scope", () => {
    expect(hasGaScope(hrSession("sdm-utama", "HR"))).toBe(false);
    expect(hasGaScope(hrSession("hr-ga-utama", "HR_GA"))).toBe(true);
    expect(hasGaScope(hrSession("hrga-utama", "HRGA"))).toBe(true);
  });

  it("builds exact HR and HR/GA menu counts with encoded actual workspace key", () => {
    const hr = hrNavigation("sdm & utama", false);
    const ga = hrNavigation("sdm & utama", true);
    const labels = hr.flatMap((section) => section.items.map((item) => item.label));
    expect(labels).toHaveLength(18);
    expect(labels).not.toContain("GA & Fasilitas");
    expect(ga.flatMap((section) => section.items)).toHaveLength(19);
    expect(ga.flatMap((section) => section.items.map((item) => item.href))).toContain("/workspace/sdm%20%26%20utama/summary");
    expect(ga.flatMap((section) => section.items.map((item) => item.href)).some((href) => href.startsWith("/workspace/hr/"))).toBe(false);
  });

  it("root and summary dispatch HR to canonical summary using actual key", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValue(hrSession("sdm-utama"));
    render(<WorkspacePage />);
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith("/workspace/sdm-utama/summary"));
    cleanup();
    vi.clearAllMocks();
    vi.spyOn(api, "sessionApiRequest").mockResolvedValue(hrSession("sdm utama"));
    render(<WorkspaceKeyRoot {...params({ workspaceKey: "sdm utama" })} />);
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith("/workspace/sdm%20utama/summary"));
    cleanup();
    vi.clearAllMocks();
    vi.spyOn(api, "sessionApiRequest").mockResolvedValue(hrSession("sdm-utama"));
    render(<SummaryRoute {...params({ workspaceKey: "sdm-utama" })} />);
    expect(await screen.findByRole("heading", { name: "HR" })).toBeInTheDocument();
  });

  it("keeps Target & Kinerja separate from employee review", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValue(hrSession());
    render(<PerformanceRoute {...params({ workspaceKey: "sdm-utama" })} />);
    expect(await screen.findByRole("heading", { name: "Target & Kinerja" })).toBeInTheDocument();
    expect(screen.queryByText("Review Kinerja Karyawan")).not.toBeInTheDocument();
  });

  it("allows GA only from authoritative HR/GA metadata", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValue(hrSession("sdm-utama", "HR"));
    render(<GaRoute {...params({ workspaceKey: "sdm-utama" })} />);
    expect(await screen.findByRole("heading", { name: "Anda tidak memiliki akses ke halaman ini." })).toBeInTheDocument();
    cleanup();
    vi.clearAllMocks();
    vi.spyOn(api, "sessionApiRequest").mockResolvedValue(hrSession("hr-ga-utama", "HR_GA"));
    render(<GaRoute {...params({ workspaceKey: "hr-ga-utama" })} />);
    expect(await screen.findByRole("heading", { name: /GA & Fasilitas/ })).toBeInTheDocument();
  });

  it("keeps HR data and detail source-honest with disabled readiness actions", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValue(hrSession());
    render(<EmployeesRoute {...params({ workspaceKey: "sdm-utama" })} />);
    expect(await screen.findByRole("heading", { name: /Karyawan/ })).toBeInTheDocument();
    expect(screen.getAllByText("Belum Terhubung").length).toBeGreaterThan(0);
    screen.getByRole("button", { name: "Catat Perubahan" }).click();
    const dialog = await screen.findByRole("dialog", { name: "Catat Perubahan" });
    expect(within(dialog).getByRole("button", { name: "Simpan" })).toBeDisabled();
    expect(within(dialog).getByText(/Penyimpanan belum tersedia\./)).toBeInTheDocument();
    cleanup();
    vi.clearAllMocks();
    vi.spyOn(api, "sessionApiRequest").mockResolvedValue(hrSession());
    render(<EmployeeDetailRoute {...params({ workspaceKey: "sdm-utama", employeeId: "employee-1" })} />);
    expect(await screen.findByRole("heading", { name: "Detail Karyawan" })).toBeInTheDocument();
    expect(screen.getByText(/Identitas pada URL tidak menentukan kewenangan/)).toBeInTheDocument();
  });

  it("offers document review only as unavailable extraction readiness", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValue(hrSession());
    render(<ComplianceRoute {...params({ workspaceKey: "sdm-utama" })} />);
    expect(await screen.findByRole("heading", { name: /Dokumen & Kepatuhan/ })).toBeInTheDocument();
    screen.getByRole("button", { name: "Ambil/Telaah dari Dokumen" }).click();
    expect(await screen.findByText("Belum ada kandidat ekstraksi.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Terima" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Edit" })).not.toBeInTheDocument();
  });

  it("renders mutually exclusive source states and no extraction candidate", () => {
    const { rerender } = render(<HrSourceStateView description="Belum terhubung" state="unavailable" />);
    expect(screen.getAllByText("Belum Terhubung").length).toBeGreaterThan(0);
    rerender(<HrSourceStateView description="Belum ada data" state="connected-empty" />);
    expect(screen.getAllByText("Belum ada data").length).toBeGreaterThan(0);
    expect(screen.queryByText("Belum Terhubung")).not.toBeInTheDocument();
  });

  it("does not create HR duplicate Shared Work or ARA features", () => {
    const source = readFileSync(resolve("src/features/hr/index.ts"), "utf8");
    expect(source).not.toMatch(/hr-(projects|tasks|approvals|documents|reports|findings|ara)/i);
    expect(readFileSync(resolve("src/features/hr/navigation.ts"), "utf8")).not.toContain("/workspace/hr/");
  });
});
