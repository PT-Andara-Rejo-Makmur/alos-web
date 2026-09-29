import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { financeNavigation } from "@/features/finance/navigation";
import { activeFinanceWorkspaceKey, formatFinancePeriod, formatFinancialValue, hasFinanceContext, maskAccountNumber } from "@/features/finance/finance-model";
import { resolveWorkspaceDomain } from "@/features/session";
import { FinanceBudgetPage, FinanceLiquidityPage, FinancePayablesPage, FinanceReceivablesPage, FinanceTaxPage } from "@/features/finance";
import { FinanceSourceStateView } from "@/features/finance/shared/finance-ui";
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

function propertySession(workspaceKey = "property-utama") {
  return financeSession(workspaceKey, "PROPERTY");
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
    expect(formatFinancialValue(1250000)).toBe("Rp1.250.000");
    expect(formatFinancePeriod({ granularity: "MONTHLY", starts_at: "2026-01-01T00:00:00Z", ends_at: "2026-01-31T00:00:00Z", label: "Januari 2026" })).toBe("Januari 2026");
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
    expect(await screen.findByRole("heading", { name: /Target & Kinerja/ })).toBeInTheDocument();

    cleanup();
    vi.clearAllMocks();
    vi.spyOn(api, "sessionApiRequest").mockResolvedValue(financeSession());
    render(<BudgetRoute params={{ workspaceKey: "finance-utama" }} />);
    expect(await screen.findByRole("heading", { name: "Anggaran", level: 1 })).toBeInTheDocument();
  });

  it("keeps the shared budget route authoritative across Finance and Property", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValue(financeSession());
    render(<BudgetRoute params={{ workspaceKey: "finance-utama" }} />);
    expect(await screen.findByRole("heading", { name: "Anggaran", level: 1 })).toBeInTheDocument();

    cleanup();
    vi.clearAllMocks();
    vi.spyOn(api, "sessionApiRequest").mockResolvedValue(propertySession());
    render(<BudgetRoute params={{ workspaceKey: "property-utama" }} />);
    expect(await screen.findByRole("heading", { name: "Anggaran & RAB", level: 1 })).toBeInTheDocument();

    cleanup();
    vi.clearAllMocks();
    vi.spyOn(api, "sessionApiRequest").mockResolvedValue(financeSession("sales-utama", "SALES"));
    render(<BudgetRoute params={{ workspaceKey: "sales-utama" }} />);
    expect(await screen.findByText("Anda tidak memiliki akses ke halaman ini.")).toBeInTheDocument();
  });

  it("fails closed when the requested Finance workspace key mismatches the active workspace", async () => {
    const session = financeSession("finance-utama");
    const resolution = resolveWorkspaceDomain(session, "finance-lain");
    expect(resolution.valid).toBe(false);
    expect(resolution.failureReason).toBe("key_mismatch");

    vi.spyOn(api, "sessionApiRequest").mockResolvedValue(session);
    render(<FinanceBudgetPage workspaceKey="finance-lain" />);
    expect(await screen.findByText("Anda tidak memiliki akses ke halaman ini.")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Anggaran", level: 1 })).not.toBeInTheDocument();
  });

  it("renders source-unavailable receipt form without fake submit success", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValue(financeSession());
    render(<FinanceReceivablesPage workspaceKey="finance-utama" />);
    expect(await screen.findByRole("heading", { name: "Penerimaan", level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tambah Penerimaan" })).toBeInTheDocument();
    expect(screen.getByText("Penerimaan belum tersedia.")).toBeInTheDocument();
  });

  it("changes receivables view and contextual action with the selected tab", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValue(financeSession());
    render(<FinanceReceivablesPage workspaceKey="finance-utama" />);
    await screen.findByRole("heading", { name: "Penerimaan", level: 1 });
    expect(screen.getByRole("button", { name: "Tambah Penerimaan" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Tambah Piutang" })).not.toBeInTheDocument();
    screen.getByRole("tab", { name: "Piutang" }).click();
    expect(await screen.findByRole("button", { name: "Tambah Piutang" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Tambah Penerimaan" })).not.toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Outstanding" })).toBeInTheDocument();
  });

  it("renders required relation fields as unavailable selectors", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValue(financeSession());
    render(<FinanceReceivablesPage workspaceKey="finance-utama" />);
    await screen.findByRole("button", { name: "Tambah Penerimaan" });
    screen.getByRole("tab", { name: "Piutang" }).click();
    (await screen.findByRole("button", { name: "Tambah Piutang" })).click();
    const dialog = await screen.findByRole("dialog", { name: "Tambah Piutang" });
    expect(within(dialog).getByLabelText(/Pihak/)).toBeRequired();
    expect(within(dialog).getByLabelText("Proyek")).toBeDisabled();
    expect(screen.getAllByText("Pilihan belum tersedia.").length).toBeGreaterThan(0);
  });

  it("keeps non-Finance access closed for Finance-only modules", async () => {
    const pages = [
      <FinanceLiquidityPage key="liquidity" workspaceKey="sales-utama" />,
      <FinanceReceivablesPage key="receivables" workspaceKey="sales-utama" />,
      <FinancePayablesPage key="payables" workspaceKey="sales-utama" />,
      <FinanceTaxPage key="tax" workspaceKey="sales-utama" />,
    ];
    for (const page of pages) {
      vi.spyOn(api, "sessionApiRequest").mockResolvedValue(financeSession("sales-utama", "SALES"));
      const view = render(page);
      expect(await screen.findByText("Anda tidak memiliki akses ke halaman ini.")).toBeInTheDocument();
      view.unmount();
      vi.clearAllMocks();
    }
  });

  it("presents source states as mutually exclusive", () => {
    const cases = [
      ["loading", "Memuat data"],
      ["unavailable", "Belum Terhubung"],
      ["error", "Data belum dapat dimuat"],
      ["connected-empty", "Belum ada data"],
    ] as const;
    for (const [state, label] of cases) {
      const view = render(<FinanceSourceStateView description="Status sumber" state={state} />);
      expect(screen.getAllByText(label).length).toBeGreaterThan(0);
      view.unmount();
    }
  });

  it("keeps Finance target, actual, and forecast authority separate", () => {
    const performance = readFileSync(resolve("src/features/finance/performance/finance-performance-page.tsx"), "utf8");
    expect(performance).toContain('actual: "—"');
    expect(performance).toContain('forecast: "—"');
    expect(performance).not.toContain('String(target.period)');
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
