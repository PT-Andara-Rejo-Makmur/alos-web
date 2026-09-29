import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SettingsLayout } from "@/features/settings/settings-layout";
import { SettingsSecurityPage } from "@/features/settings/security/settings-security-page";
import { SettingsSessionsPage } from "@/features/settings/sessions/settings-sessions-page";
import { SettingsNotificationsPage } from "@/features/settings/notifications/settings-notifications-page";
import { SettingsPreferencesPage } from "@/features/settings/preferences/settings-preferences-page";
import type { AuthenticatedPrincipalProjection, WorkspaceAccessProjection } from "@/lib/contracts";
import * as api from "@/lib/api";

const mockReplace = vi.fn();
const mockRefresh = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => "/settings/profile",
  useRouter: () => ({ push: vi.fn(), refresh: mockRefresh, replace: mockReplace }),
}));

function sessionFixture(): { authenticated: true; principal: AuthenticatedPrincipalProjection } {
  const access: WorkspaceAccessProjection = {
    active: true,
    data_scope: "WORKSPACE",
    permission_refs: [],
    role_refs: ["WORKSPACE_MEMBER"],
    scope_refs: ["workspace_global_settings"],
    workspace: {
      active: true,
      division_code: "IT",
      organization_id: "org_settings",
      workspace_id: "workspace_global_settings",
      workspace_key: "global-settings",
      workspace_name: "Workspace Sistem",
      workspace_type: "IT_OPERATIONS",
    },
  };
  return {
    authenticated: true,
    principal: {
      actor: {
        actor_id: "actor_settings",
        active: true,
        display_name: "Pengguna Settings",
        organization_id: "org_settings",
        tenant_id: "tenant_settings",
      },
      active_workspace: access,
      email: "settings@example.test",
      expires_at: "2026-10-29T00:00:00Z",
      issued_at: "2026-09-29T00:00:00Z",
      workspace_access: [access],
    },
  };
}

function settingsProductionSource(): string {
  const root = join(process.cwd(), "src", "features", "settings");
  return [
    join(root, "settings-layout.tsx"),
    join(root, "settings-model.ts"),
    join(root, "profile", "settings-profile-page.tsx"),
    join(root, "security", "settings-security-page.tsx"),
    join(root, "sessions", "settings-sessions-page.tsx"),
    join(root, "notifications", "settings-notifications-page.tsx"),
    join(root, "preferences", "settings-preferences-page.tsx"),
  ].map((path) => readFileSync(path, "utf8")).join("\n");
}

