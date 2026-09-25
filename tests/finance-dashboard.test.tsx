import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import * as api from "@/lib/api";
import {
  FinanceAgingPanel,
  FinanceApprovalPanel,
  FinanceControlCadence,
  FinanceDataReadiness,
  FinanceDashboardHome,
  FinanceDashboardPage,
  FinanceMetricGrid,
  FinanceWalletsPanel,
  formatFinanceMetricValue,
  createEmptyFinanceSnapshot,
  DEFAULT_CONTROL_CADENCE,
  DEFAULT_SOURCE_READINESS,
} from "@/features/finance-dashboard";

import { WorkspaceShell, type WorkspaceShellIdentity } from "@/features/workspace-shell";
import { canonicalPrincipal } from "./helpers/canonical-session";

const DEFAULT_FINANCE_SNAPSHOT = createEmptyFinanceSnapshot("ws_finance_test", "Finance Workspace");

// Mock next/image
vi.mock("next/image", () => ({
  default: ({
    alt,
    src,
    ...props
  }: React.ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean; priority?: boolean }) => {
    void props;
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={typeof src === "string" ? src : ""} alt={alt || ""} />;
  },
}));

// Mock next/navigation
const mockPush = vi.fn();
const mockReplace = vi.fn();
const mockRouter = {
  push: mockPush,
  replace: mockReplace,
};

vi.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
  usePathname: () => "/workspace/finance",
}));

