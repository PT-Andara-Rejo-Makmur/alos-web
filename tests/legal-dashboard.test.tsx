import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import * as api from "@/lib/api";
import {
  LegalDashboardPage,
  LegalDataReadiness,
  LegalMetricGrid,
  PermitExpiryPanel,
  ContractReviewPanel,
  ComplianceControlPanel,
  LegalControlCadence,
  LegalAgentSupport,
  createDefaultLegalSnapshot,
  sanitizeLegalClientContext,
  DEFAULT_LEGAL_READINESS,
  DEFAULT_LEGAL_METRICS,
  DEFAULT_PERMITS_LAND,
  DEFAULT_CONTRACTS,
  DEFAULT_COMPLIANCE,
  DEFAULT_LEGAL_CADENCE,
  DEFAULT_LEGAL_AGENTS,
} from "@/features/legal-dashboard";
import { projectWorkspaceNavigation } from "@/features/workspace-shell";

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
  usePathname: () => "/workspace/legal",
}));

describe("ALOS Legal & Compliance Dashboard", () => {
  const defaultSnapshot = createDefaultLegalSnapshot();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  // 1. /workspace/legal only for authorized Legal scope
  it("1. mengizinkan pengguna dengan division scope LEGAL untuk memuat Legal Dashboard", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValueOnce({
      authenticated: true,
      principal: {
        actor_id: "usr_legal_01",
        email: "legal@andara.co.id",
        roles: ["MEMBER"],
        division_codes: ["LEGAL"],
        workspace_ids: ["ws_legal_01"],
      },
    });

    render(<LegalDashboardPage initialSnapshot={defaultSnapshot} />);

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Legal & Compliance Command Center", level: 1 }),
      ).toBeInTheDocument();
    });
    expect(screen.getByText("ALOS / LEGAL & COMPLIANCE / OVERVIEW")).toBeInTheDocument();
  });

  // 2. Unauthorized does not receive Legal content (fail-closed 403)
  it("2. pengguna tidak berwenang menerima controlled state 403 dan tidak melihat data Legal", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValueOnce({
      authenticated: true,
      principal: {
        actor_id: "usr_sales_01",
        email: "sales@andara.co.id",
        roles: ["MEMBER"],
        division_codes: ["SALES"],
        workspace_ids: ["ws_sales_01"],
      },
    });

    render(<LegalDashboardPage initialSnapshot={defaultSnapshot} />);

    await waitFor(() => {
      expect(screen.getByText("403 — AKSES DITOLAK")).toBeInTheDocument();
    });
    expect(screen.getByText("Bukan Otoritas Legal & Compliance")).toBeInTheDocument();
    expect(screen.queryByText("Legal & Compliance Command Center")).not.toBeInTheDocument();
  });

  // 3. Missing sources render "—", not zero
  it("3. menampilkan em-dash '—' saat sumber data belum terhubung, tidak mengubah null menjadi 0 palsu", () => {
    render(<LegalMetricGrid metrics={DEFAULT_LEGAL_METRICS} />);

    const permitHeading = screen.getByText("Permit Coverage");
    const parentCard = permitHeading.closest("article")!;
    expect(within(parentCard).getByText("—")).toBeInTheDocument();
    expect(within(parentCard).getByText("Permit register belum terhubung")).toBeInTheDocument();
    expect(within(parentCard).queryByText("0")).not.toBeInTheDocument();

    const expiringHeading = screen.getByText("Expiring Soon");
    const expiringCard = expiringHeading.closest("article")!;
    expect(within(expiringCard).getByText("—")).toBeInTheDocument();
    expect(within(expiringCard).queryByText("0")).not.toBeInTheDocument();
  });

  // 4. Permit source absent → NOT_CONNECTED
  it("4. sumber Permits berstatus NOT_CONNECTED saat API belum terhubung", () => {
    render(<LegalDataReadiness items={DEFAULT_LEGAL_READINESS} />);
    const permitPill = screen.getByText("Permits");
    const parent = permitPill.parentElement!;
    expect(within(parent).getByText("NOT CONNECTED")).toBeInTheDocument();
  });

  // 5. Contract source absent → NOT_CONNECTED
  it("5. sumber Contracts berstatus NOT_CONNECTED saat API belum terhubung", () => {
    render(<LegalDataReadiness items={DEFAULT_LEGAL_READINESS} />);
    const contractPill = screen.getByText("Contracts");
    const parent = contractPill.parentElement!;
    expect(within(parent).getByText("NOT CONNECTED")).toBeInTheDocument();
  });

  // 6. Claims source absent → NOT_CONNECTED
  it("6. sumber Claims berstatus NOT_CONNECTED saat API belum terhubung", () => {
    render(<LegalDataReadiness items={DEFAULT_LEGAL_READINESS} />);
    const claimsPill = screen.getByText("Claims");
    const parent = claimsPill.parentElement!;
    expect(within(parent).getByText("NOT CONNECTED")).toBeInTheDocument();
  });

  // 7. Privacy source absent → NOT_CONNECTED
  it("7. sumber Privacy berstatus NOT_CONNECTED saat API belum terhubung", () => {
    render(<LegalDataReadiness items={DEFAULT_LEGAL_READINESS} />);
    const privacyPill = screen.getByText("Privacy");
    const parent = privacyPill.parentElement!;
    expect(within(parent).getByText("NOT CONNECTED")).toBeInTheDocument();
  });

  // 8. Legal case details not shown on overview
  it("8. ringkasan overview tidak mengekspos narasi kasus atau litigasi hukum rahasia", () => {
    render(<ComplianceControlPanel items={DEFAULT_COMPLIANCE} />);
    expect(screen.getByText("Claims & Privacy")).toBeInTheDocument();
    expect(screen.queryByText(/gugatan/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/sengketa tanah/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/litigasi/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/opini hukum rahasia/i)).not.toBeInTheDocument();
  });

  // 9. No privileged payload in localStorage/query string
  it("9. fungsi sanitizeLegalClientContext membersihkan payload sensitif/privileged", () => {
    const rawData = {
      workspace: "legal",
      legalOpinion: "Privileged legal opinion regarding land dispute",
      litigation: "Case #123 ongoing arbitration",
      customerName: "John Doe",
      nik: "3374012345678901",
      safeStatus: "ACTIVE",
    };

    const sanitized = sanitizeLegalClientContext(rawData);
    expect(sanitized.safeStatus).toBe("ACTIVE");
    expect(sanitized.legalOpinion).toBeUndefined();
    expect(sanitized.litigation).toBeUndefined();
    expect(sanitized.customerName).toBeUndefined();
    expect(sanitized.nik).toBeUndefined();
  });

  // 10. No auto-sign / auto-approval action
  it("10. tidak terdapat tombol auto-sign atau auto-approval pada antarmuka", () => {
    render(<ContractReviewPanel items={DEFAULT_CONTRACTS} />);
    expect(screen.queryByRole("button", { name: /auto-sign/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /auto-approve/i })).not.toBeInTheDocument();
    expect(screen.getByText("Signature authority is human-owned.")).toBeInTheDocument();
  });

  // 11. Draft contract clearly remains draft
  it("11. kontrak draft tetap berstatus draft dan menegaskan kewenangan tanda tangan manusia", () => {
    render(<ContractReviewPanel items={DEFAULT_CONTRACTS} />);
    expect(screen.getByText("Draft pending")).toBeInTheDocument();
    expect(screen.getByText("Deviation review")).toBeInTheDocument();
    expect(screen.getByText("Consumer disclosure")).toBeInTheDocument();
    expect(screen.getByText("Signature readiness")).toBeInTheDocument();
  });

  // 12. Agent status is not Active without registry
  it("12. seluruh agen AI Legal berlabel 'Target capability' dan tidak aktif tanpa registri", () => {
    render(<LegalAgentSupport agents={DEFAULT_LEGAL_AGENTS} />);

    expect(screen.getByText("Legal Intelligence")).toBeInTheDocument();
    expect(screen.getByText("Legal Permit")).toBeInTheDocument();
    expect(screen.getByText("Contract & Legal Document")).toBeInTheDocument();
    expect(screen.getByText("Regulatory Horizon")).toBeInTheDocument();
    expect(screen.getByText("Claim Substantiation")).toBeInTheDocument();

    const badges = screen.getAllByText("Target capability");
    expect(badges.length).toBe(4);
    expect(screen.queryByText("Active")).not.toBeInTheDocument();
  });

  // 13. Same-human maker/checker is governed: backend remains authority
  it("13. otorisasi Legal bergantung pada sesi terautentikasi dan menolak bypass localStorage", async () => {
    localStorage.setItem("user_roles", JSON.stringify(["LEGAL", "EXECUTIVE"]));

    vi.spyOn(api, "sessionApiRequest").mockResolvedValueOnce({
      authenticated: true,
      principal: {
        actor_id: "usr_guest_01",
        email: "guest@andara.co.id",
        roles: ["MEMBER"],
        division_codes: ["FINANCE"],
        workspace_ids: ["ws_fin_01"],
      },
    });

    render(<LegalDashboardPage initialSnapshot={defaultSnapshot} />);

    await waitFor(() => {
      expect(screen.getByText("403 — AKSES DITOLAK")).toBeInTheDocument();
    });
  });

  // 14. No hard-coded expiry dates
  it("14. tidak membuat tanggal jatuh tempo atau expiry palsu", () => {
    render(<PermitExpiryPanel items={DEFAULT_PERMITS_LAND} />);
    expect(screen.getByText("Due ≤30 days")).toBeInTheDocument();
    expect(screen.getByText("Critical expiry")).toBeInTheDocument();

    const dashes = screen.getAllByText("—");
    expect(dashes.length).toBe(4);

    // Verify no fabricated dates
    expect(screen.queryByText(/2026-/)).not.toBeInTheDocument();
    expect(screen.queryByText(/2027-/)).not.toBeInTheDocument();
  });

  // 15. Workspace Shell is reused with Legal identity
  it("15. menggunakan WorkspaceShell dengan identitas Legal Workspace", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValueOnce({
      authenticated: true,
      principal: {
        actor_id: "usr_leg_01",
        email: "legal.lead@andara.co.id",
        roles: ["MEMBER"],
        division_codes: ["LEGAL"],
        workspace_ids: ["ws_legal_01"],
      },
    });

    render(<LegalDashboardPage initialSnapshot={defaultSnapshot} />);

    await waitFor(() => {
      const workspaceLabels = screen.getAllByText("Legal Workspace");
      expect(workspaceLabels.length).toBeGreaterThanOrEqual(1);
    });
    const roleLabels = screen.getAllByText("Legal & Compliance Manager");
    expect(roleLabels.length).toBeGreaterThanOrEqual(1);
  });

  // 16. Switch workspace redirects to /workspace
  it("16. aksi switch workspace pada sidebar mengarah ke /workspace", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValueOnce({
      authenticated: true,
      principal: {
        actor_id: "usr_leg_01",
        roles: ["MEMBER"],
        division_codes: ["LEGAL"],
        workspace_ids: ["ws_legal_01"],
      },
    });

    render(<LegalDashboardPage initialSnapshot={defaultSnapshot} />);

    await waitFor(() => {
      const switchLinks = screen.getAllByRole("link", { name: /Ganti workspace/i });
      expect(switchLinks.length).toBeGreaterThan(0);
      expect(switchLinks[0]).toHaveAttribute("href", "/workspace");
    });
  });

  // 17. ARA route is canonical (/ara)
  it("17. tombol CTA Legal Intelligence mengarah ke rute kanonikal ARA (/ara)", () => {
    render(<LegalAgentSupport agents={DEFAULT_LEGAL_AGENTS} />);

    const araLink = screen.getByRole("link", { name: /Tanyakan ARA tentang Legal/i });
    expect(araLink).toBeInTheDocument();
    expect(araLink).toHaveAttribute("href", "/ara");
  });

  // 18. Mobile bottom nav has 5 items
  it("18. proyeksi navigasi Legal memuat grup UTAMA, LEGAL, COMPLIANCE, PEKERJAAN, AI", () => {
    const nav = projectWorkspaceNavigation(
      {
        workspaceId: "ws_legal_01",
        workspaceKey: "legal",
        workspaceLabel: "Legal Workspace",
        roleLabel: "Legal & Compliance Manager",
        divisionCode: "LEGAL",
      },
      {
        user_id: "usr_01",
        organization_id: "org_01",
        roles: ["MEMBER"],
        division_codes: ["LEGAL"],
        workspace_ids: ["ws_legal_01"],
        issued_at: "",
        expires_at: "",
      },
    );

    const groups = new Set(nav.map((item) => item.group));
    expect(groups.has("UTAMA")).toBe(true);
    expect(groups.has("LEGAL")).toBe(true);
    expect(groups.has("COMPLIANCE")).toBe(true);
    expect(groups.has("PEKERJAAN")).toBe(true);
    expect(groups.has("AI")).toBe(true);

    const overviewItem = nav.find((i) => i.key === "overview");
    expect(overviewItem?.href).toBeNull();
  });

  // 19. Session / logout boundary preserved
  it("19. mengarahkan pengguna tanpa sesi (unauthenticated) ke halaman /login", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValueOnce({
      authenticated: false,
    });

    render(<LegalDashboardPage />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/login");
    });
  });

  // 20. Legal Control Cadence shows LEG-W-02 as PARTIAL and compliance panel shows regulatory note
  it("20. kontrol LEG-W-02 berstatus PARTIAL dan panel compliance menegaskan tidak ada skor regulasi tanpa sumber", () => {
    render(<LegalControlCadence cadence={DEFAULT_LEGAL_CADENCE} />);

    expect(screen.getByText("Cakupan register izin")).toBeInTheDocument();
    expect(screen.getByText("Respons isu hukum kritis")).toBeInTheDocument();
    expect(screen.getByText("Peringatan jatuh tempo")).toBeInTheDocument();
    expect(screen.getByText("Kelengkapan dokumen")).toBeInTheDocument();

    const partialBadges = screen.getAllByText("PARTIAL");
    expect(partialBadges.length).toBeGreaterThanOrEqual(1);

    cleanup();

    render(<ComplianceControlPanel items={DEFAULT_COMPLIANCE} />);
    expect(screen.getByText("No regulatory score without source.")).toBeInTheDocument();
  });
});
