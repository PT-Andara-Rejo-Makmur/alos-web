"use client";

import { Check, ChevronDown, LogOut, Menu } from "lucide-react";
import { useEffect, useRef, useState, type RefObject } from "react";

import { Avatar } from "@/components/ui";
import type { WorkspaceAccessProjection } from "@/lib/contracts";

import type { AppShellProfile } from "./app-shell";
import styles from "./app-shell.module.css";

interface AppTopbarProps {
  readonly loggingOut: boolean;
  readonly menuButtonRef: RefObject<HTMLButtonElement | null>;
  readonly mobileNavigationOpen: boolean;
  readonly onLogout: () => void;
  readonly onOpenMenu: () => void;
  readonly onSwitchWorkspace: (workspace: WorkspaceAccessProjection) => void;
  readonly profile: AppShellProfile;
  readonly switchingWorkspace: boolean;
  readonly workspaceSwitchError: string | null;
}

export function AppTopbar({
  loggingOut,
  menuButtonRef,
  mobileNavigationOpen,
  onLogout,
  onOpenMenu,
  onSwitchWorkspace,
  profile,
  switchingWorkspace,
  workspaceSwitchError,
}: AppTopbarProps) {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const workspaceMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!profileMenuOpen) return;

    function closeOnOutsideClick(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, [profileMenuOpen]);

  useEffect(() => {
    if (!workspaceMenuOpen) return;

    function closeOnOutsideClick(event: MouseEvent) {
      if (workspaceMenuRef.current && !workspaceMenuRef.current.contains(event.target as Node)) {
        setWorkspaceMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, [workspaceMenuOpen]);

  function logoutFromMenu() {
    setProfileMenuOpen(false);
    onLogout();
  }

  return (
    <header className={styles.topbar}>
      <button
        aria-expanded={mobileNavigationOpen}
        aria-label="Buka navigasi"
        className={styles.menuButton}
        onClick={onOpenMenu}
        ref={menuButtonRef}
        type="button"
      >
        <Menu aria-hidden="true" size={20} strokeWidth={1.9} />
      </button>

      <div className={styles.workspaceSwitcher} ref={workspaceMenuRef}>
        <button
          aria-expanded={workspaceMenuOpen}
          aria-haspopup="menu"
          aria-label="Pilih workspace"
          className={styles.workspaceTrigger}
          disabled={profile.workspaceAccess.length < 2 || switchingWorkspace}
          onClick={() => setWorkspaceMenuOpen((open) => !open)}
          type="button"
        >
          <span className={styles.workspaceContext}>
            <span className={styles.workspaceLabel}>Ruang kerja</span>
            <span className={styles.workspaceName}>
              {profile.workspaceName ?? "Ruang kerja belum dipilih"}
            </span>
          </span>
          {profile.workspaceAccess.length > 1 ? <ChevronDown aria-hidden="true" size={16} strokeWidth={1.9} /> : null}
        </button>

        {workspaceMenuOpen && profile.workspaceAccess.length > 1 ? (
          <div className={styles.workspaceMenu} role="menu">
            <div className={styles.workspaceMenuHeader}>
              <span className={styles.workspaceMenuTitle}>Pilih workspace</span>
              <span className={styles.workspaceMenuHint}>Akses berasal dari Backend</span>
            </div>
            {profile.workspaceAccess.filter((access) => access.active && access.workspace.active).map((access) => {
              const active = access.workspace.workspace_id === profile.activeWorkspaceId;
              return (
                <button
                  aria-checked={active}
                  className={[styles.workspaceMenuItem, active ? styles.workspaceMenuItemActive : ""].filter(Boolean).join(" ")}
                  disabled={switchingWorkspace}
                  key={access.workspace.workspace_id}
                  onClick={() => {
                    setWorkspaceMenuOpen(false);
                    onSwitchWorkspace(access);
                  }}
                  role="menuitemradio"
                  type="button"
                >
                  <span className={styles.workspaceMenuItemCopy}>
                    <span className={styles.workspaceMenuItemName}>{access.workspace.workspace_name}</span>
                    <span className={styles.workspaceMenuItemMeta}>{access.workspace.workspace_key} · {access.workspace.workspace_type}</span>
                  </span>
                  {active ? <Check aria-hidden="true" size={16} strokeWidth={2} /> : null}
                </button>
              );
            })}
            {workspaceSwitchError ? <p className={styles.workspaceMenuError} role="alert">{workspaceSwitchError}</p> : null}
          </div>
        ) : null}
      </div>

      <div className={styles.profileMenuWrapper} ref={profileMenuRef}>
        <button
          aria-expanded={profileMenuOpen}
          aria-haspopup="menu"
          aria-label="Buka profil pengguna"
          className={styles.profileTrigger}
          onClick={() => setProfileMenuOpen((open) => !open)}
          type="button"
        >
          <Avatar initials={profile.initials} size="sm" />
          <span className={styles.profileTriggerName}>
            {profile.displayName ?? "Profil pengguna"}
          </span>
          <ChevronDown aria-hidden="true" size={16} strokeWidth={1.9} />
        </button>

        {profileMenuOpen ? (
          <div className={styles.profileMenu} role="menu">
            <div className={styles.profileMenuSummary}>
              <span className={styles.profileMenuName}>{profile.displayName ?? "Profil pengguna"}</span>
              {profile.email ? <span className={styles.profileMenuEmail}>{profile.email}</span> : null}
            </div>
            <button
              className={styles.profileMenuLogout}
              disabled={loggingOut}
              onClick={logoutFromMenu}
              role="menuitem"
              type="button"
            >
              <LogOut aria-hidden="true" size={16} strokeWidth={1.9} />
              <span>{loggingOut ? "Keluar…" : "Keluar"}</span>
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
}
