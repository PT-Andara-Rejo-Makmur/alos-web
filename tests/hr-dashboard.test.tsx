import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import * as api from "@/lib/api";
import {
  HrDashboardPage,
  HrDataReadiness,
  HrMetricGrid,
  AttendanceCapacityPanel,
  PerformanceTrainingPanel,
  GrievancePersonnelPanel,
  HrControlCadence,
  HrAgentSupport,
  createDefaultHrSnapshot,
  maskEmployeeIdentifier,
  DEFAULT_HR_READINESS,
  DEFAULT_HR_METRICS,
  DEFAULT_ATTENDANCE_CAPACITY,
  DEFAULT_DEVELOPMENT,
  DEFAULT_EMPLOYEE_RELATIONS,
  DEFAULT_HR_CADENCE,
  DEFAULT_HR_AGENTS,
} from "@/features/hr-dashboard";
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
  usePathname: () => "/workspace/hr",
}));

describe("ALOS HR / People Dashboard", () => {
  const defaultSnapshot = createDefaultHrSnapshot();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  // 1. Authorized HR scope loads page
  it("1. mengizinkan pengguna dengan division scope HR untuk memuat HR Dashboard", async () => {
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

    render(<HrDashboardPage initialSnapshot={defaultSnapshot} />);

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "HR & People Command Center", level: 1 }),
      ).toBeInTheDocument();
    });
    expect(screen.getByText("ALOS / HR & People / Overview")).toBeInTheDocument();
  });

  // 2. Authorized Director scope loads page
  it("2. mengizinkan Direktur (role DIRECTOR) untuk mengakses HR Dashboard", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValueOnce({
      authenticated: true,
      principal: {
        actor_id: "usr_dir_01",
        email: "director@andara.co.id",
        roles: ["DIRECTOR"],
        division_codes: [],
        workspace_ids: ["ws_hr_director"],
      },
    });

    render(<HrDashboardPage initialSnapshot={defaultSnapshot} />);

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "HR & People Command Center", level: 1 }),
      ).toBeInTheDocument();
    });
  });

  // 3. Unauthorized user fails closed (403)
  it("3. menampilkan controlled state 403 jika pengguna tidak memiliki scope HR atau Director", async () => {
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

    render(<HrDashboardPage initialSnapshot={defaultSnapshot} />);

    await waitFor(() => {
      expect(screen.getByText("403 — AKSES DITOLAK")).toBeInTheDocument();
    });
    expect(screen.getByText("Bukan Otoritas HR & People")).toBeInTheDocument();
  });

  // 4. Unauthenticated redirects to /login
  it("4. mengarahkan pengguna tanpa sesi (unauthenticated) ke halaman /login", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValueOnce({
      authenticated: false,
    });

    render(<HrDashboardPage />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/login");
    });
  });

  // 5. Missing source displays "—", not 0
  it("5. menampilkan em-dash '—' saat sumber data belum terhubung, bukan 0 palsu", () => {
    render(<HrMetricGrid metrics={DEFAULT_HR_METRICS} />);

    const employeesHeading = screen.getByText("Employees");
    const parentCard = employeesHeading.closest("article")!;
    expect(within(parentCard).getByText("—")).toBeInTheDocument();
    expect(within(parentCard).getByText("Employee master belum terhubung")).toBeInTheDocument();
    expect(within(parentCard).queryByText("0")).not.toBeInTheDocument();
  });

  // 6. Attendance source absent is NOT_CONNECTED
  it("6. sumber attendance yang belum terhubung berstatus NOT_CONNECTED", () => {
    render(<HrDataReadiness items={DEFAULT_HR_READINESS} />);
    const attendancePill = screen.getByText("Attendance");
    const parent = attendancePill.parentElement!;
    expect(within(parent).getByText("NOT CONNECTED")).toBeInTheDocument();
  });

  // 7. Contract source absent is NOT_CONNECTED
  it("7. sumber contracts yang belum terhubung berstatus NOT_CONNECTED", () => {
    render(<HrDataReadiness items={DEFAULT_HR_READINESS} />);
    const contractsPill = screen.getByText("Contracts");
    const parent = contractsPill.parentElement!;
    expect(within(parent).getByText("NOT CONNECTED")).toBeInTheDocument();
  });

  // 8. Performance source absent is NOT_CONNECTED
  it("8. sumber performance yang belum terhubung berstatus NOT_CONNECTED", () => {
    render(<HrDataReadiness items={DEFAULT_HR_READINESS} />);
    const performancePill = screen.getByText("Performance");
    const parent = performancePill.parentElement!;
    expect(within(parent).getByText("NOT CONNECTED")).toBeInTheDocument();
  });

  // 9. Grievance overview does not display complaint texts
  it("9. ringkasan Grievance & Personnel tidak menampilkan isi teks pengaduan karyawan", () => {
    render(<GrievancePersonnelPanel items={DEFAULT_EMPLOYEE_RELATIONS} />);
    expect(screen.getByText("Grievance & Personnel")).toBeInTheDocument();
    expect(screen.getByText("Grievances")).toBeInTheDocument();
    expect(screen.getByText("Expiring files")).toBeInTheDocument();
    expect(screen.getByText("Access requests")).toBeInTheDocument();
    expect(screen.getByText("Confidential HR data remains scoped.")).toBeInTheDocument();

    // No sensitive grievance text or complaint details
    expect(screen.queryByText(/pelecehan/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/gaji/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/sengketa/i)).not.toBeInTheDocument();
  });

  // 10. HR Control Cadence displays task codes
  it("10. tabel HR Control Cadence menampilkan kode kontrol HR-D-01, HR-D-02, HR-W, HR-M", () => {
    render(<HrControlCadence items={DEFAULT_HR_CADENCE} />);

    expect(screen.getByText("HR-D-01")).toBeInTheDocument();
    expect(screen.getByText("HR-D-02")).toBeInTheDocument();
    expect(screen.getByText("HR-W-01")).toBeInTheDocument();
    expect(screen.getByText("HR-W-02")).toBeInTheDocument();
    expect(screen.getByText("HR-M-01")).toBeInTheDocument();
    expect(screen.getByText("HR-M-02/03")).toBeInTheDocument();
  });

  // 11. HR-D-02 (Penutupan tugas) is PARTIAL because task tracking is active
  it("11. kontrol HR-D-02 (Penutupan tugas) berstatus PARTIAL karena modul tugas aktif di ALOS", () => {
    render(<HrControlCadence items={DEFAULT_HR_CADENCE} />);
    const partialBadges = screen.getAllByText("PARTIAL");
    expect(partialBadges.length).toBeGreaterThanOrEqual(1);
  });

  // 12. Agent target capability is not "Active" without registry
  it("12. seluruh agen AI berstatus 'Target capability' dan tidak dilabeli 'Active'", () => {
    render(<HrAgentSupport agents={DEFAULT_HR_AGENTS} />);

    expect(screen.getByText("People Intelligence")).toBeInTheDocument();
    expect(screen.getByText("ALOS-AGT-013")).toBeInTheDocument();
    expect(screen.getByText("Recruitment & Attendance")).toBeInTheDocument();
    expect(screen.getByText("ALOS-AGT-014")).toBeInTheDocument();
    expect(screen.getByText("Personnel File")).toBeInTheDocument();
    expect(screen.getByText("ALOS-AGT-005")).toBeInTheDocument();
    expect(screen.getByText("KPI & Performance")).toBeInTheDocument();
    expect(screen.getByText("GN-01.1")).toBeInTheDocument();
    expect(screen.getByText("Capacity / Span of Control")).toBeInTheDocument();

    const badges = screen.getAllByText("Target capability");
    expect(badges.length).toBe(4);
    expect(screen.queryByText("Active")).not.toBeInTheDocument();
  });

  // 13. Human decision first: no autonomous hiring/rejection buttons or actions
  it("13. tidak terdapat tombol atau aksi perekrutan/penolakan otonom oleh AI pada antarmuka", () => {
    render(<HrAgentSupport agents={DEFAULT_HR_AGENTS} />);
    expect(screen.queryByRole("button", { name: /auto-hire/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /auto-reject/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /pecat/i })).not.toBeInTheDocument();
  });

  // 14. Attendance & Capacity renders skeleton bars and em-dashes
  it("14. panel Attendance & Capacity menampilkan skeleton bar netral dan nilai em-dash", () => {
    render(<AttendanceCapacityPanel items={DEFAULT_ATTENDANCE_CAPACITY} />);
    expect(screen.getByText("Attendance & Capacity")).toBeInTheDocument();
    expect(screen.getByText("Present")).toBeInTheDocument();
    expect(screen.getByText("Leave")).toBeInTheDocument();
    expect(screen.getByText("Missing attendance")).toBeInTheDocument();
    expect(screen.getByText("Critical role backup")).toBeInTheDocument();

    const dashes = screen.getAllByText("—");
    expect(dashes.length).toBe(4);
  });

  // 15. Performance & Training panel renders development items with em-dashes
  it("15. panel Performance & Training menampilkan metrik pengembangan dengan em-dash", () => {
    render(<PerformanceTrainingPanel items={DEFAULT_DEVELOPMENT} />);
    expect(screen.getByText("Performance & Training")).toBeInTheDocument();
    expect(screen.getByText("Performance reviews")).toBeInTheDocument();
    expect(screen.getByText("Training participation")).toBeInTheDocument();
    expect(screen.getByText("Role-play participation")).toBeInTheDocument();
    expect(screen.getByText("Improvement actions")).toBeInTheDocument();

    const dashes = screen.getAllByText("—");
    expect(dashes.length).toBe(4);
  });

  // 16. ARA link is canonical (/ara)
  it("16. tombol CTA People Intelligence mengarah ke rute kanonikal ARA (/ara)", () => {
    render(<HrAgentSupport agents={DEFAULT_HR_AGENTS} />);

    const araLink = screen.getByRole("link", { name: /Tanyakan ARA tentang People/i });
    expect(araLink).toBeInTheDocument();
    expect(araLink).toHaveAttribute("href", "/ara");
  });

  // 17. Workspace Shell IA projection for HR
  it("17. proyeksi navigasi HR mencakup grup UTAMA, PEOPLE, DEVELOPMENT, EMPLOYEE_RELATIONS, PEKERJAAN, AI", () => {
    const nav = projectWorkspaceNavigation(
      {
        workspaceId: "ws_hr_01",
        workspaceKey: "hr",
        workspaceLabel: "HR Workspace",
        roleLabel: "HR Manager",
        divisionCode: "HR",
      },
      {
        user_id: "usr_01",
        organization_id: "org_01",
        roles: ["MEMBER"],
        division_codes: ["HR"],
        workspace_ids: ["ws_hr_01"],
        issued_at: "",
        expires_at: "",
      },
    );

    const groups = new Set(nav.map((item) => item.group));
    expect(groups.has("UTAMA")).toBe(true);
    expect(groups.has("PEOPLE")).toBe(true);
    expect(groups.has("DEVELOPMENT")).toBe(true);
    expect(groups.has("EMPLOYEE_RELATIONS")).toBe(true);
    expect(groups.has("PEKERJAAN")).toBe(true);
    expect(groups.has("AI")).toBe(true);

    const overviewItem = nav.find((i) => i.key === "overview");
    expect(overviewItem?.href).toBe("/workspace/hr");
  });

  // 18. Multi-role context isolation: HR workspace does not show Finance items
  it("18. pengguna multi-role dalam workspace HR tidak tercampur menu Keuangan", () => {
    const nav = projectWorkspaceNavigation(
      {
        workspaceId: "ws_hr_01",
        workspaceKey: "hr",
        workspaceLabel: "HR Workspace",
        roleLabel: "HR Manager",
        divisionCode: "HR",
      },
      {
        user_id: "usr_multi_01",
        organization_id: "org_01",
        roles: ["MEMBER"],
        division_codes: ["HR", "FINANCE"],
        workspace_ids: ["ws_hr_01", "ws_fin_01"],
        issued_at: "",
        expires_at: "",
      },
    );

    const keys = nav.map((item) => item.key);
    expect(keys).toContain("employees");
    expect(keys).toContain("attendance");
    expect(keys).toContain("training");
    expect(keys).toContain("contracts");
    expect(keys).not.toContain("cash");
    expect(keys).not.toContain("receivables");
    expect(keys).not.toContain("payables");
  });

  // 19. Privacy & Consent: masking helper functions
  it("19. fungsi maskEmployeeIdentifier menyamarkan PII sesuai kepatuhan UU PDP", () => {
    expect(maskEmployeeIdentifier("3374012345678901")).toBe("337****901");
    expect(maskEmployeeIdentifier("employee@andara.co.id")).toBe("em***@andara.co.id");
    expect(maskEmployeeIdentifier("")).toBe("—");
  });

  // 20. No employee PII stored in localStorage
  it("20. tidak menyimpan data personalia atau PII pegawai di localStorage", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValueOnce({
      authenticated: true,
      principal: {
        actor_id: "usr_hr_01",
        roles: ["MEMBER"],
        division_codes: ["HR"],
        workspace_ids: ["ws_hr_01"],
        email: "hr@andara.co.id",
      },
    });

    render(<HrDashboardPage initialSnapshot={defaultSnapshot} />);

    await waitFor(() => {
      expect(screen.getByText("HR & People Command Center")).toBeInTheDocument();
    });

    expect(localStorage.getItem("employee_data")).toBeNull();
    expect(localStorage.getItem("personnel_files")).toBeNull();
    expect(localStorage.getItem("attendance")).toBeNull();
  });
});
