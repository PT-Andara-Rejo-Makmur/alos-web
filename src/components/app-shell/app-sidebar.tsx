import Image from "next/image";
import Link from "next/link";
import { House, LogOut } from "lucide-react";

import type { AppShellProfile } from "./app-shell";
import styles from "./app-shell.module.css";

interface AppSidebarProps {
  readonly loggingOut: boolean;
  readonly mobile?: boolean;
  readonly onLogout: () => void;
  readonly onNavigate?: () => void;
  readonly profile: AppShellProfile;
}

export function AppSidebar({
  loggingOut,
  mobile = false,
  onLogout,
  onNavigate,
  profile,
}: AppSidebarProps) {
  return (
    <aside
      aria-label="Navigasi utama"
      className={`${styles.sidebar} ${mobile ? styles.mobileSidebar : ""}`}
    >
      <div className={styles.sidebarHeader}>
        <Link className={styles.logoLink} href="/workspace" onClick={onNavigate}>
          <Image
            alt=""
            className={styles.logoMark}
            height={32}
            priority
            src="/brand/alos-logo-mark.png"
            width={32}
          />
          <span className={styles.logoName}>ALOS</span>
        </Link>
      </div>

      <nav aria-label="Menu aplikasi" className={styles.navigation}>
        <p className={styles.sectionLabel}>UTAMA</p>
        <Link
          aria-current="page"
          className={styles.navigationItemActive}
          href="/workspace"
          onClick={onNavigate}
        >
          <House aria-hidden="true" size={18} strokeWidth={1.9} />
          <span>Beranda</span>
        </Link>
      </nav>

      <div className={styles.sidebarFooter}>
        <div className={styles.profileSummary}>
          <span aria-hidden="true" className={styles.avatar}>
            {profile.initials}
          </span>
          <span className={styles.profileDetails}>
            <span className={styles.profileName}>{profile.displayName ?? "Profil pengguna"}</span>
            {profile.workspaceName || profile.email ? (
              <span className={styles.profileEmail}>
                {profile.workspaceName ?? profile.email}
              </span>
            ) : null}
          </span>
        </div>
        <button
          className={styles.logoutButton}
          disabled={loggingOut}
          onClick={onLogout}
          type="button"
        >
          <LogOut aria-hidden="true" size={16} strokeWidth={1.9} />
          <span>{loggingOut ? "Keluar…" : "Keluar"}</span>
        </button>
      </div>
    </aside>
  );
}
