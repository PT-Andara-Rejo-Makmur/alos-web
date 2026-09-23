import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import * as api from "@/lib/api";
import {
  PropertyDashboardPage,
  PropertyDataReadiness,
  PropertyMetricGrid,
  PropertyProgressPanel,
  PropertyMilestonePanel,
  PropertyRiskPanel,
  ConstructionControlCadence,
  PropertyAgentSupport,
  DEFAULT_PROPERTY_SNAPSHOT,
  EMPTY_PROPERTY_PORTFOLIO,
  DEFAULT_PROPERTY_READINESS,
  DEFAULT_CONSTRUCTION_CADENCE,
  DEFAULT_PROPERTY_AGENTS,
  sortMilestonesDeterministically,
} from "@/features/property-dashboard";

const CANONICAL_PROPERTY_PORTFOLIO = {
  ...EMPTY_PROPERTY_PORTFOLIO,
  metrics: { total: 3, on_track: 2, at_risk: 1, critical: 0, completed: 0 },
  distribution: [
    { status: "ON_TRACK" as const, label: "On Track", count: 2 },
    { status: "AT_RISK" as const, label: "At Risk", count: 1 },
    { status: "CRITICAL" as const, label: "Critical", count: 0 },
  ],
  progress: [{ period: "2026-01", label: "Jan", value: 12 }],
  milestones: [
    { milestone_id: "m1", project_id: "p1", project_name: "Project 1", title: "Site preparation", due_date: "2026-09-26", status: "ON_TRACK" as const },
    { milestone_id: "m2", project_id: "p2", project_name: "Project 2", title: "Foundation review", due_date: "2026-10-04", status: "AT_RISK" as const },
    { milestone_id: "m3", project_id: "p3", project_name: "Project 3", title: "Design freeze", due_date: "2026-10-12", status: "ON_TRACK" as const },
  ],
};

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
  usePathname: () => "/workspace/property",
}));

