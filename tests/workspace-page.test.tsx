import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import WorkspacePage from "@/app/workspace/page";
import { AppShell } from "@/components/app-shell/app-shell";
import { roleLabel } from "@/lib/presentation";
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

  it("multi-workspace chooser berdiri sendiri tanpa sidebar atau switcher", async () => {
    const property = {
      active: true,
      data_scope: "WORKSPACE" as const,
      permission_refs: [],
      role_refs: ["DIVISION_LEAD" as const],
      scope_refs: ["workspace_property"],
      workspace: { active: true, division_code: "PROPERTY", organization_id: "org_1", workspace_id: "workspace_property", workspace_key: "property", workspace_name: "Property & Teknik", workspace_type: "BUSINESS" as const },
    };
    const finance = {
      ...property,
      role_refs: ["DIVISION_MEMBER" as const],
      scope_refs: ["workspace_finance"],
      workspace: { ...property.workspace, division_code: "FINANCE", workspace_id: "workspace_finance", workspace_key: "finance", workspace_name: "Finance & Pajak" },
    };
    vi.spyOn(api, "sessionApiRequest").mockResolvedValueOnce(authenticatedSession(makePrincipal({ active_workspace: property, workspace_access: [property, finance] })));

    render(<WorkspacePage />);

    expect(await screen.findByRole("heading", { name: "Pilih Ruang Kerja", level: 1 })).toBeInTheDocument();
    expect(screen.getByText("Rani Andara")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Property & Teknik/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Finance & Pajak/ })).toBeInTheDocument();
    expect(screen.getByText("Kepala Divisi")).toBeInTheDocument();
    expect(roleLabel("DIVISION_LEAD")).toBe("Kepala Divisi");
    expect(screen.queryByRole("complementary", { name: "Navigasi utama" })).not.toBeInTheDocument();
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
    expect(screen.queryByRole("dialog", { name: "Navigasi mobile" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Buka navigasi" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Pilih ruang kerja" })).not.toBeInTheDocument();
  });

  it("dapat mengubah sidebar desktop dari expanded ke collapsed", async () => {
    render(<AppShell session={authenticatedSession()}><div>Workspace content</div></AppShell>);

    expect(await screen.findByRole("button", { name: "Tutup sidebar" })).toBeInTheDocument();

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

    const firstRender = render(<AppShell session={session}><div>Workspace content</div></AppShell>);
    const firstNavigation = await screen.findByRole("navigation", { name: "Menu aplikasi" });
    Object.defineProperty(firstNavigation, "scrollTop", { configurable: true, value: 184, writable: true });
    fireEvent.scroll(firstNavigation);
    firstRender.unmount();

    render(<AppShell session={session}><div>Workspace content</div></AppShell>);
    const restoredNavigation = await screen.findByRole("navigation", { name: "Menu aplikasi" });
    await waitFor(() => expect(restoredNavigation.scrollTop).toBe(184));
  });

  it("menampilkan state saat belum ada workspace yang dapat dibuka", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValueOnce(
      authenticatedSession(),
    );

    render(<WorkspacePage />);

    await waitFor(() => {
      expect(screen.getByText("Belum ada ruang kerja yang dapat dibuka")).toBeInTheDocument();
    });
  });

  it("memilih Finance dari chooser dengan update Backend lalu membuka ringkasan", async () => {
    const property = {
      active: true,
      data_scope: "WORKSPACE" as const,
      permission_refs: [],
      role_refs: ["DIVISION_LEAD" as const],
      scope_refs: ["workspace_property"],
      workspace: { active: true, division_code: "PROPERTY", organization_id: "org_1", workspace_id: "workspace_property", workspace_key: "property", workspace_name: "Property", workspace_type: "BUSINESS" as const },
    };
    const finance = { ...property, role_refs: ["DIVISION_MEMBER" as const], scope_refs: ["workspace_finance"], workspace: { ...property.workspace, division_code: "FINANCE", workspace_id: "workspace_finance", workspace_key: "finance", workspace_name: "Finance" } };
    vi.spyOn(api, "sessionApiRequest").mockResolvedValueOnce(authenticatedSession(makePrincipal({ active_workspace: property, workspace_access: [property, finance] })));
    const request = vi.spyOn(api, "authenticatedApiRequest").mockResolvedValue({ actor_id: "actor_1", organization_id: "org_1", workspace: finance.workspace, membership: finance });

    render(<WorkspacePage />);
    fireEvent.click(await screen.findByRole("button", { name: /Finance/ }));

    await waitFor(() => {
      expect(request).toHaveBeenCalledWith("/api/v1/auth/active-workspace", { body: { workspace_id: "workspace_finance" }, method: "PUT" });
      expect(mockReplace).toHaveBeenCalledWith("/workspace/finance/summary");
    });
  });

  it("menampilkan pesan aman jika Backend menolak pemilihan workspace", async () => {
    const property = {
      active: true,
      data_scope: "WORKSPACE" as const,
      permission_refs: [],
      role_refs: ["DIVISION_MEMBER" as const],
      scope_refs: ["workspace_property"],
      workspace: { active: true, division_code: "PROPERTY", organization_id: "org_1", workspace_id: "workspace_property", workspace_key: "property", workspace_name: "Property", workspace_type: "BUSINESS" as const },
    };
    const finance = { ...property, scope_refs: ["workspace_finance"], workspace: { ...property.workspace, division_code: "FINANCE", workspace_id: "workspace_finance", workspace_key: "finance", workspace_name: "Finance" } };
    vi.spyOn(api, "sessionApiRequest").mockResolvedValueOnce(authenticatedSession(makePrincipal({ active_workspace: property, workspace_access: [property, finance] })));
    vi.spyOn(api, "authenticatedApiRequest").mockRejectedValue(new ApiError(403, "WORKSPACE_ACCESS_DENIED", "corr_1"));

    render(<WorkspacePage />);
    fireEvent.click(await screen.findByRole("button", { name: /Finance/ }));

    expect(await screen.findByText("Ruang kerja belum dapat dibuka. Coba lagi.")).toBeInTheDocument();
    expect(screen.queryByText("WORKSPACE_ACCESS_DENIED")).not.toBeInTheDocument();
    expect(mockReplace).not.toHaveBeenCalledWith("/workspace/finance/summary");
  });

  it("menampilkan workspace yang tersedia dan lekatkan pilihan ke endpoint Backend", async () => {
    const property = {
      active: true,
      data_scope: "WORKSPACE" as const,
      permission_refs: [],
      role_refs: ["DIVISION_MEMBER" as const],
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

    await waitFor(() => expect(screen.getByRole("button", { name: "Pilih ruang kerja" })).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: "Pilih ruang kerja" }));
    expect(screen.getByRole("menuitemradio", { name: /Finance/ })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("menuitemradio", { name: /Finance/ }));

    await waitFor(() => {
      expect(activeWorkspaceRequest).toHaveBeenCalledWith("/api/v1/auth/active-workspace", {
        body: { workspace_id: "workspace_finance" },
        method: "PUT",
      });
      expect(mockPush).toHaveBeenCalledWith("/workspace/finance%20%26%20ops/summary");
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
            role_refs: ["DIVISION_MEMBER"],
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

    expect(screen.queryByRole("heading", { name: "Pilih Ruang Kerja" })).not.toBeInTheDocument();

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
            role_refs: ["DIVISION_MEMBER"],
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

    render(<AppShell session={authenticatedSession()}><div>Workspace content</div></AppShell>);

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
      expect(screen.getByText("Periksa koneksi lalu coba kembali.")).toBeInTheDocument();
    });
    expect(screen.queryByText("Failed to fetch")).not.toBeInTheDocument();
  });
});
