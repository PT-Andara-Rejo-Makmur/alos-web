"use client";

import { ChevronDown, LogOut, Menu } from "lucide-react";
import { useEffect, useRef, useState, type RefObject } from "react";

import type { AppShellProfile } from "./app-shell";
import styles from "./app-shell.module.css";

interface AppTopbarProps {
  readonly loggingOut: boolean;
  readonly menuButtonRef: RefObject<HTMLButtonElement | null>;
  readonly mobileNavigationOpen: boolean;
  readonly onLogout: () => void;
  readonly onOpenMenu: () => void;
  readonly profile: AppShellProfile;
}

export function AppTopbar({
  loggingOut,
  menuButtonRef,
  mobileNavigationOpen,
  onLogout,
  onOpenMenu,
  profile,
}: AppTopbarProps) {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

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

      <div className={styles.workspaceContext}>
        <span className={styles.workspaceLabel}>Ruang kerja</span>
        <span className={styles.workspaceName}>
          {profile.workspaceName ?? "Ruang kerja belum dipilih"}
        </span>
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
          <span aria-hidden="true" className={styles.avatarTopbar}>
            {profile.initials}
          </span>
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