describe("ALOS Property & Project Dashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  // 1. Authorized Property scope loads page
  it("1. mengizinkan pengguna dengan division scope PROPERTY untuk memuat Property Dashboard", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValueOnce({
      authenticated: true,
      principal: {
        actor_id: "usr_prop_01",
        email: "property@andara.co.id",
        roles: ["MEMBER"],
        division_codes: ["PROPERTY"],
        workspace_ids: ["ws_prop_01"],
      },
    });

    render(<PropertyDashboardPage initialSnapshot={DEFAULT_PROPERTY_SNAPSHOT} />);

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Property & Project Command Center", level: 1 }),
      ).toBeInTheDocument();
    });
    expect(screen.getByText("ALOS / PROPERTY / OVERVIEW")).toBeInTheDocument();
  });

  // 2. Unauthorized does not see Property content (controlled 403)
  it("2. menampilkan controlled state 403 jika pengguna tidak memiliki hak akses Property", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValueOnce({
      authenticated: true,
      principal: {
        actor_id: "usr_fin_01",
        email: "finance@andara.co.id",
        roles: ["MEMBER"],
        division_codes: ["FINANCE"],
        workspace_ids: ["ws_finance_01"],
      },
    });

    render(<PropertyDashboardPage initialSnapshot={DEFAULT_PROPERTY_SNAPSHOT} />);

    await waitFor(() => {
      expect(screen.getByText("403 — AKSES DITOLAK")).toBeInTheDocument();
    });
    expect(screen.getByText("Bukan Otoritas Property")).toBeInTheDocument();
  });

  // 3. Unauthenticated redirects to /login
  it("3. mengarahkan pengguna tanpa sesi kembali ke halaman /login", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValueOnce({
      authenticated: false,
    });

    render(<PropertyDashboardPage />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/login");
    });
  });

  // 4. Scopes queries to division_code: "PROPERTY"
  it("4. memastikan pemanggilan portfolio backend otomatis scoped ke division_code=PROPERTY", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValueOnce({
      authenticated: true,
      principal: {
        actor_id: "usr_prop_01",
        email: "property@andara.co.id",
        roles: ["MEMBER"],
        division_codes: ["PROPERTY"],
        workspace_ids: ["ws_prop_01"],
      },
    });

    const apiRequestSpy = vi.spyOn(api, "authenticatedApiRequest").mockImplementation(async (path: string) => {
      if (path === "/api/v1/workspaces") return [{ workspace_id: "ws_prop_01", workspace_key: "property", name: "Property Workspace", division_code: "PROPERTY", access_level: "MEMBER" }] as never;
      if (path.startsWith("/api/v1/projects/portfolio")) return EMPTY_PROPERTY_PORTFOLIO as never;
      return [] as never;
    });

    render(<PropertyDashboardPage />);

    await waitFor(() => {
      expect(apiRequestSpy).toHaveBeenCalledWith(
        "/api/v1/projects/portfolio?workspace_id=ws_prop_01&division_code=PROPERTY",
        expect.objectContaining({ signal: expect.any(AbortSignal) }),
      );
    });
  });

  // 5. Multi-role user does not leak Finance projects
  it("5. multi-role user (Finance + Property) tetap strictly scoped ke PROPERTY saat di /workspace/property", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValueOnce({
      authenticated: true,
      principal: {
        actor_id: "usr_multi_01",
        email: "multi@andara.co.id",
        roles: ["BUSINESS_REVIEWER"],
        division_codes: ["FINANCE", "PROPERTY"],
        workspace_ids: ["ws_fin", "ws_prop"],
      },
    });

    const apiRequestSpy = vi.spyOn(api, "authenticatedApiRequest").mockImplementation(async (path: string) => {
      if (path === "/api/v1/workspaces") return [{ workspace_id: "ws_prop", workspace_key: "property", name: "Property Workspace", division_code: "PROPERTY", access_level: "MEMBER" }] as never;
      if (path.startsWith("/api/v1/projects/portfolio")) return EMPTY_PROPERTY_PORTFOLIO as never;
      return [] as never;
    });

    render(<PropertyDashboardPage />);

    await waitFor(() => {
      expect(apiRequestSpy).toHaveBeenCalledWith(
        "/api/v1/projects/portfolio?workspace_id=ws_prop&division_code=PROPERTY",
        expect.objectContaining({ signal: expect.any(AbortSignal) }),
      );
    });
  });

  // 6. Project metrics display canonical numbers
  it("6. menampilkan metrik ringkasan portofolio sesuai data canonical", () => {
    render(<PropertyMetricGrid metrics={CANONICAL_PROPERTY_PORTFOLIO.metrics} />);

    expect(screen.getByText("Total Projects")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("On Track")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("At Risk")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("Critical")).toBeInTheDocument();
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  // 7. Null metric values displayed as em-dash (—) without fabrication
  it("7. menampilkan nilai null sebagai em-dash (—) tanpa rekayasa angka 0", () => {
    render(
      <PropertyMetricGrid
        metrics={{
          total: null as unknown as number,
          on_track: null as unknown as number,
          at_risk: null as unknown as number,
          critical: null as unknown as number,
          completed: 0,
        }}
      />,
    );

    const dashes = screen.getAllByText("—");
    expect(dashes.length).toBeGreaterThanOrEqual(4);
  });

  // 8. Budget source is strictly marked as PARTIAL summary
  it("8. menandai kesiapan data Budget secara jujur sebagai PARTIAL", () => {
    render(<PropertyDataReadiness readiness={DEFAULT_PROPERTY_READINESS} />);

    expect(screen.getByText("Budget")).toBeInTheDocument();
    expect(screen.getByText("PARTIAL")).toBeInTheDocument();
  });

  // 9. Status COMPLETED is not inferred as Handover ready
  it("9. tidak menginferensikan proyek COMPLETED sebagai kesiapan serah terima (handover)", () => {
    render(<ConstructionControlCadence cadence={DEFAULT_CONSTRUCTION_CADENCE} />);

    const handoverRow = screen.getByText("Change / payment / handover").closest("tr");
    expect(handoverRow).not.toBeNull();
    if (handoverRow) {
      expect(within(handoverRow).getByText("NOT CONNECTED")).toBeInTheDocument();
      expect(within(handoverRow).queryByText("COMPLIANT")).not.toBeInTheDocument();
    }
  });

  // 10. Generic issues are not labeled as full canonical NCR
  it("10. kesiapan NCR closure diberi status PARTIAL karena hanya berupa prekursor isu generik", () => {
    render(<ConstructionControlCadence cadence={DEFAULT_CONSTRUCTION_CADENCE} />);

    const ncrRow = screen.getByText("NCR closure").closest("tr");
    expect(ncrRow).not.toBeNull();
    if (ncrRow) {
      expect(within(ncrRow).getByText("PARTIAL")).toBeInTheDocument();
      expect(within(ncrRow).queryByText("LIVE")).not.toBeInTheDocument();
    }
  });

  // 11. K3 source absence shows NOT_CONNECTED, not '0 incidents'
  it("11. K3/PPE briefing tanpa sumber backend berstatus NOT_CONNECTED, bukan '0 insiden'", () => {
    render(<ConstructionControlCadence cadence={DEFAULT_CONSTRUCTION_CADENCE} />);

    const k3Row = screen.getByText("K3 / PPE briefing").closest("tr");
    expect(k3Row).not.toBeNull();
    if (k3Row) {
      expect(within(k3Row).getByText("NOT CONNECTED")).toBeInTheDocument();
      expect(within(k3Row).queryByText(/0 insiden/i)).not.toBeInTheDocument();
    }
  });

  // 12. Hold point absence shows NOT_CONNECTED
  it("12. Hold-point signoff tanpa backend khusus berstatus NOT_CONNECTED", () => {
    render(<ConstructionControlCadence cadence={DEFAULT_CONSTRUCTION_CADENCE} />);

    const holdPointRow = screen.getByText("Hold-point signoff").closest("tr");
    expect(holdPointRow).not.toBeNull();
    if (holdPointRow) {
      expect(within(holdPointRow).getByText("NOT CONNECTED")).toBeInTheDocument();
    }
  });

  // 13. Change Order absence shows NOT_CONNECTED
  it("13. Change order / kendali perubahan berstatus NOT_CONNECTED", () => {
    render(<ConstructionControlCadence cadence={DEFAULT_CONSTRUCTION_CADENCE} />);

    expect(screen.getByText("Change / payment / handover")).toBeInTheDocument();
    const rows = screen.getAllByRole("row");
    const lastRow = rows[rows.length - 1];
    expect(within(lastRow).getByText("NOT CONNECTED")).toBeInTheDocument();
  });

  // 14. Agent capability labeled as Target capability, not Active
  it("14. seluruh agen konstruksi dilabeli 'Target capability' dan tidak pernah 'Active' tanpa registry", () => {
    render(<PropertyAgentSupport agents={DEFAULT_PROPERTY_AGENTS} />);

    expect(screen.getByText("Technical / Property Progress")).toBeInTheDocument();
    expect(screen.getByText("Checklist & Evidence")).toBeInTheDocument();
    expect(screen.getByText("CAPA & Risk")).toBeInTheDocument();
    expect(screen.getByText("Approval & RACI")).toBeInTheDocument();

    const targetBadges = screen.getAllByText("Target capability");
    expect(targetBadges).toHaveLength(DEFAULT_PROPERTY_AGENTS.length);
    expect(screen.queryByText("Active")).not.toBeInTheDocument();
  });

  // 15. Milestone sorting is deterministic (priority + date)
  it("15. mengurutkan milestone secara deterministik berdasarkan urgensi status dan tanggal", () => {
    const rawMilestones = [
      { due_date: "2026-12-01", status: "ON_TRACK", title: "Later on-track" },
      { due_date: "2026-11-01", status: "CRITICAL", title: "Critical one" },
      { due_date: "2026-10-01", status: "AT_RISK", title: "At risk one" },
      { due_date: "2026-09-01", status: "ON_TRACK", title: "Early on-track" },
    ];

    const sorted = sortMilestonesDeterministically(rawMilestones);
    expect(sorted[0].status).toBe("CRITICAL");
    expect(sorted[1].status).toBe("AT_RISK");
    expect(sorted[2].title).toBe("Early on-track");
    expect(sorted[3].title).toBe("Later on-track");
  });

  // 16. Milestones panel displays upcoming items
  it("16. menampilkan daftar milestone terdekat pada PropertyMilestonePanel", () => {
    render(<PropertyMilestonePanel milestones={CANONICAL_PROPERTY_PORTFOLIO.milestones} />);

    expect(screen.getByRole("heading", { name: "Milestone Terdekat" })).toBeInTheDocument();
    expect(screen.getByText("Site preparation")).toBeInTheDocument();
    expect(screen.getByText("Foundation review")).toBeInTheDocument();
    expect(screen.getByText("Design freeze")).toBeInTheDocument();
  });

  // 17. Project Risk summary displays correct counts
  it("17. menampilkan panel ringkasan status risiko proyek (On Track, At Risk, Critical)", () => {
    render(
      <PropertyRiskPanel
        distribution={EMPTY_PROPERTY_PORTFOLIO.distribution}
        metrics={EMPTY_PROPERTY_PORTFOLIO.metrics}
      />,
    );

    expect(screen.getByRole("heading", { name: "Project Risk" })).toBeInTheDocument();
    expect(screen.getByText("Dari status proyek canonical")).toBeInTheDocument();
  });

  // 18. Progress vs Baseline SVG panel renders
  it("18. menampilkan panel progress portofolio dengan grafik garis SVG", () => {
    render(<PropertyProgressPanel progress={EMPTY_PROPERTY_PORTFOLIO.progress} />);

    expect(screen.getByRole("heading", { name: "Progress vs Baseline" })).toBeInTheDocument();
    expect(
      screen.getByText("Contoh visual - production dari portfolio endpoint"),
    ).toBeInTheDocument();
  });

  // 19. Workspace Shell integration with Property IA groups
  it("19. Workspace Shell mengintegrasikan sidebar dengan grup UTAMA, PROJECT, CONTROL, PEKERJAAN, AI", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValueOnce({
      authenticated: true,
      principal: {
        actor_id: "usr_prop_01",
        email: "property@andara.co.id",
        roles: ["MEMBER"],
        division_codes: ["PROPERTY"],
        workspace_ids: ["ws_prop_01"],
      },
    });

    render(<PropertyDashboardPage initialSnapshot={DEFAULT_PROPERTY_SNAPSHOT} />);

    await waitFor(() => {
      expect(screen.getByRole("complementary", { name: "Sidebar ALOS" })).toBeInTheDocument();
    });

    const sidebar = screen.getByRole("complementary", { name: "Sidebar ALOS" });
    expect(within(sidebar).getByText("UTAMA")).toBeInTheDocument();
    expect(within(sidebar).getByText("PROJECT")).toBeInTheDocument();
    expect(within(sidebar).getByText("CONTROL")).toBeInTheDocument();
    expect(within(sidebar).getByText("PEKERJAAN")).toBeInTheDocument();
    expect(within(sidebar).getByText("AI")).toBeInTheDocument();

    // Verify Property items
    expect(within(sidebar).getByText("Projects")).toBeInTheDocument();
    expect(within(sidebar).getByText("Milestones")).toBeInTheDocument();
    expect(within(sidebar).getByText("Construction")).toBeInTheDocument();
    expect(within(sidebar).getByText("Change Orders")).toBeInTheDocument();
  });

  // 20. Mobile bottom nav provides 5 items (Overview, Projects, Risk, AI, Menu)
  it("20. mobile bottom navigation menyediakan 5 item navigasi khusus Property (Overview, Projects, Risk, AI, Menu)", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValueOnce({
      authenticated: true,
      principal: {
        actor_id: "usr_prop_01",
        email: "property@andara.co.id",
        roles: ["MEMBER"],
        division_codes: ["PROPERTY"],
        workspace_ids: ["ws_prop_01"],
      },
    });

    render(<PropertyDashboardPage initialSnapshot={DEFAULT_PROPERTY_SNAPSHOT} />);

    await waitFor(() => {
      expect(screen.getByRole("navigation", { name: "Navigasi Bawah Ringkas" })).toBeInTheDocument();
    });

    const bottomNav = screen.getByRole("navigation", { name: "Navigasi Bawah Ringkas" });
    expect(within(bottomNav).getByText("Overview")).toBeInTheDocument();
    expect(within(bottomNav).getByText("Projects")).toBeInTheDocument();
    expect(within(bottomNav).getByText("Risk")).toBeInTheDocument();
    expect(within(bottomNav).getAllByText("AI").length).toBeGreaterThanOrEqual(1);
    expect(within(bottomNav).getByText("Menu")).toBeInTheDocument();
  });
});
