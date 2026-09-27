"use client";

import Image from "next/image";
import Link from "next/link";
import { LogOut, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { usePathname } from "next/navigation";

import { Avatar } from "@/components/ui";

import type { AppNavigationSection, AppShellProfile } from "./app-shell";
import styles from "./app-shell.module.css";

interface AppSidebarProps {
  readonly collapsed?: boolean;
  readonly loggingOut: boolean;
  readonly mobile?: boolean;
  readonly navigationSections: readonly AppNavigationSection[];
  readonly onLogout: () => void;
  readonly onNavigate?: () => void;
  readonly onToggleSidebar?: () => void;
  readonly profile: AppShellProfile;
}

export function AppSidebar({
  collapsed = false,
  loggingOut,
  mobile = false,
  navigationSections,
  onLogout,
  onNavigate,
  onToggleSidebar,
  profile,
}: AppSidebarProps) {
  const pathname = usePathname() ?? "";
  const visuallyCollapsed = collapsed && !mobile;

  return (
    <aside
      aria-label="Navigasi utama"
      className={[styles.sidebar, mobile ? styles.mobileSidebar : "", visuallyCollapsed ? styles.sidebarCollapsed : ""]
        .filter(Boolean)
        .join(" ")}
    >
      <div className={styles.sidebarHeader}>
        <div className={styles.sidebarHeaderRow}>
          <Link aria-label="ALOS" className={styles.logoLink} href="/workspace" onClick={onNavigate}>
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
          {!mobile && onToggleSidebar ? (
            <button
              aria-label={visuallyCollapsed ? "Buka sidebar" : "Tutup sidebar"}
              aria-pressed={visuallyCollapsed}
              className={styles.sidebarToggle}
              onClick={onToggleSidebar}
              type="button"
            >
              {visuallyCollapsed ? (
                <PanelLeftOpen aria-hidden="true" size={18} strokeWidth={1.9} />
              ) : (
                <PanelLeftClose aria-hidden="true" size={18} strokeWidth={1.9} />
              )}
            </button>
          ) : null}
        </div>
      </div>

      <nav aria-label="Menu aplikasi" className={styles.navigation}>
        {navigationSections.map((section) => (
          <div className={styles.navigationSection} key={section.label}>
            <p className={styles.sectionLabel}>{section.label}</p>
            {section.items.map((item) => {
              const active = pathname === item.href || (item.href !== "/workspace" && pathname.startsWith(`${item.href}/`));
              const Icon = item.icon;
              return (
                <Link
                  aria-current={active ? "page" : undefined}
                  aria-label={item.label}
                  className={[styles.navigationItem, active ? styles.navigationItemActive : ""].filter(Boolean).join(" ")}
                  href={item.href}
                  key={item.href}
                  onClick={onNavigate}
                  title={visuallyCollapsed ? item.label : undefined}
                >
                  <Icon aria-hidden="true" size={18} strokeWidth={1.9} />
                  <span className={styles.navigationItemLabel}>{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className={styles.sidebarFooter}>
        <div className={styles.profileSummary}>
          <Avatar initials={profile.initials} size="sm" />
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
          aria-label={loggingOut ? "Keluar…" : "Keluar"}
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
