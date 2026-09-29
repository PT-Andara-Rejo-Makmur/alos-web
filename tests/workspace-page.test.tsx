import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import WorkspacePage from "@/app/workspace/page";
import { AppShell } from "@/components/app-shell/app-shell";
import type { AuthenticatedPrincipalProjection } from "@/lib/contracts";
import { ApiError } from "@/lib/api";
import * as api from "@/lib/api";

const mockPush = vi.fn();
const mockReplace = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => "/workspace",
  useRouter: () => ({
    push: mockPush,
    refresh: vi.fn(),
    replace: mockReplace,
  }),
}));

function makePrincipal(
  overrides: Partial<AuthenticatedPrincipalProjection> = {},
): AuthenticatedPrincipalProjection {
  return {
    actor: {
      actor_id: "actor_1",
      active: true,
      display_name: "Rani Andara",
      organization_id: "org_1",
      tenant_id: "tenant_1",
    },
    active_workspace: null,
    email: "rani@andara.co.id",
    expires_at: "2026-10-01T00:00:00Z",
    issued_at: "2026-09-27T00:00:00Z",
    workspace_access: [],
    ...overrides,
  };
}

function authenticatedSession(principal = makePrincipal()) {
  return { authenticated: true, principal };
}

describe("WorkspacePage and ALOS App Shell", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.sessionStorage.clear();
    window.history.replaceState({}, "", "/workspace");
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("menampilkan App Shell, identitas session, dan landing ruang kerja", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValueOnce(authenticatedSession());

    render(<WorkspacePage />);

    await waitFor(() => {
      expect(screen.getByRole("complementary", { name: "Navigasi utama" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "ALOS", level: 1 })).toBeInTheDocument();
    });

    expect(screen.getByRole("link", { name: "Beranda" })).toHaveAttribute("aria-current", "page");
    expect(screen.getAllByText("Rani Andara").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Ruang kerja belum dipilih")).toBeInTheDocument();
    expect(screen.queryByText(/KPI|Executive|Sales|Finance|Property Dashboard|GENESIS/)).not.toBeInTheDocument();
  });

  it("dapat mengubah sidebar desktop dari expanded ke collapsed", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValueOnce(authenticatedSession());

    render(<WorkspacePage />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Tutup sidebar" })).toBeInTheDocument();
    });

    const sidebar = screen.getByRole("complementary", { name: "Navigasi utama" });
    const topbar = screen.getAllByRole("banner")[0];
    expect(sidebar).toContainElement(screen.getByRole("button", { name: "Tutup sidebar" }));
    expect(topbar).not.toContainElement(screen.getByRole("button", { name: "Tutup sidebar" }));

    fireEvent.click(screen.getByRole("button", { name: "Tutup sidebar" }));
    expect(screen.getByRole("button", { name: "Buka sidebar" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Beranda" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Keluar" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Buka sidebar" }));
    expect(screen.getByRole("button", { name: "Tutup sidebar" })).toBeInTheDocument();
  });

  it("memulihkan posisi scroll navigasi setelah App Shell dimuat kembali", async () => {
    const session = authenticatedSession();
    vi.spyOn(api, "sessionApiRequest").mockResolvedValue(session);

    const firstRender = render(<WorkspacePage />);
    const firstNavigation = await screen.findByRole("navigation", { name: "Menu aplikasi" });
    Object.defineProperty(firstNavigation, "scrollTop", { configurable: true, value: 184, writable: true });
    fireEvent.scroll(firstNavigation);
    firstRender.unmount();

    render(<WorkspacePage />);
    const restoredNavigation = await screen.findByRole("navigation", { name: "Menu aplikasi" });
    await waitFor(() => expect(restoredNavigation.scrollTop).toBe(184));
  });

  it("menampilkan status netral ketika Backend belum memilih workspace", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValueOnce(
      authenticatedSession(),
    );

    render(<WorkspacePage />);

    await waitFor(() => {
      expect(screen.getByText("Ruang kerja belum dipilih")).toBeInTheDocument();
    });
  });

  it("menampilkan workspace yang tersedia dan lekatkan pilihan ke endpoint Backend", async () => {
    const property = {
      active: true,
      data_scope: "WORKSPACE" as const,
      permission_refs: [],
      role_refs: ["WORKSPACE_MEMBER" as const],
      scope_refs: ["workspace_property"],
      workspace: {
        active: true,
        division_code: "PROPERTY",
        organization_id: "org_1",
        workspace_id: "workspace_property",
        workspace_key: "property",
        workspace_name: "Property",
        workspace_type: "BUSINESS" as const,
      },
    };
    const finance = {
      ...property,
      scope_refs: ["workspace_finance"],
      workspace: {
        ...property.workspace,
        workspace_id: "workspace_finance",
        workspace_key: "finance & ops",
        workspace_name: "Finance",
        division_code: "FINANCE",
      },
    };
    vi.spyOn(api, "sessionApiRequest").mockResolvedValueOnce(
      authenticatedSession(makePrincipal({ active_workspace: property, workspace_access: [property, finance] })),
    );
    const activeWorkspaceRequest = vi.spyOn(api, "authenticatedApiRequest").mockResolvedValue({
      actor_id: "actor_1",
      organization_id: "org_1",
      workspace: finance.workspace,
      membership: finance,
    });

    window.history.replaceState({}, "", "/workspace/property/documents/project-1");
    render(
      <AppShell session={authenticatedSession(makePrincipal({ active_workspace: property, workspace_access: [property, finance] }))}>
        <div>Workspace content</div>
      </AppShell>,
    );

    await waitFor(() => expect(screen.getByRole("button", { name: "Pilih workspace" })).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: "Pilih workspace" }));
    expect(screen.getByRole("menuitemradio", { name: /Finance/ })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("menuitemradio", { name: /Finance/ }));

    await waitFor(() => {
      expect(activeWorkspaceRequest).toHaveBeenCalledWith("/api/v1/auth/active-workspace", {
        body: { workspace_id: "workspace_finance" },
        method: "PUT",
      });
      expect(mockPush).toHaveBeenCalledWith("/workspace/finance%20%26%20ops/documents/project-1");
    });
  });

  it.each([
    ["Executive", "EXECUTIVE", null, "pusat-kendali", "summary"],
    ["Sales", "BUSINESS", "SALES", "penjualan-utama", "summary"],
  ] as const)("/workspace mengarahkan %s ke actual workspace_key", async (_label, workspaceType, divisionCode, workspaceKey, landing) => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValueOnce(
      authenticatedSession(
        makePrincipal({
          active_workspace: {
            active: true,
            data_scope: workspaceType === "EXECUTIVE" ? "COMPANY" : "WORKSPACE",
            permission_refs: [],
            role_refs: ["WORKSPACE_MEMBER"],
            scope_refs: [`workspace_${workspaceKey}`],
            workspace: {
              active: true,
              division_code: divisionCode,
              organization_id: "org_1",
              workspace_id: `workspace_${workspaceKey}`,
              workspace_key: workspaceKey,
              workspace_name: _label,
              workspace_type: workspaceType,
            },
          },
        }),
      ),
    );

    render(<WorkspacePage />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(`/workspace/${encodeURIComponent(workspaceKey)}/${landing}`);
    });
  });

  it("/workspace mengarahkan IT ke summary dengan actual workspace_key", async () => {
    const itWorkspace = {
      active: true,
      data_scope: "COMPANY" as const,
      permission_refs: [],
      role_refs: ["IT_ADMIN" as const],
      scope_refs: ["workspace_it_ops"],
      workspace: {
        active: true,
        division_code: "IT",
        organization_id: "org_1",
        workspace_id: "workspace_it_ops",
        workspace_key: "it/utama",
        workspace_name: "IT Operasional",
        workspace_type: "IT_OPERATIONS" as const,
      },
    };
    vi.spyOn(api, "sessionApiRequest").mockResolvedValueOnce(authenticatedSession(makePrincipal({ active_workspace: itWorkspace, workspace_access: [itWorkspace] })));

    render(<WorkspacePage />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(`/workspace/${encodeURIComponent("it/utama")}/summary`);
    });
  });

  it("/workspace unknown domain fail closed tanpa redirect canonical", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValueOnce(
      authenticatedSession(
        makePrincipal({
          active_workspace: {
            active: true,
            data_scope: "WORKSPACE",
            permission_refs: [],
            role_refs: ["WORKSPACE_MEMBER"],
            scope_refs: ["workspace_unknown"],
            workspace: {
              active: true,
              division_code: "UNRECOGNIZED",
              organization_id: "org_1",
              workspace_id: "workspace_unknown",
              workspace_key: "workspace-unknown",
              workspace_name: "Unknown",
              workspace_type: "BUSINESS",
            },
          },
        }),
      ),
    );

    render(<WorkspacePage />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Anda tidak memiliki akses ke halaman ini." })).toBeInTheDocument();
    });
    expect(mockReplace).not.toHaveBeenCalled();
    expect(screen.queryByRole("complementary", { name: "Navigasi utama" })).not.toBeInTheDocument();
  });

  it("menggunakan session flow yang sudah ada untuk logout", async () => {
    const sessionSpy = vi
      .spyOn(api, "sessionApiRequest")
      .mockResolvedValueOnce(authenticatedSession())
      .mockResolvedValueOnce({ authenticated: false, principal: null });

    render(<WorkspacePage />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Keluar" })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Keluar" }));

    await waitFor(() => {
      expect(sessionSpy).toHaveBeenCalledWith("/", { method: "DELETE" });
      expect(mockReplace).toHaveBeenCalledWith("/login");
    });
  });

  it("membuka drawer mobile, menutup dengan Escape, dan mengembalikan focus", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValueOnce(
      authenticatedSession(),
    );

    render(<WorkspacePage />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Buka navigasi" })).toBeInTheDocument();
    });

    const menuButton = screen.getByRole("button", { name: "Buka navigasi" });
    fireEvent.click(menuButton);

    expect(screen.getByRole("dialog", { name: "Navigasi mobile" })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Beranda" })).toHaveLength(2);

    fireEvent.keyDown(document, { key: "Escape" });

    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: "Navigasi mobile" })).not.toBeInTheDocument();
      expect(menuButton).toHaveFocus();
    });
  });

  it("fail closed tanpa shell saat session tidak valid", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValueOnce({
      authenticated: false,
      principal: null,
    });

    render(<WorkspacePage />);

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Anda tidak memiliki akses ke halaman ini." }),
      ).toBeInTheDocument();
    });
    expect(screen.queryByRole("complementary", { name: "Navigasi utama" })).not.toBeInTheDocument();
  });

  it("mengubah 401 session menjadi pesan sesi berakhir tanpa error teknis", async () => {
    vi.spyOn(api, "sessionApiRequest").mockRejectedValueOnce(
      new ApiError(401, "Authentication required", "corr_session_401"),
    );

    render(<WorkspacePage />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Sesi Anda sudah berakhir." })).toBeInTheDocument();
    });
    expect(screen.queryByText("Authentication required")).not.toBeInTheDocument();
    expect(screen.queryByRole("complementary", { name: "Navigasi utama" })).not.toBeInTheDocument();
  });

  it("menampilkan pesan koneksi manusiawi tanpa error teknis", async () => {
    vi.spyOn(api, "sessionApiRequest").mockRejectedValueOnce(new Error("Failed to fetch"));

    render(<WorkspacePage />);

    await waitFor(() => {
      expect(screen.getByText("Koneksi sedang bermasalah. Silakan coba kembali.")).toBeInTheDocument();
    });
    expect(screen.queryByText("Failed to fetch")).not.toBeInTheDocument();
  });
});
