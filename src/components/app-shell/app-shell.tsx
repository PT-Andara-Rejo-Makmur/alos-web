"use client";

import { House, type LucideIcon } from "lucide-react";
import { useCallback, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { selectActiveWorkspace, type SessionProjection, workspaceDomainFromMetadata } from "@/features/session";
import type { WorkspaceAccessProjection } from "@/lib/contracts";
import { ApiError, sessionApiRequest } from "@/lib/api";

import { AppSidebar } from "./app-sidebar";
import { AppTopbar } from "./app-topbar";
import { MobileNavigation } from "./mobile-navigation";
import styles from "./app-shell.module.css";

export interface AppShellProfile {
  readonly displayName: string | null;
  readonly email: string | null;
  readonly workspaceName: string | null;
  readonly activeWorkspaceId: string | null;
  readonly workspaceAccess: readonly WorkspaceAccessProjection[];
  readonly initials: string;
}

export interface AppNavigationItem {
  readonly href: string;
  readonly icon: LucideIcon;
  readonly label: string;
}

export interface AppNavigationSection {
  readonly items: readonly AppNavigationItem[];
  readonly label: string;
}

const defaultNavigation: readonly AppNavigationSection[] = [
  { items: [{ href: "/workspace", icon: House, label: "Beranda" }], label: "UTAMA" },
];

function initialsFor(displayName: string | null): string {
  if (!displayName?.trim()) return "?";
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts.at(-1)?.[0] ?? ""}`.toUpperCase();
}

export function getAppShellProfile(session: SessionProjection): AppShellProfile {
  const principal = session.principal;
  if (!principal) {
    return {
      activeWorkspaceId: null,
      displayName: null,
      email: null,
      initials: "?",
      workspaceAccess: [],
      workspaceName: null,
    };
  }

  if ("actor" in principal) {
    const displayName = principal.actor.display_name.trim() || null;
    const workspaceName = principal.active_workspace?.workspace.workspace_name ?? null;
    return {
      activeWorkspaceId: principal.active_workspace?.workspace.workspace_id ?? null,
      displayName,
      email: principal.email || null,
      workspaceAccess: principal.workspace_access,
      workspaceName,
      initials: initialsFor(displayName),
    };
  }

  const legacy = principal as typeof principal & {
    readonly display_name?: string;
    readonly email?: string;
  };
  const displayName = legacy.display_name?.trim() || null;
  return {
    activeWorkspaceId: null,
    displayName,
    email: legacy.email || null,
    workspaceName: null,
    workspaceAccess: [],
    initials: initialsFor(displayName),
  };
}

const sharedWorkSections = new Set(["projects", "tasks", "approvals", "documents", "reports", "findings"]);

export function workspaceDestination(pathname: string, workspace: WorkspaceAccessProjection): string {
  const workspaceKey = encodeURIComponent(workspace.workspace.workspace_key);
  const match = pathname.match(/^\/workspace\/[^/]+(\/.*)?$/);
  const suffix = match?.[1] ?? "";
  const section = suffix.split("/").filter(Boolean)[0];
  const canKeepSection = Boolean(section && sharedWorkSections.has(section));
  const domain = workspaceDomainFromMetadata(workspace.workspace);

  if (domain === "UNKNOWN") return "/workspace";

  if (canKeepSection) return `/workspace/${workspaceKey}${suffix}`;

  const landing = domain === "EXECUTIVE" || domain === "SALES" ? "summary" : "projects";
  return `/workspace/${workspaceKey}/${landing}`;
}

function getWorkspaceSwitchError(error: unknown): string {
  if (error instanceof ApiError && error.status === 403) {
    return "Anda tidak memiliki akses ke workspace tersebut.";
  }
  if (error instanceof ApiError && error.status === 401) {
    return "Sesi Anda sudah berakhir. Silakan masuk kembali.";
  }
  return "Workspace belum dapat diganti. Silakan coba lagi.";
}

export function AppShell({
  children,
  navigationSections = defaultNavigation,
  session,
}: Readonly<{
  children: ReactNode;
  navigationSections?: readonly AppNavigationSection[];
  session: SessionProjection;
}>) {
  const router = useRouter();
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [switchingWorkspace, setSwitchingWorkspace] = useState(false);
  const [workspaceSwitchError, setWorkspaceSwitchError] = useState<string | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const profile = getAppShellProfile(session);

  const logout = useCallback(async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await sessionApiRequest("/", { method: "DELETE" });
    } finally {
      router.replace("/login");
      router.refresh?.();
    }
  }, [loggingOut, router]);

  const switchWorkspace = useCallback(async (workspace: WorkspaceAccessProjection) => {
    if (switchingWorkspace) return;
    if (workspace.workspace.workspace_id === profile.activeWorkspaceId) {
      const destination = workspaceDestination(window.location.pathname, workspace);
      if (destination !== window.location.pathname) router.push(destination);
      return;
    }
    setSwitchingWorkspace(true);
    setWorkspaceSwitchError(null);
    try {
      await selectActiveWorkspace(workspace.workspace.workspace_id);
      router.push(workspaceDestination(window.location.pathname, workspace));
      router.refresh();
    } catch (error) {
      setWorkspaceSwitchError(getWorkspaceSwitchError(error));
    } finally {
      setSwitchingWorkspace(false);
    }
  }, [profile.activeWorkspaceId, router, switchingWorkspace]);

  return (
    <div className={styles.shell}>
      <AppSidebar
        collapsed={sidebarCollapsed}
        loggingOut={loggingOut}
        navigationSections={navigationSections}
        onLogout={() => void logout()}
        onToggleSidebar={() => setSidebarCollapsed((collapsed) => !collapsed)}
        profile={profile}
      />

      <div className={styles.body}>
        <AppTopbar
          loggingOut={loggingOut}
          menuButtonRef={menuButtonRef}
          mobileNavigationOpen={mobileNavigationOpen}
          onLogout={() => void logout()}
          onOpenMenu={() => setMobileNavigationOpen(true)}
        onSwitchWorkspace={(workspace) => void switchWorkspace(workspace)}
          profile={profile}
        switchingWorkspace={switchingWorkspace}
        workspaceSwitchError={workspaceSwitchError}
        />
        <main className={styles.main}>
          <div className={styles.content}>{children}</div>
        </main>
      </div>

      <MobileNavigation
        loggingOut={loggingOut}
        onClose={() => setMobileNavigationOpen(false)}
        onLogout={() => void logout()}
        navigationSections={navigationSections}
        open={mobileNavigationOpen}
        menuButtonRef={menuButtonRef}
        profile={profile}
      />
    </div>
  );
}
