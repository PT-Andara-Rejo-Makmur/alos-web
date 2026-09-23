import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import * as api from "@/lib/api";
import { WorkspaceResolverPage } from "@/features/workspace-resolver";

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
const mockRouter = {
  push: mockPush,
  replace: mockReplace,
};

vi.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
}));

describe("WorkspaceResolverPage Lifecycle States", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("1. Single valid workspace auto-redirects ke canonical destination", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValueOnce({
      authenticated: true,
      principal: {
        actor_id: "user_001",
        email: "director@andara.co.id",
        roles: ["DIRECTOR"],
        workspace_ids: ["ws_exec_001"],
      },
    });

    vi.spyOn(api, "authenticatedApiRequest").mockResolvedValueOnce([
      {
        workspace_id: "ws_exec_001",
        workspace_key: "executive",
        name: "Executive Workspace",
        division_code: null,
        access_level: "EXECUTIVE",
      },
    ]);

    render(<WorkspaceResolverPage />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/director");
    });
  });

  it("2. Multiple valid workspaces menampilkan chooser tanpa auto-select awal", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValueOnce({
      authenticated: true,
      principal: {
        actor_id: "user_002",
        display_name: "Multi Role User",
        email: "multi@andara.co.id",
        roles: ["BUSINESS_REVIEWER"],
        workspace_ids: ["ws_fin", "ws_hr"],
      },
    });

    vi.spyOn(api, "authenticatedApiRequest").mockResolvedValueOnce([
      {
        workspace_id: "ws_fin",
        workspace_key: "finance",
        name: "Finance Workspace",
        division_code: "FINANCE",
        access_level: "MEMBER",
      },
      {
        workspace_id: "ws_hr",
        workspace_key: "hr",
        name: "HR Workspace",
        division_code: "HR",
        access_level: "MEMBER",
      },
    ]);

    render(<WorkspaceResolverPage />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Pilih ruang kerja Anda." })).toBeInTheDocument();
      expect(screen.getByText("Finance Workspace")).toBeInTheDocument();
      expect(screen.getByText("HR Workspace")).toBeInTheDocument();
    });

    // Auto-redirect should not have occurred
    expect(mockReplace).not.toHaveBeenCalled();

    // Primary CTA should be disabled initially
    const submitBtn = screen.getByRole("button", { name: /Pilih Ruang Kerja/i });
    expect(submitBtn).toBeDisabled();

    // User clicks Finance card
    const financeCard = screen.getByRole("radio", { name: /Pilih ruang kerja Finance Workspace/i });
    fireEvent.click(financeCard);

    // Selected state activates CTA
    await waitFor(() => {
      const activeSubmitBtn = screen.getByRole("button", { name: /Masuk ke Finance Workspace/i });
      expect(activeSubmitBtn).not.toBeDisabled();
      fireEvent.click(activeSubmitBtn);
      expect(mockPush).toHaveBeenCalledWith("/workspace/finance");
    });
  });

  it("3. Safe no-access state saat tidak ada workspace yang dapat diakses", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValueOnce({
      authenticated: true,
      principal: {
        actor_id: "user_003",
        email: "noworkspace@andara.co.id",
        roles: [],
        workspace_ids: [],
      },
    });

    vi.spyOn(api, "authenticatedApiRequest").mockResolvedValueOnce([]);

    render(<WorkspaceResolverPage />);

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Belum ada workspace yang dapat diakses." }),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Akun Anda berhasil diautentikasi, tetapi belum memiliki workspace aktif/i),
      ).toBeInTheDocument();
    });
  });

  it("4. Session expired state saat 401 unauthenticated", async () => {
    vi.spyOn(api, "sessionApiRequest").mockRejectedValueOnce({
      status: 401,
      message: "Session expired",
    });

    render(<WorkspaceResolverPage />);

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Sesi Anda telah berakhir." }),
      ).toBeInTheDocument();
    });

    const reloginBtn = screen.getByRole("button", { name: /Masuk kembali/i });
    fireEvent.click(reloginBtn);
    expect(mockReplace).toHaveBeenCalledWith("/login");
  });

  it("5. Backend unavailable state saat server gagal dijangkau (fail-closed)", async () => {
    vi.spyOn(api, "sessionApiRequest").mockRejectedValueOnce({
      status: 503,
      message: "ALOS Backend unavailable",
    });

    render(<WorkspaceResolverPage />);

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Akses workspace belum dapat diverifikasi." }),
      ).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Coba lagi/i })).toBeInTheDocument();
    });
  });

  it("6. Logout button memanggil DELETE /api/session dan mengalihkan ke /login", async () => {
    const sessionSpy = vi.spyOn(api, "sessionApiRequest").mockResolvedValue({
      authenticated: true,
      principal: {
        actor_id: "user_004",
        roles: [],
        workspace_ids: [],
      },
    });

    vi.spyOn(api, "authenticatedApiRequest").mockResolvedValueOnce([]);

    render(<WorkspaceResolverPage />);

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Belum ada workspace yang dapat diakses." }),
      ).toBeInTheDocument();
    });

    const logoutBtn = screen.getByRole("button", { name: "Keluar" });
    fireEvent.click(logoutBtn);

    await waitFor(() => {
      expect(sessionSpy).toHaveBeenCalledWith("/", { method: "DELETE" });
      expect(mockReplace).toHaveBeenCalledWith("/login");
    });
  });
});
