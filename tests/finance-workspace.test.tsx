import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { financeNavigation } from "@/features/finance/navigation";
import { activeFinanceWorkspaceKey, formatFinancialValue, hasFinanceContext, maskAccountNumber } from "@/features/finance/finance-model";
import { FinanceReceivablesPage } from "@/features/finance";
import WorkspaceKeyRoot from "@/app/workspace/[workspaceKey]/page";
import SummaryRoute from "@/app/workspace/[workspaceKey]/(domain)/summary/page";
import PerformanceRoute from "@/app/workspace/[workspaceKey]/(domain)/performance/page";
import BudgetRoute from "@/app/workspace/[workspaceKey]/(domain)/budget/page";
import WorkspacePage from "@/app/workspace/page";
import type { AuthenticatedPrincipalProjection } from "@/lib/contracts";
import * as api from "@/lib/api";

const mockReplace = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => "/workspace/finance-utama/summary",
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn(), replace: mockReplace }),
}));

function financeSession(workspaceKey = "finance-utama", divisionCode = "finance") {
  const principal: AuthenticatedPrincipalProjection = {
    actor: { actor_id: "actor_finance", active: true, display_name: "Finance Lead", organization_id: "org_1", tenant_id: "tenant_1" },
    active_workspace: {
      active: true,
      data_scope: "WORKSPACE",
      permission_refs: [],
      role_refs: ["WORKSPACE_LEAD"],
      scope_refs: [`workspace_${workspaceKey}`],
      workspace: { active: true, division_code: divisionCode, organization_id: "org_1", workspace_id: "ws_finance", workspace_key: workspaceKey, workspace_name: "Ruang Keuangan", workspace_type: "BUSINESS" },
    },
    email: "finance@example.test",
    expires_at: "2026-10-01T00:00:00Z",
    issued_at: "2026-09-27T00:00:00Z",
    workspace_access: [],
  };
  return { authenticated: true, principal };
}

describe("Finance & Pajak workspace", () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => { cleanup(); vi.restoreAllMocks(); });

  it("uses canonical Finance authority and actual workspace key", () => {
    const session = financeSession("finance & ops");
    expect(hasFinanceContext(session)).toBe(true);
    expect(activeFinanceWorkspaceKey(session)).toBe("finance & ops");
    expect(hasFinanceContext(financeSession("sales-key", "SALES"))).toBe(false);
  });

  it("builds the exact 15-menu Finance sidebar with encoded workspace key", () => {
    const sections = financeNavigation("finance & ops");
    expect(sections.flatMap((section) => section.items.map((item) => item.label))).toHaveLength(15);
    expect(sections.flatMap((section) => section.items.map((item) => item.href))).toContain("/workspace/finance%20%26%20ops/summary");
    expect(sections.flatMap((section) => section.items.map((item) => item.href)).some((href) => href.startsWith("/workspace/finance/"))).toBe(false);
    expect(sections.flatMap((section) => section.items.map((item) => item.href)).filter((href) => href.endsWith("/projects"))).toHaveLength(1);
  });

  it("keeps unknown financial values distinct from actual zero and masks accounts", () => {
    expect(formatFinancialValue(null)).toBe("—");
    expect(formatFinancialValue(0)).toBe("Rp0");
    expect(maskAccountNumber("1234 5678 7821")).toBe("**** 7821");
    expect(maskAccountNumber(null)).toBe("—");
  });

  it("routes Finance root and collisions to Finance canonical pages", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValue(financeSession("finance & ops"));
    render(<WorkspacePage />);
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith("/workspace/finance%20%26%20ops/summary"));

    cleanup();
    vi.clearAllMocks();
    vi.spyOn(api, "sessionApiRequest").mockResolvedValue(financeSession());
    render(<WorkspaceKeyRoot params={{ workspaceKey: "finance-utama" }} />);
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith("/workspace/finance-utama/summary"));

    cleanup();
    vi.clearAllMocks();
    vi.spyOn(api, "sessionApiRequest").mockResolvedValue(financeSession());
    render(<SummaryRoute params={{ workspaceKey: "finance-utama" }} />);
    expect(await screen.findByRole("heading", { name: "Finance & Pajak" })).toBeInTheDocument();

    cleanup();
    vi.clearAllMocks();
    vi.spyOn(api, "sessionApiRequest").mockResolvedValue(financeSession());
    vi.spyOn(api, "authenticatedApiRequest").mockResolvedValue([] as never);
    render(<PerformanceRoute params={{ workspaceKey: "finance-utama" }} />);
    expect(await screen.findByRole("heading", { name: "Target & Kinerja" })).toBeInTheDocument();

    cleanup();
    vi.clearAllMocks();
    vi.spyOn(api, "sessionApiRequest").mockResolvedValue(financeSession());
    render(<BudgetRoute params={{ workspaceKey: "finance-utama" }} />);
    expect(await screen.findByRole("heading", { name: "Anggaran & Realisasi" })).toBeInTheDocument();
  });

  it("renders source-unavailable receipt form without fake submit success", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValue(financeSession());
    render(<FinanceReceivablesPage workspaceKey="finance-utama" />);
    expect(await screen.findByRole("heading", { name: "Penerimaan & Piutang" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tambah Penerimaan" })).toBeInTheDocument();
    expect(screen.getByText("Penerimaan dan piutang belum tersedia.")).toBeInTheDocument();
  });

  it("does not create a static Finance route tree or duplicate universal features", () => {
    const routes = readFileSync(resolve("src/app/navigation.ts"), "utf8");
    const featureTree = readFileSync(resolve("src/features/finance/index.ts"), "utf8");
    expect(routes).not.toMatch(/\/workspace\/finance\//);
    expect(featureTree).not.toMatch(/finance-(projects|tasks|approvals|documents|reports|findings|ara)/);
  });

  it("shows the disabled form action after opening the receipt form", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValue(financeSession());
    render(<FinanceReceivablesPage workspaceKey="finance-utama" />);
    await waitFor(() => expect(screen.getByRole("button", { name: "Tambah Penerimaan" })).toBeInTheDocument());
    screen.getByRole("button", { name: "Tambah Penerimaan" }).click();
    expect(await screen.findByRole("button", { name: "Simpan Penerimaan" })).toBeDisabled();
    expect(screen.getByText("Penyimpanan Belum Tersedia")).toBeInTheDocument();
  });
});
