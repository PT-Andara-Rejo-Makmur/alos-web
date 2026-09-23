"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";

import { NotificationCenter } from "@/features/mvp1/components/global-command";
import type { SessionActor } from "@/features/mvp1/lib/governance";
import { TopbarProjectContext } from "./workspace-context-switcher";
import { WorkspaceProfileMenu } from "./workspace-profile-menu";
import type {
  WorkspaceProjectContext,
  WorkspaceShellIdentity,
} from "./types";
import styles from "./workspace-shell.module.css";

export function WorkspaceTopbar({
  identity,
  actor,
  activeProject,
  availableProjects = [],
  onSelectProject,
  onLogout,
}: {
  readonly identity: WorkspaceShellIdentity;
  readonly actor?: SessionActor | null;
  readonly activeProject?: WorkspaceProjectContext | null;
  readonly availableProjects?: readonly WorkspaceProjectContext[];
  readonly onSelectProject?: (projectId: string) => void;
  readonly onLogout?: () => Promise<void> | void;
}) {
  return (
    <header className={styles.topbar}>
      {/* Topbar Left (Workspace title & organization) */}
      <div className={styles.topbarLeft}>
        <span className={styles.topbarWorkspaceTitle}>
          {identity.workspaceLabel}
        </span>
        <span className={styles.topbarOrgSubtitle}>PT Andara Rejo Makmur</span>
      </div>

      {/* Topbar Center (Project Context if verified) */}
      <div className={styles.topbarCenter}>
        <TopbarProjectContext
          activeProject={activeProject}
          availableProjects={availableProjects}
          onSelectProject={onSelectProject}
        />
      </div>

      {/* Topbar Right Actions */}
      <div className={styles.topbarRight}>
        <Link
          aria-label="Buka asisten kecerdasan ARA"
          className={styles.araButton}
          href="/ara"
        >
          <Sparkles aria-hidden="true" size={15} strokeWidth={2} />
          <span>ARA</span>
        </Link>

        {/* Existing NotificationCenter from global-command */}
        <NotificationCenter />

        {/* Profile Dropdown */}
        <WorkspaceProfileMenu
          actor={actor}
          identity={identity}
          onLogout={onLogout}
        />
      </div>
    </header>
  );
}
