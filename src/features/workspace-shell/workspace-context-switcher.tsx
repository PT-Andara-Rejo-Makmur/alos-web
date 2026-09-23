"use client";

import Link from "next/link";
import { ChevronDown, ChevronsUpDown } from "lucide-react";
import type { WorkspaceProjectContext, WorkspaceShellIdentity } from "./types";
import styles from "./workspace-shell.module.css";

function initialLetter(label: string): string {
  const clean = label.trim();
  return clean ? clean.charAt(0).toUpperCase() : "W";
}

export function SidebarWorkspaceSwitcher({
  identity,
}: {
  readonly identity: WorkspaceShellIdentity;
}) {
  return (
    <Link
      aria-label={`Ganti workspace dari ${identity.workspaceLabel}`}
      className={styles.activeWorkspaceCard}
      href="/workspace"
      title="Klik untuk mengganti workspace"
    >
      <div aria-hidden="true" className={styles.workspaceAvatar}>
        {initialLetter(identity.divisionCode || identity.workspaceLabel)}
      </div>
      <div className={styles.workspaceInfo}>
        <span className={styles.workspaceTag}>{identity.workspaceLabel}</span>
        <span className={styles.workspaceRole}>{identity.roleLabel}</span>
      </div>
      <ChevronsUpDown
        aria-hidden="true"
        className={styles.workspaceChevron}
        size={16}
        strokeWidth={2}
      />
    </Link>
  );
}

export function TopbarProjectContext({
  activeProject,
  availableProjects = [],
  onSelectProject,
}: {
  readonly activeProject?: WorkspaceProjectContext | null;
  readonly availableProjects?: readonly WorkspaceProjectContext[];
  readonly onSelectProject?: (projectId: string) => void;
}) {
  if (!activeProject && availableProjects.length === 0) {
    return null;
  }

  const currentProjectName = activeProject?.projectName || availableProjects[0]?.projectName || "";

  return (
    <div
      aria-label={`Context proyek aktif: ${currentProjectName}`}
      className={styles.projectContextPill}
      role="region"
    >
      <span className={styles.projectContextLabel}>Project Context</span>
      <span className={styles.projectContextValue}>{currentProjectName}</span>
      {availableProjects.length > 1 && onSelectProject ? (
        <ChevronDown aria-hidden="true" size={14} strokeWidth={2} />
      ) : null}
    </div>
  );
}
