"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronsUpDown, LogOut, Settings } from "lucide-react";

import { SidebarWorkspaceSwitcher } from "./workspace-context-switcher";
import { WORKSPACE_ICONS } from "./workspace-navigation";
import type {
  WorkspaceNavGroup,
  WorkspaceNavItem,
  WorkspaceShellIdentity,
} from "./types";
import styles from "./workspace-shell.module.css";

const GROUP_ORDER: readonly WorkspaceNavGroup[] = [
  "COMMAND_CENTER",
  "UTAMA",
  "PROJECT",
  "SALES",
  "MARKETING",
  "CUSTOMER",
  "PEOPLE",
  "DEVELOPMENT",
  "EMPLOYEE_RELATIONS",
  "KEUANGAN",
  "LEGAL",
  "COMPLIANCE",
  "ALOS_PLATFORM",
  "ENGINEERING",
  "OPERATIONS",
  "GENESIS",
  "GOVERNANCE",
  "CONTROL",
  "ORGANIZATION",
  "DIVISION",
  "DECISIONS",
  "PEKERJAAN",
  "INFORMATION",
  "AI",
];

function getGroupLabel(group: WorkspaceNavGroup, divisionCode: string | null): string {
  switch (group) {
    case "COMMAND_CENTER":
      return "COMMAND CENTER";
    case "PROJECT":
      return "PROJECT";
    case "SALES":
      return "SALES";
    case "MARKETING":
      return "MARKETING";
    case "CUSTOMER":
      return "CUSTOMER";
    case "PEOPLE":
      return "PEOPLE";
    case "DEVELOPMENT":
      return "DEVELOPMENT";
    case "EMPLOYEE_RELATIONS":
      return "EMPLOYEE RELATIONS";
    case "KEUANGAN":
      return "KEUANGAN";
    case "LEGAL":
      return "LEGAL";
    case "COMPLIANCE":
      return "COMPLIANCE";
    case "ALOS_PLATFORM":
      return "ALOS PLATFORM";
    case "ENGINEERING":
      return "ENGINEERING";
    case "OPERATIONS":
      return "OPERATIONS";
    case "GENESIS":
      return "GENESIS";
    case "GOVERNANCE":
      return "GOVERNANCE";
    case "ORGANIZATION":
      return "ORGANIZATION";
    case "DECISIONS":
      return "DECISIONS";
    case "INFORMATION":
      return "INFORMATION";
    case "DIVISION":
      return divisionCode || "DIVISI";
    case "AI":
      return "AI";
    case "CONTROL":
      return "CONTROL";
    default:
      return group;
  }
}

export function WorkspaceSidebar({
  identity,
  navigation,
  activeNavKey = "overview",
  onLogout,
  availableWorkspaceCount = 1,
}: {
  readonly identity: WorkspaceShellIdentity;
  readonly navigation: readonly WorkspaceNavItem[];
  readonly activeNavKey?: string;
  readonly onLogout?: () => Promise<void> | void;
  readonly availableWorkspaceCount?: number;
}) {
  // Group navigation items by group key
  const grouped = GROUP_ORDER.map((group) => ({
    group,
    label: getGroupLabel(group, identity.divisionCode),
    items: navigation.filter((item) => item.group === group),
  })).filter((section) => section.items.length > 0);

  return (
    <aside aria-label="Sidebar ALOS" className={styles.sidebar}>
      <div className={styles.sidebarInner}>
        {/* Brand Header */}
        <Link
          aria-label="ALOS Beranda"
          className={styles.brandHeader}
          href={
            identity.workspaceKey === "executive"
              ? "/workspace/executive"
              : identity.workspaceKey === "finance"
                ? "/workspace/finance"
                : identity.workspaceKey === "property"
                  ? "/workspace/property"
                  : identity.workspaceKey === "sales"
                    ? "/workspace/sales"
                    : identity.workspaceKey === "hr"
                      ? "/workspace/hr"
                      : identity.workspaceKey === "legal"
                        ? "/workspace/legal"
                        : identity.workspaceKey === "it"
                          ? "/workspace/it"
                          : "/business"
          }
        >
          <Image
            alt="Logo Mark ALOS"
            className={styles.brandMark}
            height={38}
            priority
            src="/brand/alos-logo-mark.png"
            width={38}
          />
          <div className={styles.brandText}>
            <span className={styles.brandTitle}>ALOS</span>
            <span className={styles.brandSubtitle}>
              ANDARA LEAN OPERATING SYSTEM
            </span>
          </div>
        </Link>

        {/* Active Workspace Card */}
        <SidebarWorkspaceSwitcher identity={identity} availableWorkspaceCount={availableWorkspaceCount} />

        {/* Grouped Navigation */}
        <nav aria-label="Navigasi Ruang Kerja" className={styles.navSection}>
          {grouped.map(({ group, label, items }) => (
            <div className={styles.navGroup} key={group}>
              <div className={styles.navGroupHeader}>{label}</div>
              {items.map((item) => {
                if (item.visibility === "HIDDEN") return null;

                const IconComponent = WORKSPACE_ICONS[item.icon] || WORKSPACE_ICONS.LayoutDashboard;
                const isActive = activeNavKey === item.key;
                const isReady =
                  item.availability === "READY" ||
                  (item.availability === undefined && item.available !== false && Boolean(item.href));

                if (!isReady || !item.href) {
                  return (
                    <div
                      aria-disabled="true"
                      className={`${styles.navItem} ${styles.disabledItem}`}
                      key={item.key}
                      role="button"
                      tabIndex={0}
                      title="Belum tersedia — Menunggu integrasi sistem"
                    >
                      <div aria-hidden="true" className={styles.navIconWrap}>
                        <IconComponent size={18} strokeWidth={1.8} />
                      </div>
                      <span className={styles.navLabel}>{item.label}</span>
                      <span className={styles.disabledBadge}>Belum tersedia</span>
                    </div>
                  );
                }

                return (
                  <Link
                    aria-current={isActive ? "page" : undefined}
                    className={`${styles.navItem} ${isActive ? styles.activeNavItem : ""}`}
                    href={item.href}
                    key={item.key}
                  >
                    {isActive ? (
                      <span aria-hidden="true" className={styles.activeIndicator} />
                    ) : null}
                    <div aria-hidden="true" className={styles.navIconWrap}>
                      <IconComponent size={18} strokeWidth={isActive ? 2.2 : 1.8} />
                    </div>
                    <span className={styles.navLabel}>{item.label}</span>
                    {item.badge && item.badge > 0 ? (
                      <span className={styles.navBadge}>{item.badge}</span>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className={styles.sidebarFooter}>
          {availableWorkspaceCount > 1 ? <Link
            className={styles.footerButton}
            href="/business/settings"
            title="Pengaturan akun & sistem"
          >
            <Settings size={16} strokeWidth={1.8} aria-hidden="true" />
            <span>Pengaturan</span>
          </Link> : null}

          <Link
            className={styles.footerButton}
            href="/workspace"
            title="Pindah ke workspace lain"
          >
            <ChevronsUpDown size={16} strokeWidth={1.8} aria-hidden="true" />
            <span>Ganti workspace</span>
          </Link>

          {onLogout ? (
            <button
              className={styles.footerButton}
              onClick={() => void onLogout()}
              type="button"
            >
              <LogOut size={16} strokeWidth={1.8} aria-hidden="true" />
              <span>Keluar</span>
            </button>
          ) : null}

          <div className={styles.footerMotto}>
            Building Better Living<br />
            for a Brighter Tomorrow
          </div>
        </div>
      </div>
    </aside>
  );
}
