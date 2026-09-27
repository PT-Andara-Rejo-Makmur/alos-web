import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import WorkspacePage from "@/app/workspace/page";
import * as api from "@/lib/api";

const mockPush = vi.fn();
const mockReplace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    prefetch: vi.fn(),
  }),
}));

describe("WorkspacePage (Clean Temporary Landing)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("merender tampilan temporary landing ALOS ketika sesi terautentikasi", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValueOnce({
      authenticated: true,
      principal: {
        actor: { actor_id: "actor_1", organization_id: "org_1", tenant_id: "tenant_1", active: true },
        email: "user@andara.co.id",
      },
    });

    render(<WorkspacePage />);

    expect(screen.getByText("ALOS")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Antarmuka ALOS sedang dibangun ulang." })).toBeInTheDocument();
      expect(screen.getByText("Fondasi sistem dan data tetap tersedia.")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Keluar" })).toBeInTheDocument();
    });
  });

  it("melakukan logout dan redirect ke /login saat tombol Keluar diklik", async () => {
    const sessionSpy = vi.spyOn(api, "sessionApiRequest")
      .mockResolvedValueOnce({
        authenticated: true,
        principal: {
          actor: { actor_id: "actor_1", organization_id: "org_1", tenant_id: "tenant_1", active: true },
          email: "user@andara.co.id",
        },
      })
      .mockResolvedValueOnce({});

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

  it("menampilkan pesan 'Anda tidak memiliki akses ke halaman ini.' jika tidak terautentikasi", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValueOnce({
      authenticated: false,
      principal: null,
    });

    render(<WorkspacePage />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Anda tidak memiliki akses ke halaman ini." })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Masuk kembali" })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Masuk kembali" }));
    expect(mockReplace).toHaveBeenCalledWith("/login");
  });

  it("menampilkan pesan 'Kami belum dapat memuat halaman ini. Silakan coba lagi.' saat terjadi kesalahan", async () => {
    vi.spyOn(api, "sessionApiRequest").mockRejectedValueOnce(new Error("Network failure"));

    render(<WorkspacePage />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Kami belum dapat memuat halaman ini. Silakan coba lagi." })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Coba lagi" })).toBeInTheDocument();
    });
  });
});
