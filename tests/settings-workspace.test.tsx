import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { GlobalUserNavigation } from "@/components/app-shell/global-user-navigation";
import { workspaceDestination } from "@/components/app-shell/app-shell";
import { settingsNavigation } from "@/features/settings/navigation";
import { SettingsLayout } from "@/features/settings/settings-layout";
import { SettingsProfilePage } from "@/features/settings/profile/settings-profile-page";
import type { AuthenticatedPrincipalProjection, WorkspaceAccessProjection } from "@/lib/contracts";
import * as api from "@/lib/api";

const mockPush = vi.fn();
const mockRefresh = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => "/settings/profile",
  useRouter: () => ({ push: mockPush, refresh: mockRefresh, replace: vi.fn() }),
}));

function workspaceAccess(workspaceKey = "finance-utama"): WorkspaceAccessProjection {
  return {
    active: true,
    data_scope: "WORKSPACE",
    permission_refs: [],
    role_refs: ["WORKSPACE_MEMBER"],
    scope_refs: [`workspace_${workspaceKey}`],
    workspace: {
      active: true,
      division_code: "FINANCE",
      organization_id: "org_settings",
      workspace_id: `workspace_${workspaceKey}`,
      workspace_key: workspaceKey,
      workspace_name: "Keuangan Operasional",
      workspace_type: "BUSINESS",
    },
  };
}

function sessionFixture(): { authenticated: true; principal: AuthenticatedPrincipalProjection } {
  const access = workspaceAccess();
  return {
    authenticated: true,
    principal: {
      actor: {
        actor_id: "actor_settings",
        active: true,
        display_name: "Pengguna Pengaturan",
        organization_id: "org_settings",
        tenant_id: "tenant_settings",
      },
      active_workspace: access,
      email: "pengguna@example.test",
      expires_at: "2026-10-29T00:00:00Z",
      issued_at: "2026-09-29T00:00:00Z",
      workspace_access: [access],
    },
  };
}

describe("Global Settings workspace surface", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.history.replaceState({}, "", "/settings/profile");
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("memiliki route global dan tidak membuat route settings di bawah workspace", () => {
    const appRoot = join(process.cwd(), "src", "app");
    for (const route of ["settings/page.tsx", "settings/profile/page.tsx", "settings/security/page.tsx", "settings/sessions/page.tsx", "settings/notifications/page.tsx", "settings/preferences/page.tsx"]) {
      expect(() => readFileSync(join(appRoot, route), "utf8")).not.toThrow();
    }

    const settingsFiles = [
      join(process.cwd(), "src", "features", "settings", "settings-layout.tsx"),
      join(process.cwd(), "src", "features", "settings", "settings-model.ts"),
      join(process.cwd(), "src", "features", "settings", "profile", "settings-profile-page.tsx"),
    ];
    const source = settingsFiles.map((path) => readFileSync(path, "utf8")).join("\n");
    expect(source).not.toContain("resolveWorkspaceDomain");
    expect(source).not.toMatch(/features\/it/);
    expect(readFileSync(join(process.cwd(), "src", "app", "navigation.ts"), "utf8")).not.toContain("/settings");
  });

  it("menggunakan lima menu Settings tanpa mengubah menu domain", () => {
    const sections = settingsNavigation();
    expect(sections.flatMap((section) => section.items.map((item) => item.label))).toEqual([
      "Profil",
      "Keamanan",
      "Sesi & Perangkat",
      "Notifikasi",
      "Preferensi",
    ]);
    expect(sections.map((section) => section.label)).toEqual(["AKUN", "PREFERENSI"]);
  });

  it("menampilkan Settings untuk principal terautentikasi tanpa bergantung pada domain aktif", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValue(sessionFixture());

    render(
      <SettingsLayout>
        <SettingsProfilePage />
      </SettingsLayout>,
    );

    expect(await screen.findByRole("heading", { name: "Profil", level: 1 })).toBeInTheDocument();
    expect(screen.getAllByText("Pengguna Pengaturan").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("pengguna@example.test")).toBeInTheDocument();
    expect(screen.getAllByText("Keuangan Operasional").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Belum Terhubung").length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: "Pengaturan" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("textbox", { name: "Email" })).toHaveAttribute("readonly");
    expect(screen.getByRole("button", { name: "Penyimpanan profil belum tersedia." })).toBeDisabled();
  });

  it("mempertahankan pathname Settings saat workspace switch diminta", () => {
    const workspace = workspaceAccess("finance-lain");
    expect(workspaceDestination("/settings/profile", workspace, true)).toBe("/settings/profile");
    expect(workspaceDestination("/settings/preferences", workspace, true)).toBe("/settings/preferences");
    expect(workspaceDestination("/settings/profile", workspace)).toBe("/workspace/finance-lain/projects");
  });

  it("menyediakan global link yang ikut dipakai oleh mobile AppSidebar", () => {
    const sidebarSource = readFileSync(join(process.cwd(), "src", "components", "app-shell", "app-sidebar.tsx"), "utf8");
    const mobileSource = readFileSync(join(process.cwd(), "src", "components", "app-shell", "mobile-navigation.tsx"), "utf8");
    expect(sidebarSource).toContain("GlobalUserNavigation");
    expect(mobileSource).toContain("<AppSidebar");

    render(<GlobalUserNavigation />);
    expect(screen.getByRole("link", { name: "AI Workspace" })).toHaveAttribute("href", "/workspace");
    expect(screen.getByRole("link", { name: "Pengaturan" })).toHaveAttribute("href", "/settings/profile");
  });

  it("menolak session yang tidak terautentikasi tanpa AppShell", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValue({ authenticated: false, principal: null });

    render(
      <SettingsLayout>
        <SettingsProfilePage />
      </SettingsLayout>,
    );

    await waitFor(() => expect(screen.getByRole("heading", { name: "Sesi Anda sudah berakhir." })).toBeInTheDocument());
    expect(screen.queryByRole("complementary", { name: "Navigasi utama" })).not.toBeInTheDocument();
  });
});