describe("Global Settings security and self-service boundary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.history.replaceState({}, "", "/settings/profile");
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("tidak bergantung pada IT authority, domain resolver, atau localStorage", () => {
    const source = settingsProductionSource();
    expect(source).not.toMatch(/features\/it/);
    expect(source).not.toContain("resolveWorkspaceDomain");
    expect(source).not.toContain("localStorage");
    expect(source).not.toMatch(/authenticatedApiRequest/);
  });

  it("tidak merender password, hash, token, role edit, atau workspace mutation", () => {
    const source = settingsProductionSource();
    expect(source).not.toMatch(/value\s*=.*(?:password|hash|token)/i);
    expect(source).not.toMatch(/reset[_ -]?token|activation[_ -]?token|session[_ -]?token/i);
    expect(source).not.toMatch(/Tambah Workspace|Edit Role|Cabut Workspace|Suspend Account/i);
    expect(source).toContain("Email");
    expect(source).toContain("readOnly");
  });

  it("menampilkan perubahan kata sandi sebagai readiness disabled tanpa asumsi autentikasi lokal", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValue(sessionFixture());

    render(
      <SettingsLayout>
        <SettingsSecurityPage />
      </SettingsLayout>,
    );

    expect(await screen.findByRole("heading", { name: "Keamanan", level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ubah Kata Sandi" })).toBeDisabled();
    expect(screen.getByText(/^Metode Autentikasi:/, { selector: "strong" })).toBeInTheDocument();
    expect(screen.getByText("Perubahan kata sandi tersedia setelah metode autentikasi akun dapat diverifikasi.")).toBeInTheDocument();
    expect(screen.getAllByText(/Belum Terhubung/, { selector: "strong" }).length).toBeGreaterThan(0);
    const passwordControls = Array.from(document.querySelectorAll<HTMLInputElement>('input[type="password"]'));
    expect(passwordControls).toHaveLength(3);
    expect(passwordControls.every((control) => control.disabled && control.value === "")).toBe(true);
  });

  it("menampilkan metadata sesi saat ini dan membuat registry remote tetap unavailable", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValue(sessionFixture());

    render(
      <SettingsLayout>
        <SettingsSessionsPage />
      </SettingsLayout>,
    );

    expect(await screen.findByRole("heading", { name: "Sesi & Perangkat", level: 1 })).toBeInTheDocument();
    expect(screen.getByText("Perangkat")).toBeInTheDocument();
    expect(screen.getByText("Browser")).toBeInTheDocument();
    expect(screen.getByText("Aktivitas Terakhir")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Keluar dari semua perangkat lain — Belum tersedia" })).toBeDisabled();
  });

  it("logout sesi saat ini memakai boundary DELETE yang sama", async () => {
    const sessionSpy = vi
      .spyOn(api, "sessionApiRequest")
      .mockResolvedValueOnce(sessionFixture())
      .mockResolvedValueOnce(undefined);

    render(
      <SettingsLayout>
        <SettingsSessionsPage />
      </SettingsLayout>,
    );

    fireEvent.click(await screen.findByRole("button", { name: "Keluar dari sesi ini" }));
    await waitFor(() => {
      expect(sessionSpy).toHaveBeenCalledWith("/", { method: "DELETE" });
      expect(mockReplace).toHaveBeenCalledWith("/login");
    });
  });

  it("tetap di Settings ketika logout sesi saat ini gagal", async () => {
    const sessionSpy = vi
      .spyOn(api, "sessionApiRequest")
      .mockResolvedValueOnce(sessionFixture())
      .mockRejectedValueOnce(new Error("logout failed"));

    render(
      <SettingsLayout>
        <SettingsSessionsPage />
      </SettingsLayout>,
    );

    fireEvent.click(await screen.findByRole("button", { name: "Keluar dari sesi ini" }));
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Sesi belum dapat ditutup. Silakan coba kembali."));
    expect(sessionSpy).toHaveBeenCalledWith("/", { method: "DELETE" });
    expect(mockReplace).not.toHaveBeenCalled();
    expect(screen.getByRole("heading", { name: "Sesi & Perangkat", level: 1 })).toBeInTheDocument();
  });

  it("notifikasi dan preferensi tidak berpura-pura tersimpan", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValue(sessionFixture());

    const notifications = render(<SettingsNotificationsPage />);
    expect(await screen.findByRole("heading", { name: "Notifikasi", level: 1 })).toBeInTheDocument();
    expect(screen.getAllByText("Belum Terhubung").length).toBeGreaterThan(0);
    const notificationControls = screen.getAllByRole("checkbox");
    expect(notificationControls).toHaveLength(16);
    expect(notificationControls.every((control) => (control as HTMLInputElement).disabled && !(control as HTMLInputElement).checked)).toBe(true);
    expect(readFileSync(join(process.cwd(), "src", "features", "settings", "notifications", "settings-notifications-page.tsx"), "utf8")).not.toMatch(/>\s*(ON|OFF)\s*</i);
    expect(screen.getByText("Sebagian notifikasi dapat diwajibkan oleh kebijakan sistem.")).toBeInTheDocument();
    notifications.unmount();

    render(<SettingsPreferencesPage />);
    expect(screen.getByRole("heading", { name: "Preferensi", level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Penyimpanan preferensi belum tersedia." })).toBeDisabled();
    expect(screen.getAllByRole("combobox").every((control) => (control as HTMLSelectElement).disabled)).toBe(true);
  });
});
