import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import WorkspacePage from "@/app/workspace/page";
import type { AuthenticatedPrincipalProjection } from "@/lib/contracts";
import { ApiError } from "@/lib/api";
import * as api from "@/lib/api";

const mockReplace = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => "/workspace",
  useRouter: () => ({
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
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("menampilkan App Shell, identitas session, dan landing ruang kerja", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValueOnce(
      authenticatedSession(
        makePrincipal({
          active_workspace: {
            active: true,
            data_scope: "WORKSPACE",
            permission_refs: [],
            role_refs: ["WORKSPACE_MEMBER"],
            scope_refs: ["workspace_property"],
            workspace: {
              active: true,
              division_code: "PROPERTY",
              organization_id: "org_1",
              workspace_id: "workspace_property",
              workspace_key: "property",
              workspace_name: "Property",
              workspace_type: "BUSINESS",
            },
          },
        }),
      ),
    );

    render(<WorkspacePage />);

    await waitFor(() => {
      expect(screen.getByRole("complementary", { name: "Navigasi utama" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "ALOS", level: 1 })).toBeInTheDocument();
    });

    expect(screen.getByRole("link", { name: "Beranda" })).toHaveAttribute("aria-current", "page");
    expect(screen.getAllByText("Rani Andara").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Property").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Ruang kerja Anda siap digunakan.")).toBeInTheDocument();
    expect(screen.getByText("Fondasi sistem aktif")).toBeInTheDocument();
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
