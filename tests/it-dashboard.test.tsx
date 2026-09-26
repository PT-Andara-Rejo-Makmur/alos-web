import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import * as api from "@/lib/api";
import { canonicalPrincipal } from "./helpers/canonical-session";
import {
  ItDashboardPage,
  ItDataReadiness,
  ItMetricGrid,
  PlatformDeliveryPanel,
  ReleaseGovernancePanel,
  SecurityAccessPanel,
  ItControlCadence,
  GenesisControlPlanePanel,
  createDefaultItSnapshot,
  sanitizeItClientContext,
  checkMakerCheckerConflict,
  DEFAULT_IT_READINESS,
  DEFAULT_IT_METRICS,
  DEFAULT_PLATFORM_DELIVERY,
  DEFAULT_RELEASE_CHANGE,
  DEFAULT_SECURITY_ACCESS,
  DEFAULT_IT_CADENCE,
  DEFAULT_GENESIS_OPERATIONS,
} from "@/workspaces/it/overview";
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
  usePathname: () => "/workspace/it",
}));

describe("ALOS IT & Technology Dashboard", () => {
  const defaultSnapshot = createDefaultItSnapshot();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  // 1. /workspace/it only authorized IT context
  it("1. mengizinkan pengguna dengan division scope IT untuk memuat IT Dashboard", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValueOnce({
      authenticated: true,
      principal: canonicalPrincipal({ actorId: "usr_it_01", divisionCode: "IT", workspaceId: "ws_it_01", workspaceKey: "it", workspaceName: "IT Workspace", roles: ["IT_ADMIN"] }),
    });

    render(<ItDashboardPage initialSnapshot={defaultSnapshot} />);

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "IT Operations", level: 1 }),
      ).toBeInTheDocument();
    });
    expect(screen.getByText("ALOS / IT & TECHNOLOGY")).toBeInTheDocument();
  });

  // 2. QA/Security reviewer does not automatically gain IT Lead write actions (SoD)
  it("2. pengguna tidak berwenang menerima controlled state 403 dan tidak melihat data IT", async () => {
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

    render(<ItDashboardPage initialSnapshot={defaultSnapshot} />);

    await waitFor(() => {
      expect(screen.getByText("403 — AKSES DITOLAK")).toBeInTheDocument();
    });
    expect(screen.getByText("Bukan Otoritas IT & Technology")).toBeInTheDocument();
    expect(screen.queryByText("IT Operations")).not.toBeInTheDocument();
  });

  // 3. Missing monitoring source → "—", not 99.9%
  it("3. menampilkan em-dash '—' untuk ketersediaan sistem saat telemetri belum terhubung, bukan 99.9% palsu", () => {
    render(<ItMetricGrid metrics={DEFAULT_IT_METRICS} />);

    const availabilityHeading = screen.getByText("System Availability");
    const parentCard = availabilityHeading.closest("article")!;
    expect(within(parentCard).getByText("—")).toBeInTheDocument();
    expect(within(parentCard).getByText("Monitoring source belum terhubung")).toBeInTheDocument();
    expect(within(parentCard).queryByText("99.9%")).not.toBeInTheDocument();
  });

  // 4. Missing incident source → "—", not 0
  it("4. menampilkan em-dash '—' untuk insiden kritis saat sumber belum terhubung, bukan asumsi 0", () => {
    render(<ItMetricGrid metrics={DEFAULT_IT_METRICS} />);

    const incidentHeading = screen.getByText("Critical Incidents");
    const incidentCard = incidentHeading.closest("article")!;
    expect(within(incidentCard).getByText("—")).toBeInTheDocument();
    expect(within(incidentCard).getByText("Incident source belum terhubung")).toBeInTheDocument();
    expect(within(incidentCard).queryByText("0")).not.toBeInTheDocument();

    cleanup();

    render(<SecurityAccessPanel items={DEFAULT_SECURITY_ACCESS} />);
    expect(screen.getByText("Control Status")).toBeInTheDocument();
    expect(screen.getByText("No security claim without source.")).toBeInTheDocument();
  });

  // 5. Missing backup source → "—", not 100%
  it("5. menampilkan em-dash '—' untuk backup saat laporan belum terhubung, bukan 100% palsu", () => {
    render(<ItMetricGrid metrics={DEFAULT_IT_METRICS} />);

    const backupHeading = screen.getByText("Backup Success");
    const backupCard = backupHeading.closest("article")!;
    expect(within(backupCard).getByText("—")).toBeInTheDocument();
    expect(within(backupCard).getByText("Backup report belum terhubung")).toBeInTheDocument();
    expect(within(backupCard).queryByText("100%")).not.toBeInTheDocument();
  });

  // 6. Missing UAT aggregate → "—"
  it("6. menampilkan em-dash '—' untuk kelulusan UAT saat agregat belum tersedia", () => {
    render(<ItMetricGrid metrics={DEFAULT_IT_METRICS} />);

    const uatHeading = screen.getByText("UAT Pass Rate");
    const uatCard = uatHeading.closest("article")!;
    expect(within(uatCard).getByText("—")).toBeInTheDocument();
    expect(within(uatCard).getByText("Release/UAT aggregate belum tersedia")).toBeInTheDocument();
  });

  // 7. GENESIS links to canonical /workspace/it/genesis
  it("7. tombol CTA GENESIS Control Plane mengarah ke rute kanonikal /workspace/it/genesis", () => {
    render(<GenesisControlPlanePanel items={DEFAULT_GENESIS_OPERATIONS} />);

    const genesisCta = screen.getByRole("link", { name: /Buka GENESIS Control Plane/i });
    expect(genesisCta).toBeInTheDocument();
    expect(genesisCta).toHaveAttribute("href", "/workspace/it/genesis");
  });

  // 8. Governance links to canonical /workspace/it/governance
  it("8. kartu modul Governance & Audit mengarah ke portal /workspace/it/governance", () => {
    render(<GenesisControlPlanePanel items={DEFAULT_GENESIS_OPERATIONS} />);

    const governanceLink = screen.getByRole("link", { name: /Governance & Audit/i });
    expect(governanceLink).toBeInTheDocument();
    expect(governanceLink).toHaveAttribute("href", "/workspace/it/governance");
  });

  // 9. Existing GENESIS Control Plane is not duplicated
  it("9. panel GENESIS Control Plane merujuk ke modul yang sudah ada (existing module/portal)", () => {
    render(<GenesisControlPlanePanel items={DEFAULT_GENESIS_OPERATIONS} />);

    expect(screen.getByText("Agent Registry")).toBeInTheDocument();
    expect(screen.getByText("Release Requests")).toBeInTheDocument();
    expect(screen.getByText("Workspace Sources")).toBeInTheDocument();
    expect(screen.getByText("Governance & Audit")).toBeInTheDocument();

    const moduleBadges = screen.getAllByText("Existing module");
    expect(moduleBadges.length).toBe(3);
    expect(screen.getByText("Existing portal")).toBeInTheDocument();
  });

  // 10. No infrastructure secrets exposed (sanitizer)
  it("10. fungsi sanitizeItClientContext membersihkan token, secret, dan kredensial sensitif", () => {
    const rawData = {
      workspace: "it",
      githubToken: "ghp_1234567890abcdef",
      apiKey: "secret_live_key_999",
      password: "SuperSecretPassword123!",
      systemName: "ALOS Core",
      safeStatus: "ACTIVE",
    };

    const sanitized = sanitizeItClientContext(rawData);
    expect(sanitized.safeStatus).toBe("ACTIVE");
    expect(sanitized.systemName).toBe("ALOS Core");
    expect(sanitized.githubToken).toBeUndefined();
    expect(sanitized.apiKey).toBeUndefined();
    expect(sanitized.password).toBeUndefined();
  });

  // 11. No GitHub/browser token in client storage
  it("11. tidak menyimpan token atau kredensial GitHub di localStorage", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValueOnce({
      authenticated: true,
      principal: canonicalPrincipal({ actorId: "usr_it_01", divisionCode: "IT", workspaceId: "ws_it_01", workspaceKey: "it", workspaceName: "IT Workspace", roles: ["IT_ADMIN"] }),
    });

    render(<ItDashboardPage initialSnapshot={defaultSnapshot} />);

    await waitFor(() => {
      expect(screen.getByText("IT Operations")).toBeInTheDocument();
    });

    expect(localStorage.getItem("github_token")).toBeNull();
    expect(localStorage.getItem("access_token")).toBeNull();
    expect(localStorage.getItem("infra_secret")).toBeNull();
  });

  // 12. Repo existence not represented as runtime health
  it("12. panel Systems & Delivery menegaskan bahwa keberadaan repositori bukan status kesehatan runtime", () => {
    render(<PlatformDeliveryPanel items={DEFAULT_PLATFORM_DELIVERY} />);

    expect(screen.getByText("Systems & Delivery")).toBeInTheDocument();
    expect(screen.getByText("Web App")).toBeInTheDocument();
    expect(screen.getByText("Backend API")).toBeInTheDocument();
    expect(screen.getByText("Contracts")).toBeInTheDocument();
    expect(screen.getByText("Infrastructure")).toBeInTheDocument();
    expect(screen.getByText("Repo existence != runtime health.")).toBeInTheDocument();
  });

  // 13. Backup success != restore success
  it("13. membedakan verifikasi backup dan uji pemulihan (restore drill) secara terpisah", () => {
    render(<ItControlCadence cadence={DEFAULT_IT_CADENCE} />);

    expect(screen.getByText("Backup success")).toBeInTheDocument();
    expect(screen.getByText("Restore drill")).toBeInTheDocument();

    const rows = screen.getAllByRole("row");
    expect(rows.length).toBe(7); // 1 header + 6 data rows
  });

  // 14. No autonomous production release
  it("14. tidak terdapat tombol rilis produksi otonom satu-klik pada antarmuka", () => {
    render(<ReleaseGovernancePanel items={DEFAULT_RELEASE_CHANGE} />);
    expect(screen.queryByRole("button", { name: /auto-release/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /deploy-now/i })).not.toBeInTheDocument();
    expect(screen.getByText("Release requests")).toBeInTheDocument();
  });

  // 15. Maker/checker identity boundary preserved
  it("15. fungsi checkMakerCheckerConflict mendeteksi jika pembuat dan pemeriksa adalah orang yang sama", () => {
    expect(checkMakerCheckerConflict("user_123", "user_123")).toBe(true);
    expect(checkMakerCheckerConflict("user_123", "user_456")).toBe(false);
  });

  // 16. Workspace Shell reused with IT identity
  it("16. menggunakan WorkspaceShell dengan identitas IT Workspace", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValueOnce({
      authenticated: true,
      principal: canonicalPrincipal({ actorId: "usr_it_01", divisionCode: "IT", workspaceId: "ws_it_01", workspaceKey: "it", workspaceName: "IT Workspace", roles: ["IT_ADMIN"] }),
    });

    render(<ItDashboardPage initialSnapshot={defaultSnapshot} />);

    await waitFor(() => {
      const workspaceLabels = screen.getAllByText("IT Workspace");
      expect(workspaceLabels.length).toBeGreaterThanOrEqual(1);
    });
    const roleLabels = screen.getAllByText("Administrator IT");
    expect(roleLabels.length).toBeGreaterThanOrEqual(1);
  });

  // 17. Switch workspace redirects to /workspace
  it("17. aksi switch workspace pada sidebar mengarah ke /workspace", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValueOnce({
      authenticated: true,
      principal: canonicalPrincipal({ actorId: "usr_it_01", divisionCode: "IT", workspaceId: "ws_it_01", workspaceKey: "it", workspaceName: "IT Workspace", roles: ["IT_ADMIN"] }),
    });

    render(<ItDashboardPage initialSnapshot={defaultSnapshot} />);

    await waitFor(() => {
      const switchLinks = screen.getAllByRole("link", { name: /Ganti workspace/i });
      expect(switchLinks.length).toBeGreaterThan(0);
      expect(switchLinks[0]).toHaveAttribute("href", "/workspace");
    });
  });

  // 18. Mobile nav <= 5 and IT navigation projection
  it("18. proyeksi navigasi IT memisahkan IDENTITY_ACCESS dari ALOS_PLATFORM", () => {
    const nav = projectWorkspaceNavigation(
      {
        workspaceId: "ws_it_01",
        workspaceKey: "it",
        workspaceLabel: "IT Workspace",
        roleLabel: "IT Lead",
        divisionCode: "IT",
      },
      {
        user_id: "usr_01",
        organization_id: "org_01",
        roles: ["IT_ADMIN"],
        division_codes: ["IT"],
        workspace_ids: ["ws_it_01"],
        issued_at: "",
        expires_at: "",
      },
    );

    const groups = new Set(nav.map((item) => item.group));
    expect(groups.has("UTAMA")).toBe(true);
    expect(groups.has("ALOS_PLATFORM")).toBe(true);
    expect(groups.has("IDENTITY_ACCESS")).toBe(true);
    expect(groups.has("ENGINEERING")).toBe(true);
    expect(groups.has("OPERATIONS")).toBe(true);
    expect(groups.has("GENESIS")).toBe(true);
    expect(groups.has("GOVERNANCE")).toBe(true);
    expect(groups.has("AI")).toBe(true);

    const overviewItem = nav.find((i) => i.key === "overview");
    expect(overviewItem?.href).toBe("/workspace/it");
    expect(overviewItem?.navigable).toBe(true);
    expect(nav.find((item) => item.key === "users")?.group).toBe("IDENTITY_ACCESS");
    expect(nav.find((item) => item.key === "register-user")?.group).toBe("IDENTITY_ACCESS");
  });

  // 19. Session/logout boundary preserved
  it("19. mengarahkan pengguna tanpa sesi (unauthenticated) ke halaman /login", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValueOnce({
      authenticated: false,
    });

    render(<ItDashboardPage />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/login");
    });
  });

  // 20. Data Readiness shows PARTIAL for GENESIS/Governance and NOT_CONNECTED for telemetry
  it("20. IT Data Readiness menampilkan PARTIAL untuk GENESIS & Governance, dan NOT_CONNECTED untuk monitoring", () => {
    render(<ItDataReadiness items={DEFAULT_IT_READINESS} />);

    const genesisPill = screen.getByText("GENESIS");
    expect(within(genesisPill.parentElement!).getByText("PARTIAL")).toBeInTheDocument();

    const governancePill = screen.getByText("Governance");
    expect(within(governancePill.parentElement!).getByText("PARTIAL")).toBeInTheDocument();

    const monitoringPill = screen.getByText("Monitoring");
    expect(within(monitoringPill.parentElement!).getByText("NOT CONNECTED")).toBeInTheDocument();
  });
});
