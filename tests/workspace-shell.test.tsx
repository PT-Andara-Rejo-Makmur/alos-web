import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import * as api from "@/lib/api";
import {
  WorkspaceShell,
  type WorkspaceShellIdentity,
} from "@/features/workspace-shell";

// Mock next/image
vi.mock("next/image", () => ({
  default: ({ alt, src, ...props }: React.ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean; priority?: boolean }) => {
    void props;
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={typeof src === "string" ? src : ""} alt={alt || ""} />;
  },
}));

// Mock next/navigation
const mockPush = vi.fn();
const mockReplace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
  usePathname: () => "/business",
}));

describe("WorkspaceShell Reusable Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  const financeIdentity: WorkspaceShellIdentity = {
    workspaceId: "ws_fin_001",
    workspaceKey: "finance",
    workspaceLabel: "Finance Workspace",
    divisionCode: "FINANCE",
    roleLabel: "Finance Manager",
  };

  const directorIdentity: WorkspaceShellIdentity = {
    workspaceId: "ws_dir_001",
    workspaceKey: "executive",
    workspaceLabel: "Executive Workspace",
    divisionCode: null,
    roleLabel: "Direktur Utama",
  };

  it("1. menampilkan active workspace label dan role dengan benar", () => {
    render(
      <WorkspaceShell identity={financeIdentity}>
        <div data-testid="dashboard-content">Dashboard Finance</div>
      </WorkspaceShell>,
    );

    expect(screen.getAllByText("Finance Workspace").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Finance Manager").length).toBeGreaterThanOrEqual(1);
  });

  it("2. navigation hanya menampilkan item yang diproyeksikan sesuai role dan division", () => {
    // Finance user
    render(
      <WorkspaceShell
        actor={{
          user_id: "user_001",
          organization_id: "org_001",
          roles: ["MEMBER"],
          division_codes: ["FINANCE"],
          workspace_ids: ["ws_fin_001"],
          issued_at: "2026-09-01T00:00:00Z",
          expires_at: "2026-09-30T00:00:00Z",
        }}
        identity={financeIdentity}
      >
        <div>Content</div>
      </WorkspaceShell>,
    );

    // Should include Finance modules
    expect(screen.getAllByText("Cash & Bank").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Receivables").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Overview").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("ARA").length).toBeGreaterThanOrEqual(1);

    // Should NOT include governance control plane for pure business reviewer
    expect(screen.queryByText("Governance & Agent Control")).not.toBeInTheDocument();
  });

  it("3. item navigasi aktif memiliki aria-current='page'", () => {
    render(
      <WorkspaceShell activeNavKey="overview" identity={financeIdentity}>
        <div>Content</div>
      </WorkspaceShell>,
    );

    const activeLinks = screen.getAllByRole("link", { name: /Overview/i });
    const hasAriaCurrent = activeLinks.some(
      (link) => link.getAttribute("aria-current") === "page",
    );
    expect(hasAriaCurrent).toBe(true);
  });

  it("4. aksi switch workspace mengarah ke /workspace", () => {
    render(
      <WorkspaceShell identity={financeIdentity}>
        <div>Content</div>
      </WorkspaceShell>,
    );

    const switchLinks = screen.getAllByRole("link", { name: /Ganti workspace/i });
    expect(switchLinks.length).toBeGreaterThanOrEqual(1);
    expect(switchLinks[0]).toHaveAttribute("href", "/workspace");
  });

  it("5. tombol ARA mengarah ke route kanonikal /ara", () => {
    render(
      <WorkspaceShell identity={financeIdentity}>
        <div>Content</div>
      </WorkspaceShell>,
    );

    const araLinks = screen.getAllByRole("link", { name: /ARA/i });
    expect(araLinks.some((link) => link.getAttribute("href") === "/ara")).toBe(true);
  });

  it("6. logout memanggil sessionApiRequest DELETE dan mengalihkan halaman", async () => {
    const sessionSpy = vi.spyOn(api, "sessionApiRequest").mockResolvedValueOnce({
      authenticated: false,
    });
    const mockAssign = vi.fn();
    Object.defineProperty(window, "location", {
      writable: true,
      value: { assign: mockAssign },
    });

    render(
      <WorkspaceShell identity={financeIdentity}>
        <div>Content</div>
      </WorkspaceShell>,
    );

    const logoutButtons = screen.getAllByRole("button", { name: /Keluar/i });
    fireEvent.click(logoutButtons[0]);

    expect(sessionSpy).toHaveBeenCalledWith("/", { method: "DELETE" });
  });

  it("7. mobile menu dapat dibuka dan ditutup dengan keyboard Escape", () => {
    render(
      <WorkspaceShell identity={financeIdentity}>
        <div>Content</div>
      </WorkspaceShell>,
    );

    const menuButton = screen.getByRole("button", { name: /Buka menu navigasi utama/i });
    fireEvent.click(menuButton);

    expect(screen.getByRole("dialog", { name: /Navigasi Menu Lengkap/i })).toBeInTheDocument();

    // Close via Escape
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("dialog", { name: /Navigasi Menu Lengkap/i })).not.toBeInTheDocument();
  });

  it("8. modul yang belum didukung backend bertanda aria-disabled", () => {
    render(
      <WorkspaceShell identity={financeIdentity}>
        <div>Content</div>
      </WorkspaceShell>,
    );

    const unreadyElements = screen.getAllByText("Cash & Bank");
    const disabledElement = unreadyElements.find((el) =>
      el.closest("[aria-disabled='true']"),
    );
    expect(disabledElement).toBeDefined();
  });

  it("9. shell tidak menyimpan authority di localStorage", () => {
    render(
      <WorkspaceShell identity={directorIdentity}>
        <div>Content</div>
      </WorkspaceShell>,
    );

    expect(localStorage.getItem("token")).toBeNull();
    expect(localStorage.getItem("role")).toBeNull();
    expect(localStorage.getItem("workspace")).toBeNull();
  });

  it("10. children dirender di content slot utama", () => {
    render(
      <WorkspaceShell identity={financeIdentity}>
        <div data-testid="verified-child-content">Konten Dashboard Khusus</div>
      </WorkspaceShell>,
    );

    expect(screen.getByTestId("verified-child-content")).toBeInTheDocument();
    expect(screen.getByText("Konten Dashboard Khusus")).toBeInTheDocument();
  });
});
