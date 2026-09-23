import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AppShell } from "@/components/layout/app-shell";
import { LandingPage } from "@/features/landing";

// Mock next/navigation
const mockUsePathname = vi.fn();
vi.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
}));

describe("LandingPage Component", () => {
  it("merender seluruh section utama landing page", () => {
    const { container } = render(<LandingPage />);

    // Header & Brand
    expect(screen.getAllByText("PT ANDARA REJO MAKMUR").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Andara Lean Operating System").length).toBeGreaterThanOrEqual(1);

    // Hero section
    expect(screen.getByText("ONE SYSTEM. A STRONGER TOMORROW.")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: "ALOS" })).toBeInTheDocument();
    expect(
      screen.getByText("Mengintegrasikan Manusia, Proses, Data, dan AI Agent untuk Pertumbuhan Berkelanjutan.")
    ).toBeInTheDocument();
    expect(screen.getByText("Secure & Governed")).toBeInTheDocument();
    expect(screen.getByText("Data-Driven Decisions")).toBeInTheDocument();
    expect(screen.getByText("AI-Powered Execution")).toBeInTheDocument();

    // About section
    expect(
      screen.getByRole("heading", { level: 2, name: "Lebih dari Sekadar Sistem, Ini Cara Kerja Baru." })
    ).toBeInTheDocument();
    expect(screen.getByText("Terintegrasi")).toBeInTheDocument();
    expect(screen.getByText("Berbasis Data")).toBeInTheDocument();
    expect(screen.getByText("AI-Powered")).toBeInTheDocument();
    expect(screen.getByText("Tata Kelola Kuat")).toBeInTheDocument();

    // Divisions section
    expect(
      screen.getByRole("heading", { level: 2, name: "Kolaborasi untuk Hasil yang Lebih Besar." })
    ).toBeInTheDocument();
    expect(screen.getByText("Sales & Marketing")).toBeInTheDocument();
    expect(screen.getByText("Property")).toBeInTheDocument();
    expect(screen.getByText("Finance")).toBeInTheDocument();
    expect(screen.getByText("HR")).toBeInTheDocument();
    expect(screen.getByText("Legal & Compliance")).toBeInTheDocument();
    expect(screen.getByText("IT & Technology")).toBeInTheDocument();

    // GENESIS section
    expect(
      screen.getByRole("heading", { level: 2, name: "AI Agent untuk Eksekusi yang Terarah." })
    ).toBeInTheDocument();
    expect(screen.getByText("Research & Analysis")).toBeInTheDocument();
    expect(screen.getByText("Automation & Execution")).toBeInTheDocument();
    expect(screen.getByText("Knowledge & Memory")).toBeInTheDocument();
    expect(screen.getByText("Governance & Safety")).toBeInTheDocument();
    expect(screen.getByText("Multi-Agent Collaboration")).toBeInTheDocument();
    expect(screen.getByText("AI Agent Ecosystem")).toBeInTheDocument();

    // Final CTA section
    expect(
      screen.getByRole("heading", { level: 2, name: "Membangun Hari Ini untuk Generasi Esok." })
    ).toBeInTheDocument();

    // CTAs link to /login
    const loginLinks = screen.getAllByRole("link", { name: /Masuk ke ALOS/i });
    expect(loginLinks.length).toBeGreaterThanOrEqual(1);
    for (const link of loginLinks) {
      expect(link).toHaveAttribute("href", "/login");
    }

    // STRICT REQUIREMENT: No 710 in the rendered content!
    const htmlContent = container.innerHTML;
    expect(htmlContent).not.toMatch(/\b710\b/);
    expect(htmlContent).not.toContain("710");
  });
});

describe("AppShell route awareness", () => {
  it("tidak merender dashboard chrome ketika berada pada route /", () => {
    mockUsePathname.mockReturnValue("/");

    const { container } = render(
      <AppShell>
        <div data-testid="landing-content">Konten Landing Page</div>
      </AppShell>
    );

    expect(screen.getByTestId("landing-content")).toBeInTheDocument();
    expect(container.querySelector(".app-frame")).toBeNull();
    expect(container.querySelector(".topbar")).toBeNull();
    expect(container.querySelector(".content-frame")).toBeNull();
    expect(container.querySelector(".footer")).toBeNull();
  });

  it("merender dashboard chrome ketika berada pada route internal legacy seperti /genesis", () => {
    mockUsePathname.mockReturnValue("/genesis");

    const { container } = render(
      <AppShell>
        <div data-testid="workspace-content">Konten Genesis Workspace</div>
      </AppShell>
    );

    expect(screen.getByTestId("workspace-content")).toBeInTheDocument();
    expect(container.querySelector(".app-frame")).toBeInTheDocument();
    expect(container.querySelector(".topbar")).toBeInTheDocument();
    expect(container.querySelector(".content-frame")).toBeInTheDocument();
    expect(container.querySelector(".footer")).toBeInTheDocument();
  });
});