describe("ALOS Finance Dashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  // 1. Authorized Finance scope loads page
  it("1. mengizinkan pengguna dengan division scope FINANCE untuk memuat Finance Dashboard", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValueOnce({
      authenticated: true,
      principal: canonicalPrincipal({ actorId: "usr_fin_01", divisionCode: "FINANCE", workspaceId: "ws_finance_holding", workspaceKey: "finance", workspaceName: "Finance Workspace" }),
    });

    render(<FinanceDashboardPage initialSnapshot={DEFAULT_FINANCE_SNAPSHOT} />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Finance Command Center", level: 1 })).toBeInTheDocument();
    });
    expect(screen.getByText("ALOS / FINANCE / OVERVIEW")).toBeInTheDocument();
  });

  // 2. Unauthorized does not see Finance content (controlled 403)
  it("2. menampilkan controlled state 403 jika pengguna tidak memiliki hak akses Finance", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValueOnce({
      authenticated: true,
      principal: {
        actor_id: "usr_hr_01",
        email: "hr@andara.co.id",
        roles: ["MEMBER"],
        division_codes: ["HR"],
        workspace_ids: ["ws_hr_01"],
      },
    });

    render(<FinanceDashboardPage initialSnapshot={DEFAULT_FINANCE_SNAPSHOT} />);

    await waitFor(() => {
      expect(screen.getByText("Akses Dibatasi")).toBeInTheDocument();
    });
    expect(
      screen.getByText(/Halaman ini merupakan operational control room divisi Keuangan/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Kembali ke Ruang Kerja Saya/i })).toBeInTheDocument();

    // Finance content must NOT be present
    expect(screen.queryByText("Finance Command Center")).not.toBeInTheDocument();
  });

  // 3 & 4. Zero-fabrication: source absent -> metric '—', NOT '0' and NOT 'Rp 0'
  it("3 & 4. menampilkan '—' dan TIDAK menampilkan '0' atau 'Rp 0' jika sumber data finansial belum terhubung", () => {
    const disconnectedMetric = {
      key: "cash_position" as const,
      label: "Cash Position",
      mobileLabel: "Cash",
      value: null,
      state: "NOT_CONNECTED" as const,
      context: "Ledger/bank belum terhubung",
    };

    expect(formatFinanceMetricValue(disconnectedMetric)).toBe("—");

    render(<FinanceMetricGrid metrics={[disconnectedMetric]} />);
    const metricElem = screen.getByTestId("finance-metric-cash_position");
    expect(metricElem.textContent).toBe("—");
    expect(metricElem.textContent).not.toBe("0");
    expect(metricElem.textContent).not.toBe("Rp 0");
    expect(screen.getByText("Ledger/bank belum terhubung")).toBeInTheDocument();
  });

  // 5. Control Cadence contains FIN-D/W/M target labels
  it("5. memuat seluruh target kontrol kepatuhan FIN-D, FIN-W, dan FIN-M", () => {
    expect(DEFAULT_CONTROL_CADENCE.some((c) => c.code === "FIN-D-01")).toBe(true);
    expect(DEFAULT_CONTROL_CADENCE.some((c) => c.code === "FIN-D-02")).toBe(true);
    expect(DEFAULT_CONTROL_CADENCE.some((c) => c.code === "FIN-W-01")).toBe(true);
    expect(DEFAULT_CONTROL_CADENCE.some((c) => c.code === "FIN-W-02")).toBe(true);
    expect(DEFAULT_CONTROL_CADENCE.some((c) => c.code === "FIN-W-03")).toBe(true);
    expect(DEFAULT_CONTROL_CADENCE.some((c) => c.code === "FIN-M-01")).toBe(true);

    render(<FinanceControlCadence cadence={DEFAULT_CONTROL_CADENCE} />);
    expect(screen.getByText("Kontrol Harian · Mingguan · Bulanan")).toBeInTheDocument();
    expect(screen.getByText("Verifikasi transaksi")).toBeInTheDocument();
    expect(screen.getByText("Rekonsiliasi bank")).toBeInTheDocument();
    expect(screen.getByText("Arus kas 13 minggu")).toBeInTheDocument();
    expect(screen.getByText("Aging piutang & utang")).toBeInTheDocument();
    expect(screen.getByText("Varians anggaran")).toBeInTheDocument();
    expect(screen.getByText("Pajak & tutup buku")).toBeInTheDocument();
  });

  // 6. Ledger source absent -> NOT_CONNECTED
  it("6. menandai status sumber ledger dan bank sebagai NOT_CONNECTED", () => {
    render(<FinanceDataReadiness items={DEFAULT_SOURCE_READINESS} />);
    expect(screen.getByText("FINANCE DATA READINESS")).toBeInTheDocument();
    expect(screen.getByText("Sumber buku besar dan transaksi belum terhubung ke dashboard.")).toBeInTheDocument();

    const ledgerElem = screen.getByTestId("readiness-state-ledger");
    expect(ledgerElem.textContent).toBe("Not connected");

    const bankElem = screen.getByTestId("readiness-state-bank");
    expect(bankElem.textContent).toBe("Not connected");
  });

  // 7 & 8. Project context is not hardcoded and no literal 'The Park' in finance data
  it("7 & 8. tidak memuat nilai proyek hard-coded 'The Park' dalam data Finance", () => {
    const rawSnapshotStr = JSON.stringify(DEFAULT_FINANCE_SNAPSHOT);
    expect(rawSnapshotStr).not.toContain("The Park");

    render(<FinanceDashboardHome snapshot={DEFAULT_FINANCE_SNAPSHOT} />);
    expect(screen.queryByText(/The Park/i)).not.toBeInTheDocument();
  });

  // 9. Contextual ARA links
  it("9. menyediakan tautan kontekstual ke /workspace/finance/ara", () => {
    render(<FinanceDashboardHome snapshot={DEFAULT_FINANCE_SNAPSHOT} />);
    const araLinks = screen.getAllByRole("link", { name: /Tanyakan ARA tentang Finance/i });
    expect(araLinks.length).toBeGreaterThanOrEqual(1);
    expect(araLinks[0]).toHaveAttribute("href", "/workspace/finance/ara");
  });

  // 10. Agent target capability is rendered as 'Target capability', NOT 'Active'
  it("10. menandai agent Finance sebagai 'Target capability' dan BUKAN 'Active' tanpa registry live", () => {
    render(<FinanceDashboardHome snapshot={DEFAULT_FINANCE_SNAPSHOT} />);
    expect(screen.getByText("Finance Intelligence")).toBeInTheDocument();

    const reconStatus = screen.getByTestId("agent-status-ALOS-AGT-010");
    expect(reconStatus.textContent).toBe("Target capability");
    expect(reconStatus.textContent).not.toBe("Active");

    const budgetStatus = screen.getByTestId("agent-status-ALOS-AGT-011");
    expect(budgetStatus.textContent).toBe("Target capability");

    const taxStatus = screen.getByTestId("agent-status-ALOS-AGT-012");
    expect(taxStatus.textContent).toBe("Target capability");

    const approvalStatus = screen.getByTestId("agent-status-ALOS-AGT-006");
    expect(approvalStatus.textContent).toBe("Target capability");
  });

  // 11 & 12. No fake wallet balances and no hard-coded wallet count
  it("11 & 12. modul dompet dana ditandai 'Contract Pending' tanpa saldo palsu atau jumlah wallet fiktif", () => {
    render(<FinanceWalletsPanel />);
    expect(screen.getByText("Contract Pending")).toBeInTheDocument();
    expect(screen.getByText("Struktur Rekening & Dompet Dana")).toBeInTheDocument();
    // No fake balances
    expect(screen.queryByText(/Rp 100/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Rp 50/i)).not.toBeInTheDocument();
  });

  // 13. No fake AR/AP amounts
  it("13. modul AR / AP Aging tidak menampilkan nominal fiktif saat source belum canonical", () => {
    render(<FinanceAgingPanel />);
    expect(screen.getByText("AR / AP Aging")).toBeInTheDocument();
    expect(screen.getByText("Belum ada laporan aging canonical")).toBeInTheDocument();

    const bucket0 = screen.getByTestId("aging-bucket-0-30");
    expect(bucket0).toBeInTheDocument();
  });

  // 14. No fake budget variance
  it("14. kartu varians anggaran menampilkan '—' saat sumber data aktual belum terhubung", () => {
    const budgetMetric = DEFAULT_FINANCE_SNAPSHOT.metrics.find((m) => m.key === "budget_variance")!;
    expect(formatFinanceMetricValue(budgetMetric)).toBe("—");
    expect(budgetMetric.context).toBe("Budget aktual belum terhubung");
  });

  // 15. Reusable WorkspaceShell is used
  it("15. menggunakan reusable WorkspaceShell dengan identitas workspace Finance", () => {
    const identity: WorkspaceShellIdentity = {
      workspaceId: "ws_fin",
      workspaceKey: "finance",
      workspaceLabel: "Finance",
      divisionCode: "FINANCE",
      roleLabel: "Finance Manager",
      accessLevel: "MEMBER",
    };

    render(
      <WorkspaceShell identity={identity}>
        <div>Finance Shell Content</div>
      </WorkspaceShell>,
    );

    expect(screen.getAllByText("Finance").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Finance Manager").length).toBeGreaterThanOrEqual(1);
  });

  // 16. Mobile primary navigation <= 5 items
  it("16. navigasi mobile bawah memiliki tepat 5 item navigasi untuk Finance", () => {
    const identity: WorkspaceShellIdentity = {
      workspaceId: "ws_fin",
      workspaceKey: "finance",
      workspaceLabel: "Finance",
      divisionCode: "FINANCE",
      roleLabel: "Finance Manager",
      accessLevel: "MEMBER",
    };

    render(
      <WorkspaceShell identity={identity} activeNavKey="overview">
        <div>Content</div>
      </WorkspaceShell>,
    );

    const bottomNav = screen.getByLabelText("Navigasi Bawah Ringkas");
    const bottomLinks = bottomNav.querySelectorAll("a, button");
    expect(bottomLinks.length).toBe(5);

    expect(within(bottomNav).getByText("Cash")).toBeInTheDocument();
    expect(within(bottomNav).getByText("Overview")).toBeInTheDocument();
    expect(within(bottomNav).getByText("Approval")).toBeInTheDocument();
  });

  // 17. Switch workspace navigates to /workspace
  it("17. tombol ganti workspace mengarah ke /workspace", () => {
    const identity: WorkspaceShellIdentity = {
      workspaceId: "ws_fin",
      workspaceKey: "finance",
      workspaceLabel: "Finance",
      divisionCode: "FINANCE",
      roleLabel: "Finance Manager",
      accessLevel: "MEMBER",
    };

    render(
      <WorkspaceShell identity={identity}>
        <div>Content</div>
      </WorkspaceShell>,
    );

    const switchLink = screen.getByLabelText("Ganti workspace dari Finance");
    expect(switchLink).toHaveAttribute("href", "/workspace");
  });

  // 18. Redirect to /login on unauthenticated session (401)
  it("18. mengarahkan ke /login jika pengguna tidak terautentikasi (401)", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValueOnce({
      authenticated: false,
    });

    render(<FinanceDashboardPage />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/login");
    });
  });

  // 19. No security authority is read from localStorage
  it("19. otorisasi tidak bergantung pada localStorage", () => {
    localStorage.setItem("alos_role", "FINANCE_ADMIN");
    localStorage.setItem("alos_is_finance", "true");

    // Even with spoofed localStorage, unauthorized user is blocked
    vi.spyOn(api, "sessionApiRequest").mockResolvedValueOnce({
      authenticated: true,
      principal: {
        actor_id: "usr_attacker",
        email: "attacker@andara.co.id",
        roles: ["MEMBER"],
        division_codes: ["LEGAL"],
        workspace_ids: ["ws_legal"],
      },
    });

    render(<FinanceDashboardPage initialSnapshot={DEFAULT_FINANCE_SNAPSHOT} />);

    waitFor(() => {
      expect(screen.getByText("Akses Dibatasi")).toBeInTheDocument();
    });
  });

  // 20. Human approval panel emphasizes human authority and provides link to approvals
  it("20. panel Approval Queue menegaskan otoritas manusia dan menyediakan tautan ke Approval Center", () => {
    render(<FinanceApprovalPanel />);
    expect(screen.getByText("Approval Queue")).toBeInTheDocument();
    expect(screen.getByTestId("approval-queue-dash").textContent).toBe("—");
    expect(screen.getByText(/Belum ada finance-specific approval projection/i)).toBeInTheDocument();
    const btn = screen.getByRole("link", { name: /Buka Approval Center/i });
    expect(btn).toHaveAttribute("href", "/workspace/finance/approvals");
  });
});
