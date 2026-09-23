import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AppShell } from "@/components/layout/app-shell";
import { LoginPage } from "@/features/session";
import * as api from "@/lib/api";

// Mock next/navigation
const mockUsePathname = vi.fn();
const mockPush = vi.fn();
const mockReplace = vi.fn();
const mockRefresh = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    refresh: mockRefresh,
    prefetch: vi.fn(),
  }),
}));

describe("LoginPage Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("merender seluruh elemen visual dan form login", () => {
    render(<LoginPage />);

    // Brand & Headings
    expect(screen.getAllByText("PT ANDARA REJO MAKMUR").length).toBeGreaterThanOrEqual(1);
    expect(
      screen.getByRole("heading", { level: 2, name: "Selamat datang kembali." })
    ).toBeInTheDocument();
    expect(screen.getByText("ANDARA LEAN OPERATING SYSTEM")).toBeInTheDocument();

    // Inputs & Labels
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Kata sandi")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("nama@andara.co.id")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Masukkan kata sandi")).toBeInTheDocument();

    // Submit button
    expect(screen.getByRole("button", { name: /Masuk ke ALOS/i })).toBeInTheDocument();

    // Security & Role boxes
    expect(
      screen.getByText(/Sesi dikelola ALOS Backend · Cookie HttpOnly/i)
    ).toBeInTheDocument();
    expect(screen.getByText("Akses berbasis peran")).toBeInTheDocument();
    expect(
      screen.getByText(/Setelah masuk, ALOS menampilkan workspace dan data sesuai role/i)
    ).toBeInTheDocument();

    // Back to home link
    expect(screen.getAllByText("Kembali ke beranda").length).toBeGreaterThanOrEqual(1);
  });

  it("dapat mengubah visibilitas kata sandi (show/hide toggle)", () => {
    render(<LoginPage />);

    const passwordInput = screen.getByPlaceholderText("Masukkan kata sandi");
    expect(passwordInput).toHaveAttribute("type", "password");

    const toggleButton = screen.getByRole("button", { name: /Tampilkan kata sandi/i });
    fireEvent.click(toggleButton);

    expect(passwordInput).toHaveAttribute("type", "text");
    expect(screen.getByRole("button", { name: /Sembunyikan kata sandi/i })).toBeInTheDocument();

    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute("type", "password");
  });

  it("memanggil sessionApiRequest dengan kredensial yang dimasukkan", async () => {
    const sessionSpy = vi.spyOn(api, "sessionApiRequest").mockResolvedValueOnce({
      authenticated: true,
      principal: { display_name: "Admin", email: "admin@andara.co.id" },
    });

    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText("nama@andara.co.id"), {
      target: { value: "admin@andara.co.id" },
    });
    fireEvent.change(screen.getByPlaceholderText("Masukkan kata sandi"), {
      target: { value: "SecretPassword123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Masuk ke ALOS/i }));

    await waitFor(() => {
      expect(sessionSpy).toHaveBeenCalledWith("/login", {
        method: "POST",
        body: { email: "admin@andara.co.id", password: "SecretPassword123" },
      });
      expect(mockReplace).toHaveBeenCalledWith("/workspace");
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  it("menampilkan pesan error role='alert' jika autentikasi gagal", async () => {
    vi.spyOn(api, "sessionApiRequest").mockRejectedValueOnce(
      new Error("Kredensial tidak valid.")
    );

    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText("nama@andara.co.id"), {
      target: { value: "invalid@andara.co.id" },
    });
    fireEvent.change(screen.getByPlaceholderText("Masukkan kata sandi"), {
      target: { value: "WrongPassword123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Masuk ke ALOS/i }));

    await waitFor(() => {
      const alertBox = screen.getByRole("alert");
      expect(alertBox).toBeInTheDocument();
      expect(alertBox).toHaveTextContent("Kredensial tidak valid.");
    });
  });
});

describe("AppShell login route awareness", () => {
  it("tidak merender chrome internal dashboard saat berada di /login", () => {
    mockUsePathname.mockReturnValue("/login");

    const { container } = render(
      <AppShell>
        <div data-testid="login-content">Halaman Login Shell-Free</div>
      </AppShell>
    );

    expect(screen.getByTestId("login-content")).toBeInTheDocument();
    expect(container.querySelector(".app-frame")).toBeNull();
    expect(container.querySelector(".topbar")).toBeNull();
    expect(container.querySelector(".footer")).toBeNull();
  });
});
