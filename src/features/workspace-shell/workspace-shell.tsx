"use client";

import { useCallback, useMemo } from "react";
import { sessionApiRequest } from "@/lib/api";

import { WorkspaceMobileNav } from "./workspace-mobile-nav";
import { projectWorkspaceNavigation } from "./workspace-navigation";
import { WorkspaceShellContext } from "./workspace-shell-context";
import { WorkspaceSidebar } from "./workspace-sidebar";
import { WorkspaceTopbar } from "./workspace-topbar";
import type { WorkspaceShellProps } from "./types";
import styles from "./workspace-shell.module.css";

export function WorkspaceShell({
  identity,
  actor = null,
  navigation,
  activeNavKey = "overview",
  activeProject = null,
  availableProjects = [],
  onSelectProject,
  onLogout,
  children,
}: WorkspaceShellProps) {
  // Canonical session logout
  const defaultLogout = useCallback(async () => {
    try {
      await sessionApiRequest("/", { method: "DELETE" });
    } catch {
      // Ignore network failures on logout; clear client regardless
    }
    const origin =
      typeof window !== "undefined" &&
      window.location.origin &&
      window.location.origin !== "null"
        ? window.location.origin
        : "http://localhost:3000";
    window.location.assign(new URL("/login", origin).href);
  }, []);

  const handleLogout = onLogout ?? defaultLogout;

  // Project navigation if not custom supplied
  const effectiveNavigation = useMemo(() => {
    if (navigation && navigation.length > 0) return navigation;
    return projectWorkspaceNavigation(identity, actor);
  }, [navigation, identity, actor]);

  // Context value for children
  const contextValue = useMemo(
    () => ({
      identity,
      actor,
      activeProject,
      availableProjects,
      onSelectProject,
      activeNavKey,
    }),
    [identity, actor, activeProject, availableProjects, onSelectProject, activeNavKey],
  );

  return (
    <WorkspaceShellContext.Provider value={contextValue}>
      <div className={styles.shellRoot}>
        {/* Desktop Sidebar (Dark Obsidian, 280px) */}
        <WorkspaceSidebar
          activeNavKey={activeNavKey}
          identity={identity}
          navigation={effectiveNavigation}
          onLogout={handleLogout}
        />

        {/* Main Content Area */}
        <div className={styles.mainWrapper}>
          {/* Mobile Navigation Header, Drawer, and Bottom Shortcuts */}
          <WorkspaceMobileNav
            activeNavKey={activeNavKey}
            identity={identity}
            navigation={effectiveNavigation}
            onLogout={handleLogout}
          />

          {/* Desktop Topbar (Light Surface, 80px) */}
          <WorkspaceTopbar
            activeProject={activeProject}
            actor={actor}
            availableProjects={availableProjects}
            identity={identity}
            onLogout={handleLogout}
            onSelectProject={onSelectProject}
          />

          {/* Page Content Slot */}
          <main className={styles.contentArea}>
            {children}
          </main>
        </div>
      </div>
    </WorkspaceShellContext.Provider>
  );
}
