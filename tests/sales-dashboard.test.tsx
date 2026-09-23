import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import * as api from "@/lib/api";
import {
  SalesDashboardPage,
  SalesDataReadiness,
  SalesMetricGrid,
  SalesFunnelPanel,
  SalesResponseFollowupPanel,
  SalesChannelAttributionPanel,
  SalesControlCadence,
  SalesAgentSupport,
  createDefaultSalesSnapshot,
  maskCustomerIdentifier,
  DEFAULT_SALES_READINESS,
  DEFAULT_SALES_METRICS,
  DEFAULT_SALES_FUNNEL,
  DEFAULT_DAILY_CONTROL,
  DEFAULT_CHANNEL_ATTRIBUTION,
  DEFAULT_SALES_CADENCE,
  DEFAULT_SALES_AGENTS,
} from "@/features/sales-dashboard";
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
  usePathname: () => "/workspace/sales",
}));

describe("ALOS Sales & Marketing Dashboard", () => {
  const defaultSnapshot = createDefaultSalesSnapshot();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  // 1. Authorized Sales scope loads page
  it("1. mengizinkan pengguna dengan division scope SALES untuk memuat Sales Dashboard", async () => {
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

    render(<SalesDashboardPage initialSnapshot={defaultSnapshot} />);

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Sales & Marketing Command Center", level: 1 }),
      ).toBeInTheDocument();
    });
    expect(screen.getByText("PT Andara Rejo Makmur / Sales & Marketing")).toBeInTheDocument();
  });

  // 2. Authorized Director scope loads page
  it("2. mengizinkan Direktur (role DIRECTOR) untuk mengakses Sales Dashboard", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValueOnce({
      authenticated: true,
      principal: {
        actor_id: "usr_dir_01",
        email: "director@andara.co.id",
        roles: ["DIRECTOR"],
        division_codes: [],
        workspace_ids: ["ws_sales_director"],
      },
    });

    render(<SalesDashboardPage initialSnapshot={defaultSnapshot} />);

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Sales & Marketing Command Center", level: 1 }),
      ).toBeInTheDocument();
    });
  });

  // 3. Unauthorized user fails closed (403)
  it("3. menampilkan controlled state 403 jika pengguna tidak memiliki scope Sales atau Director", async () => {
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

    render(<SalesDashboardPage initialSnapshot={defaultSnapshot} />);

    await waitFor(() => {
      expect(screen.getByText("403 — AKSES DITOLAK")).toBeInTheDocument();
    });
    expect(screen.getByText("Bukan Otoritas Sales & Marketing")).toBeInTheDocument();
  });

  // 4. Unauthenticated redirects to /login
  it("4. mengarahkan pengguna tanpa sesi (unauthenticated) ke halaman /login", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValueOnce({
      authenticated: false,
    });

    render(<SalesDashboardPage />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/login");
    });
  });

  // 5. Missing lead source displays "—", not 0
  it("5. menampilkan em-dash '—' saat sumber lead belum terhubung, bukan 0 palsu", () => {
    render(<SalesMetricGrid metrics={DEFAULT_SALES_METRICS} />);

    const validLeadsHeading = screen.getByText("Valid Leads (Bulan ini)");
    const parentCard = validLeadsHeading.closest("article")!;
    expect(within(parentCard).getByText("—")).toBeInTheDocument();
    expect(within(parentCard).getByText("Sumber data CRM belum terhubung")).toBeInTheDocument();
    expect(within(parentCard).queryByText("0")).not.toBeInTheDocument();
  });

  // 6. Missing complaint source does NOT display "0 complaints"
  it("6. tidak menampilkan '0 komplain' palsu saat sumber register komplain belum terhubung", () => {
    render(<SalesMetricGrid metrics={DEFAULT_SALES_METRICS} />);
    expect(screen.queryByText(/0 komplain/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/0 complaints/i)).not.toBeInTheDocument();
  });

  // 7. No hard-coded lead count/conversion across all KPI metrics
  it("7. tidak menggunakan angka rekayasa atau konversi palsu pada seluruh 4 kartu metrik", () => {
    render(<SalesMetricGrid metrics={DEFAULT_SALES_METRICS} />);
    const values = screen.getAllByText("—");
    expect(values.length).toBeGreaterThanOrEqual(4);
  });

  // 8. No hard-coded project name; displays "Project Context: Belum tersedia"
  it("8. tidak melakukan hardcoding nama proyek; menampilkan 'Project Context: Belum tersedia'", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValueOnce({
      authenticated: true,
      principal: {
        actor_id: "usr_sales_01",
        roles: ["MEMBER"],
        division_codes: ["SALES"],
        workspace_ids: ["ws_sales_01"],
        email: "sales@andara.co.id",
      },
    });

    render(<SalesDashboardPage initialSnapshot={defaultSnapshot} />);

    await waitFor(() => {
      expect(screen.getByText("Project Context: Belum tersedia")).toBeInTheDocument();
    });
  });

  // 9. Lead-to-Cash funnel renders 5 skeleton stages with "—" and retains WF-03 handoff
  it("9. Funnel Lead-to-Cash menampilkan 5 tahap skeleton dengan em-dash dan penjelasan handoff Finance/Legal", () => {
    render(<SalesFunnelPanel stages={DEFAULT_SALES_FUNNEL} />);

    expect(screen.getByText("Lead-to-Cash Sales Funnel")).toBeInTheDocument();
    expect(screen.getByText("Lead Masuk")).toBeInTheDocument();
    expect(screen.getByText("Terkualifikasi")).toBeInTheDocument();
    expect(screen.getByText("Site Visit")).toBeInTheDocument();
    expect(screen.getByText("Reservasi / Booking")).toBeInTheDocument();
    expect(screen.getByText("Akad & Closing")).toBeInTheDocument();

    const dashes = screen.getAllByText("—");
    expect(dashes.length).toBe(5);

    expect(
      screen.getByText(/Tahap booking diverifikasi bersama tim Finance & Legal sebelum akad/i),
    ).toBeInTheDocument();
  });

  // 10. Booking is not considered closing/akad/handover (separate stages in funnel)
  it("10. membedakan tahap Reservasi / Booking dengan Akad & Closing (bukan auto-closing)", () => {
    const bookingStage = DEFAULT_SALES_FUNNEL.find((s) => s.stage === "booking");
    const closingStage = DEFAULT_SALES_FUNNEL.find((s) => s.stage === "closing");

    expect(bookingStage).toBeDefined();
    expect(closingStage).toBeDefined();
    expect(bookingStage?.label).toBe("Reservasi / Booking");
    expect(closingStage?.label).toBe("Akad & Closing");
  });

  // 11. Daily Control Response & Follow-up displays "—" and WA API note
  it("11. Respons & Follow-up Harian menampilkan em-dash dan catatan integrasi WhatsApp Business API", () => {
    render(<SalesResponseFollowupPanel items={DEFAULT_DAILY_CONTROL} />);

    expect(screen.getByText("Respons & Follow-up Harian")).toBeInTheDocument();
    expect(screen.getByText("Prospek Baru Hari Ini")).toBeInTheDocument();
    expect(screen.getByText("Respon Cepat (<15m)")).toBeInTheDocument();
    expect(screen.getByText("Follow-up Terjadwal")).toBeInTheDocument();
    expect(screen.getByText("Stale Leads (>48j)")).toBeInTheDocument();

    expect(
      screen.getByText(/Membutuhkan integrasi WhatsApp Business API/i),
    ).toBeInTheDocument();
  });

  // 12. Marketing channel attribution displays skeleton bars and attribution engine note
  it("12. Atribusi kanal pemasaran menampilkan skeleton bars dan catatan agen ALOS-AGT-005", () => {
    render(<SalesChannelAttributionPanel channels={DEFAULT_CHANNEL_ATTRIBUTION} />);

    expect(screen.getByText("Kanal Pemasaran Terbanyak")).toBeInTheDocument();
    expect(screen.getByText("Paid Ads (Meta / Google)")).toBeInTheDocument();
    expect(screen.getByText("Walk-in & Spanduk")).toBeInTheDocument();
    expect(screen.getByText("Referral & Broker Agent")).toBeInTheDocument();
    expect(screen.getByText("Organic & Website")).toBeInTheDocument();

    expect(
      screen.getByText(/Engine atribusi \(ALOS-AGT-005\) belum terhubung/i),
    ).toBeInTheDocument();
  });

  // 13. Agent target capability is not "Active" without registry
  it("13. seluruh agen AI berstatus 'Target capability' dan tidak dilabeli 'Active'", () => {
    render(<SalesAgentSupport agents={DEFAULT_SALES_AGENTS} />);

    expect(screen.getByText("Sales & Marketing Intelligence")).toBeInTheDocument();
    expect(screen.getByText("ALOS-AGT-007")).toBeInTheDocument();
    expect(screen.getByText("Sales Lead Engine")).toBeInTheDocument();
    expect(screen.getByText("ALOS-AGT-008")).toBeInTheDocument();
    expect(screen.getByText("Marketing Content Engine")).toBeInTheDocument();
    expect(screen.getByText("ALOS-AGT-009")).toBeInTheDocument();
    expect(screen.getByText("CRM & Follow-up Orchestrator")).toBeInTheDocument();
    expect(screen.getByText("ALOS-AGT-005")).toBeInTheDocument();
    expect(screen.getByText("KPI & Attribution Monitor")).toBeInTheDocument();

    const badges = screen.getAllByText("Target capability");
    expect(badges.length).toBe(4);
    expect(screen.queryByText("Active")).not.toBeInTheDocument();
  });

  // 14. ARA link is canonical (/ara)
  it("14. tombol CTA Sales Intelligence mengarah ke rute kanonikal ARA (/ara)", () => {
    render(<SalesAgentSupport agents={DEFAULT_SALES_AGENTS} />);

    const araLink = screen.getByRole("link", { name: /Tanyakan ARA tentang Sales/i });
    expect(araLink).toBeInTheDocument();
    expect(araLink).toHaveAttribute("href", "/ara");
  });

  // 15. Data readiness panel displays 5 items all NOT CONNECTED
  it("15. panel Sales Data Readiness menampilkan 5 sumber data berstatus NOT CONNECTED", () => {
    render(<SalesDataReadiness items={DEFAULT_SALES_READINESS} />);

    expect(screen.getByText("Leads Source")).toBeInTheDocument();
    expect(screen.getByText("CRM Pipeline")).toBeInTheDocument();
    expect(screen.getByText("WhatsApp Business")).toBeInTheDocument();
    expect(screen.getByText("Booking Register")).toBeInTheDocument();
    expect(screen.getByText("Attribution Engine")).toBeInTheDocument();

    const notConnectedBadges = screen.getAllByText("NOT CONNECTED");
    expect(notConnectedBadges.length).toBe(5);
  });

  // 16. Control Cadence displays 6 operational controls
  it("16. tabel Sales Control Cadence menampilkan 6 baris kontrol harian, mingguan, bulanan", () => {
    render(<SalesControlCadence items={DEFAULT_SALES_CADENCE} />);

    expect(screen.getByText("SM-D-01")).toBeInTheDocument();
    expect(screen.getByText("SM-D-02")).toBeInTheDocument();
    expect(screen.getByText("SM-D-03")).toBeInTheDocument();
    expect(screen.getByText("SM-W-01")).toBeInTheDocument();
    expect(screen.getByText("SM-W-02")).toBeInTheDocument();
    expect(screen.getByText("SM-M-01")).toBeInTheDocument();

    const unconnecteds = screen.getAllByText("NOT CONNECTED");
    expect(unconnecteds.length).toBe(6);
  });

  // 17. Workspace Shell IA projection for Sales
  it("17. proyeksi navigasi Sales mencakup grup UTAMA, SALES, MARKETING, CUSTOMER, PEKERJAAN, AI", () => {
    const nav = projectWorkspaceNavigation(
      {
        workspaceId: "ws_sales_01",
        workspaceKey: "sales",
        workspaceLabel: "Sales Workspace",
        roleLabel: "Sales Lead",
        divisionCode: "SALES",
      },
      {
        user_id: "usr_01",
        organization_id: "org_01",
        roles: ["MEMBER"],
        division_codes: ["SALES"],
        workspace_ids: ["ws_sales_01"],
        issued_at: "",
        expires_at: "",
      },
    );

    const groups = new Set(nav.map((item) => item.group));
    expect(groups.has("UTAMA")).toBe(true);
    expect(groups.has("SALES")).toBe(true);
    expect(groups.has("MARKETING")).toBe(true);
    expect(groups.has("CUSTOMER")).toBe(true);
    expect(groups.has("PEKERJAAN")).toBe(true);
    expect(groups.has("AI")).toBe(true);

    const overviewItem = nav.find((i) => i.key === "overview");
    expect(overviewItem?.href).toBe("/workspace/sales");
  });

  // 18. Multi-role context isolation: Sales workspace does not show Finance items
  it("18. pengguna multi-role dalam workspace Sales tidak tercampur menu Keuangan", () => {
    const nav = projectWorkspaceNavigation(
      {
        workspaceId: "ws_sales_01",
        workspaceKey: "sales",
        workspaceLabel: "Sales Workspace",
        roleLabel: "Sales Lead",
        divisionCode: "SALES",
      },
      {
        user_id: "usr_multi_01",
        organization_id: "org_01",
        roles: ["MEMBER"],
        division_codes: ["SALES", "FINANCE"],
        workspace_ids: ["ws_sales_01", "ws_fin_01"],
        issued_at: "",
        expires_at: "",
      },
    );

    const keys = nav.map((item) => item.key);
    expect(keys).toContain("leads");
    expect(keys).toContain("pipeline");
    expect(keys).toContain("campaigns");
    expect(keys).toContain("follow-up");
    expect(keys).not.toContain("receivables");
    expect(keys).not.toContain("payables");
  });

  // 19. Privacy & Consent: masking helper functions
  it("19. fungsi maskCustomerIdentifier menyamarkan PII sesuai kepatuhan UU PDP", () => {
    expect(maskCustomerIdentifier("081234567890")).toBe("081****890");
    expect(maskCustomerIdentifier("customer@example.com")).toBe("cu***@example.com");
    expect(maskCustomerIdentifier("")).toBe("—");
  });

  // 20. No customer data stored in localStorage
  it("20. tidak menyimpan data pelanggan atau prospek di localStorage", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValueOnce({
      authenticated: true,
      principal: {
        actor_id: "usr_sales_01",
        roles: ["MEMBER"],
        division_codes: ["SALES"],
        workspace_ids: ["ws_sales_01"],
        email: "sales@andara.co.id",
      },
    });

    render(<SalesDashboardPage initialSnapshot={defaultSnapshot} />);

    await waitFor(() => {
      expect(screen.getByText("Sales & Marketing Command Center")).toBeInTheDocument();
    });

    expect(localStorage.getItem("customer_data")).toBeNull();
    expect(localStorage.getItem("leads")).toBeNull();
  });
});
