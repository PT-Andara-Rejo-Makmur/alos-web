"use client";

import { House, type LucideIcon } from "lucide-react";
import { useCallback, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { sessionApiRequest } from "@/lib/api";
import type { SessionProjection } from "@/features/session";

import { AppSidebar } from "./app-sidebar";
import { AppTopbar } from "./app-topbar";
import { MobileNavigation } from "./mobile-navigation";
import styles from "./app-shell.module.css";

export interface AppShellProfile {
  readonly displayName: string | null;
  readonly email: string | null;
  readonly workspaceName: string | null;
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
    return { displayName: null, email: null, workspaceName: null, initials: "?" };
  }

  if ("actor" in principal) {
    const displayName = principal.actor.display_name.trim() || null;
    return {
      displayName,
      email: principal.email || null,
      workspaceName: principal.active_workspace?.workspace.workspace_name ?? null,
      initials: initialsFor(displayName),
    };
  }

  const legacy = principal as typeof principal & {
    readonly display_name?: string;
    readonly email?: string;
  };
  const displayName = legacy.display_name?.trim() || null;
  return {
    displayName,
    email: legacy.email || null,
    workspaceName: null,
    initials: initialsFor(displayName),
  };
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

  return (
    <div className={styles.shell}>
      <AppSidebar
        collapsed={sidebarCollapsed}
        loggingOut={loggingOut}
        navigationSections={navigationSections}
        onLogout={() => void logout()}
        profile={profile}
      />

      <div className={styles.body}>
        <AppTopbar
          loggingOut={loggingOut}
          menuButtonRef={menuButtonRef}
          mobileNavigationOpen={mobileNavigationOpen}
          onToggleSidebar={() => setSidebarCollapsed((collapsed) => !collapsed)}
          onLogout={() => void logout()}
          onOpenMenu={() => setMobileNavigationOpen(true)}
          profile={profile}
          sidebarCollapsed={sidebarCollapsed}
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
