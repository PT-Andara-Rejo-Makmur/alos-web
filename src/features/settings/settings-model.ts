import type { SessionProjection } from "@/features/session";
import type { WorkspaceAccessProjection } from "@/lib/contracts";
import { ApiError } from "@/lib/api";

export type SettingsSourceState = "loading" | "unavailable" | "connected-empty" | "connected-data" | "error";

export const settingsSourceLabels: Record<SettingsSourceState, string> = {
  loading: "Memuat",
  unavailable: "Belum Terhubung",
  "connected-empty": "Belum ada data",
  "connected-data": "Tersedia",
  error: "Data belum dapat dimuat",
};

const roleLabels: Record<string, string> = {
  EXECUTIVE: "Direktur",
  DIVISION_LEAD: "Manajer / Kepala Divisi",
  DIVISION_MEMBER: "Anggota Divisi",
  IT_ADMIN: "Administrator IT",
  WORKSPACE_LEAD: "Pimpinan Ruang Kerja",
  WORKSPACE_MEMBER: "Anggota Ruang Kerja",
  BUSINESS_REVIEWER: "Peninjau Bisnis",
  AI_ADMIN: "Administrator ARA",
  TECHNICAL_REVIEWER: "Peninjau Teknis",
  QA_ASSURANCE: "Penjamin Mutu",
};

export function settingsRoleLabel(role: string): string {
  return roleLabels[role] ?? "Belum Dinilai";
}

export function formatSettingsDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Belum Dinilai";
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export interface SettingsSnapshot {
  readonly active: boolean | null;
  readonly activeWorkspaceName: string | null;
  readonly displayName: string | null;
  readonly email: string | null;
  readonly expiresAt: string | null;
  readonly issuedAt: string | null;
  readonly workspaces: readonly WorkspaceAccessProjection[];
}

export function settingsSnapshot(session: SessionProjection): SettingsSnapshot {
  const principal = session.principal;
  if (!principal || !("actor" in principal)) {
    return {
      active: null,
      activeWorkspaceName: null,
      displayName: null,
      email: null,
      expiresAt: null,
      issuedAt: null,
      workspaces: [],
    };
  }

  return {
    active: principal.actor.active,
    activeWorkspaceName: principal.active_workspace?.workspace.workspace_name ?? null,
    displayName: principal.actor.display_name || null,
    email: principal.email || null,
    expiresAt: principal.expires_at ?? null,
    issuedAt: principal.issued_at ?? null,
    workspaces: principal.workspace_access,
  };
}

export function settingsErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 401) return "Sesi Anda sudah berakhir. Silakan masuk kembali.";
    if (error.status === 403) return "Anda tidak memiliki kewenangan untuk membuka Pengaturan.";
    if (error.status === 409) return "Data telah berubah. Silakan coba kembali.";
    if (error.status === 422) return "Data tidak valid.";
    if (error.status >= 500) return "Perubahan belum dapat disimpan.";
  }
  return "Pengaturan belum dapat dimuat. Silakan coba kembali.";
}
