"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronsUpDown, LogOut, Menu, Sparkles, X } from "lucide-react";

import { NotificationCenter } from "@/features/notifications/notification-center";
import {
  getWorkspaceRoot,
  getWorkspaceAraRoute,
  getWorkspaceModuleRoute,
  getWorkspaceAgentsRoute,
} from "@/features/workspace-routing";
import { WORKSPACE_ICONS } from "./workspace-navigation";
import type {
  WorkspaceNavItem,
  WorkspaceShellIdentity,
} from "./types";
import styles from "./workspace-shell.module.css";

export function WorkspaceMobileNav({
  identity,
  navigation,
  activeNavKey = "overview",
  onLogout,
}: {
  readonly identity: WorkspaceShellIdentity;
  readonly navigation: readonly WorkspaceNavItem[];
  readonly activeNavKey?: string;
  readonly onLogout?: () => Promise<void> | void;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Close on Escape & lock body scroll
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && drawerOpen) {
        setDrawerOpen(false);
      }
    }

    if (drawerOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [drawerOpen]);

  return (
    <>
      {/* Compact Top Header for Mobile */}
      <header className={styles.mobileHeader}>
        <Link
          className={styles.mobileBrand}
          href={getWorkspaceRoot(identity.workspaceKey)}
        >
          <Image
            alt="ALOS logo mark"
            className={styles.mobileBrandMark}
            height={28}
            src="/brand/alos-logo-mark.png"
            width={28}
          />
          <div className={styles.mobileBrandText}>
            <span className={styles.mobileBrandTitle}>ALOS</span>
            <span className={styles.mobileWorkspaceLabel}>
              {identity.workspaceLabel}
            </span>
          </div>
        </Link>

        <div className={styles.mobileHeaderActions}>
          <Link
            aria-label="Buka ARA"
            className={styles.mobileIconButton}
            href={getWorkspaceAraRoute(identity.workspaceKey)}
          >
            <Sparkles size={20} strokeWidth={2} color="#D1A357" />
          </Link>

          <NotificationCenter />

          <button
            aria-expanded={drawerOpen}
            aria-label="Buka menu navigasi utama"
            className={styles.mobileIconButton}
            onClick={() => setDrawerOpen(true)}
            type="button"
          >
            <Menu size={22} strokeWidth={2} />
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {drawerOpen ? (
        <>
          <div
            aria-hidden="true"
            className={styles.drawerBackdrop}
            onClick={() => setDrawerOpen(false)}
          />
          <div
            aria-label="Navigasi Menu Lengkap"
            aria-modal="true"
            className={styles.drawerSheet}
            role="dialog"
          >
            <div className={styles.drawerHeader}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <strong style={{ fontSize: "1rem", color: "#FFFFFF" }}>
                  {identity.workspaceLabel}
                </strong>
                <small style={{ fontSize: "0.75rem", color: "#D1A357" }}>
                  {identity.roleLabel}
                </small>
              </div>
              <button
                aria-label="Tutup menu navigasi"
                className={styles.mobileIconButton}
                onClick={() => setDrawerOpen(false)}
                type="button"
              >
                <X size={22} strokeWidth={2} />
              </button>
            </div>

            <div className={styles.drawerContent}>
              <nav aria-label="Navigasi Ruang Kerja Mobile" className={styles.navSection}>
                {navigation.map((item) => {
                  if (item.visibility === "HIDDEN") return null;

                  const IconComponent = WORKSPACE_ICONS[item.icon] || WORKSPACE_ICONS.LayoutDashboard;
                  const isActive = activeNavKey === item.key;
                  const isNavigable = item.navigable !== false && Boolean(item.href);

                  if (!isNavigable || !item.href) {
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
                      onClick={() => setDrawerOpen(false)}
                    >
                      <div aria-hidden="true" className={styles.navIconWrap}>
                        <IconComponent size={18} strokeWidth={isActive ? 2.2 : 1.8} />
                      </div>
                      <span className={styles.navLabel}>{item.label}</span>
                      {item.availability === "BLOCKED" ? (
                        <span className={styles.notConnectedBadge}>Belum terhubung</span>
                      ) : item.badge && item.badge > 0 ? (
                        <span className={styles.navBadge}>{item.badge}</span>
                      ) : null}
                    </Link>
                  );
                })}
              </nav>

              <div className={styles.sidebarFooter} style={{ marginTop: 24 }}>
                <Link
                  className={styles.footerButton}
                  href="/workspace"
                  onClick={() => setDrawerOpen(false)}
                >
                  <ChevronsUpDown size={16} strokeWidth={1.8} aria-hidden="true" />
                  <span>Ganti workspace</span>
                </Link>

                {onLogout ? (
                  <button
                    className={styles.footerButton}
                    onClick={() => {
                      setDrawerOpen(false);
                      void onLogout();
                    }}
                    type="button"
                  >
                    <LogOut size={16} strokeWidth={1.8} aria-hidden="true" />
                    <span>Keluar</span>
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </>
      ) : null}

      {/* Fixed Bottom Navigation */}
      <nav aria-label="Navigasi Bawah Ringkas" className={styles.bottomNav}>
        {activeNavKey === "agents" ? (
          <>
            <Link
              className={styles.bottomNavItem}
              href={getWorkspaceRoot(identity.workspaceKey)}
            >
              <div className={styles.bottomNavIconCircle}>O</div>
              <span>Overview</span>
            </Link>

            <Link
              className={styles.bottomNavItem}
              href={getWorkspaceModuleRoute(identity.workspaceKey, "tasks")}
            >
              <div className={styles.bottomNavIconCircle}>W</div>
              <span>Work</span>
            </Link>

            <Link
              className={styles.bottomNavItem}
              href={getWorkspaceAraRoute(identity.workspaceKey)}
            >
              <div className={styles.bottomNavIconCircle}>AI</div>
              <span>ARA</span>
            </Link>

            <Link
              aria-current="page"
              className={`${styles.bottomNavItem} ${styles.activeBottomItem}`}
              href={getWorkspaceAgentsRoute(identity.workspaceKey)}
            >
              <div className={styles.bottomNavIconCircle}>B</div>
              <span>Agents</span>
            </Link>

            <button
              aria-label="Buka seluruh menu"
              className={styles.bottomNavItem}
              onClick={() => setDrawerOpen(true)}
              type="button"
            >
              <div className={styles.bottomNavIconCircle}>M</div>
              <span>Menu</span>
            </button>
          </>
        ) : identity.workspaceKey === "executive" ? (
          <>
            <Link
              aria-current={activeNavKey === "overview" ? "page" : undefined}
              className={`${styles.bottomNavItem} ${activeNavKey === "overview" ? styles.activeBottomItem : ""}`}
              href="/workspace/executive"
            >
              <div className={styles.bottomNavIconCircle}>O</div>
              <span>Overview</span>
            </Link>

            <Link
              aria-current={activeNavKey === "approvals" ? "page" : undefined}
              className={`${styles.bottomNavItem} ${activeNavKey === "approvals" ? styles.activeBottomItem : ""}`}
              href="/workspace/executive/approvals"
            >
              <div className={styles.bottomNavIconCircle}>D</div>
              <span>Decisions</span>
            </Link>

            <Link
              aria-current={activeNavKey === "divisions" ? "page" : undefined}
              className={`${styles.bottomNavItem} ${activeNavKey === "divisions" ? styles.activeBottomItem : ""}`}
              href="/workspace/executive/divisions"
            >
              <div className={styles.bottomNavIconCircle}>V</div>
              <span>Divisions</span>
            </Link>

            <Link
              aria-current={activeNavKey === "ara" ? "page" : undefined}
              className={`${styles.bottomNavItem} ${activeNavKey === "ara" ? styles.activeBottomItem : ""}`}
              href="/workspace/executive/ara"
            >
              <div className={styles.bottomNavIconCircle}>AI</div>
              <span>AI</span>
            </Link>

            <button
              aria-label="Buka seluruh menu"
              className={styles.bottomNavItem}
              onClick={() => setDrawerOpen(true)}
              type="button"
            >
              <div className={styles.bottomNavIconCircle}>M</div>
              <span>Menu</span>
            </button>
          </>
        ) : identity.workspaceKey === "finance" ? (
          <>
            <Link
              aria-current={activeNavKey === "overview" ? "page" : undefined}
              className={`${styles.bottomNavItem} ${activeNavKey === "overview" ? styles.activeBottomItem : ""}`}
              href="/workspace/finance"
            >
              <div className={styles.bottomNavIconCircle}>O</div>
              <span>Overview</span>
            </Link>

            <Link
              aria-current={activeNavKey === "cash" ? "page" : undefined}
              className={`${styles.bottomNavItem} ${activeNavKey === "cash" ? styles.activeBottomItem : ""}`}
              href="/workspace/finance/cash"
            >
              <div className={styles.bottomNavIconCircle}>C</div>
              <span>Cash</span>
            </Link>

            <Link
              aria-current={activeNavKey === "approvals" ? "page" : undefined}
              className={`${styles.bottomNavItem} ${activeNavKey === "approvals" ? styles.activeBottomItem : ""}`}
              href="/workspace/finance/approvals"
            >
              <div className={styles.bottomNavIconCircle}>A</div>
              <span>Approval</span>
            </Link>

            <Link
              aria-current={activeNavKey === "ara" ? "page" : undefined}
              className={`${styles.bottomNavItem} ${activeNavKey === "ara" ? styles.activeBottomItem : ""}`}
              href="/workspace/finance/ara"
            >
              <div className={styles.bottomNavIconCircle}>AI</div>
              <span>AI</span>
            </Link>

            <button
              aria-label="Buka seluruh menu"
              className={styles.bottomNavItem}
              onClick={() => setDrawerOpen(true)}
              type="button"
            >
              <div className={styles.bottomNavIconCircle}>M</div>
              <span>Menu</span>
            </button>
          </>
        ) : identity.workspaceKey === "property" ? (
          <>
            <Link
              aria-current={activeNavKey === "overview" ? "page" : undefined}
              className={`${styles.bottomNavItem} ${activeNavKey === "overview" ? styles.activeBottomItem : ""}`}
              href="/workspace/property"
            >
              <div className={styles.bottomNavIconCircle}>O</div>
              <span>Overview</span>
            </Link>

            <Link
              aria-current={activeNavKey === "projects" ? "page" : undefined}
              className={`${styles.bottomNavItem} ${activeNavKey === "projects" ? styles.activeBottomItem : ""}`}
              href="/workspace/property/projects"
            >
              <div className={styles.bottomNavIconCircle}>P</div>
              <span>Projects</span>
            </Link>

            <Link
              aria-current={activeNavKey === "risk" ? "page" : undefined}
              className={`${styles.bottomNavItem} ${activeNavKey === "risk" ? styles.activeBottomItem : ""}`}
              href="/workspace/property#risk"
            >
              <div className={styles.bottomNavIconCircle}>R</div>
              <span>Risk</span>
            </Link>

            <Link
              aria-current={activeNavKey === "ara" ? "page" : undefined}
              className={`${styles.bottomNavItem} ${activeNavKey === "ara" ? styles.activeBottomItem : ""}`}
              href="/workspace/property/ara"
            >
              <div className={styles.bottomNavIconCircle}>AI</div>
              <span>AI</span>
            </Link>

            <button
              aria-label="Buka seluruh menu"
              className={styles.bottomNavItem}
              onClick={() => setDrawerOpen(true)}
              type="button"
            >
              <div className={styles.bottomNavIconCircle}>M</div>
              <span>Menu</span>
            </button>
          </>
        ) : identity.workspaceKey === "sales" ? (
          <>
            <Link
              aria-current={activeNavKey === "overview" ? "page" : undefined}
              className={`${styles.bottomNavItem} ${activeNavKey === "overview" ? styles.activeBottomItem : ""}`}
              href="/workspace/sales"
            >
              <div className={styles.bottomNavIconCircle}>O</div>
              <span>Overview</span>
            </Link>

            <Link
              aria-current={activeNavKey === "leads" ? "page" : undefined}
              className={`${styles.bottomNavItem} ${activeNavKey === "leads" ? styles.activeBottomItem : ""}`}
              href="/workspace/sales/leads"
            >
              <div className={styles.bottomNavIconCircle}>L</div>
              <span>Leads</span>
            </Link>

            <Link
              aria-current={activeNavKey === "follow-up" ? "page" : undefined}
              className={`${styles.bottomNavItem} ${activeNavKey === "follow-up" ? styles.activeBottomItem : ""}`}
              href="/workspace/sales/follow-up"
            >
              <div className={styles.bottomNavIconCircle}>F</div>
              <span>Follow-up</span>
            </Link>

            <Link
              aria-current={activeNavKey === "ara" ? "page" : undefined}
              className={`${styles.bottomNavItem} ${activeNavKey === "ara" ? styles.activeBottomItem : ""}`}
              href="/workspace/sales/ara"
            >
              <div className={styles.bottomNavIconCircle}>AI</div>
              <span>AI</span>
            </Link>

            <button
              aria-label="Buka seluruh menu"
              className={styles.bottomNavItem}
              onClick={() => setDrawerOpen(true)}
              type="button"
            >
              <div className={styles.bottomNavIconCircle}>M</div>
              <span>Menu</span>
            </button>
          </>
        ) : identity.workspaceKey === "hr" ? (
          <>
            <Link
              aria-current={activeNavKey === "overview" ? "page" : undefined}
              className={`${styles.bottomNavItem} ${activeNavKey === "overview" ? styles.activeBottomItem : ""}`}
              href="/workspace/hr"
            >
              <div className={styles.bottomNavIconCircle}>O</div>
              <span>Overview</span>
            </Link>

            <Link
              aria-current={activeNavKey === "employees" || activeNavKey === "people" ? "page" : undefined}
              className={`${styles.bottomNavItem} ${activeNavKey === "employees" || activeNavKey === "people" ? styles.activeBottomItem : ""}`}
              href="/workspace/hr/employees"
            >
              <div className={styles.bottomNavIconCircle}>P</div>
              <span>People</span>
            </Link>

            <Link
              aria-current={activeNavKey === "training" ? "page" : undefined}
              className={`${styles.bottomNavItem} ${activeNavKey === "training" ? styles.activeBottomItem : ""}`}
              href="/workspace/hr/training"
            >
              <div className={styles.bottomNavIconCircle}>T</div>
              <span>Training</span>
            </Link>

            <Link
              aria-current={activeNavKey === "ara" ? "page" : undefined}
              className={`${styles.bottomNavItem} ${activeNavKey === "ara" ? styles.activeBottomItem : ""}`}
              href="/workspace/hr/ara"
            >
              <div className={styles.bottomNavIconCircle}>AI</div>
              <span>AI</span>
            </Link>

            <button
              aria-label="Buka seluruh menu"
              className={styles.bottomNavItem}
              onClick={() => setDrawerOpen(true)}
              type="button"
            >
              <div className={styles.bottomNavIconCircle}>M</div>
              <span>Menu</span>
            </button>
          </>
        ) : identity.workspaceKey === "legal" ? (
          <>
            <Link
              aria-current={activeNavKey === "overview" ? "page" : undefined}
              className={`${styles.bottomNavItem} ${activeNavKey === "overview" ? styles.activeBottomItem : ""}`}
              href="/workspace/legal"
            >
              <div className={styles.bottomNavIconCircle}>O</div>
              <span>Overview</span>
            </Link>

            <Link
              aria-current={activeNavKey === "permits" ? "page" : undefined}
              className={`${styles.bottomNavItem} ${activeNavKey === "permits" ? styles.activeBottomItem : ""}`}
              href="/workspace/legal/permits"
            >
              <div className={styles.bottomNavIconCircle}>P</div>
              <span>Permits</span>
            </Link>

            <Link
              aria-current={activeNavKey === "contracts" ? "page" : undefined}
              className={`${styles.bottomNavItem} ${activeNavKey === "contracts" ? styles.activeBottomItem : ""}`}
              href="/workspace/legal/contracts"
            >
              <div className={styles.bottomNavIconCircle}>C</div>
              <span>Contracts</span>
            </Link>

            <Link
              aria-current={activeNavKey === "ara" ? "page" : undefined}
              className={`${styles.bottomNavItem} ${activeNavKey === "ara" ? styles.activeBottomItem : ""}`}
              href="/workspace/legal/ara"
            >
              <div className={styles.bottomNavIconCircle}>AI</div>
              <span>AI</span>
            </Link>

            <button
              aria-label="Buka seluruh menu"
              className={styles.bottomNavItem}
              onClick={() => setDrawerOpen(true)}
              type="button"
            >
              <div className={styles.bottomNavIconCircle}>M</div>
              <span>Menu</span>
            </button>
          </>
        ) : identity.workspaceKey === "it" ? (
          <>
            <Link
              aria-current={activeNavKey === "overview" ? "page" : undefined}
              className={`${styles.bottomNavItem} ${activeNavKey === "overview" ? styles.activeBottomItem : ""}`}
              href="/workspace/it"
            >
              <div className={styles.bottomNavIconCircle}>O</div>
              <span>Overview</span>
            </Link>

            <Link
              aria-current={activeNavKey === "systems" ? "page" : undefined}
              className={`${styles.bottomNavItem} ${activeNavKey === "systems" ? styles.activeBottomItem : ""}`}
              href="/workspace/it/systems"
            >
              <div className={styles.bottomNavIconCircle}>S</div>
              <span>Systems</span>
            </Link>

            <Link
              aria-current={activeNavKey === "genesis" || activeNavKey === "control-plane" ? "page" : undefined}
              className={`${styles.bottomNavItem} ${activeNavKey === "genesis" || activeNavKey === "control-plane" ? styles.activeBottomItem : ""}`}
              href="/workspace/it/genesis"
            >
              <div className={styles.bottomNavIconCircle}>G</div>
              <span>Genesis</span>
            </Link>

            <Link
              aria-current={activeNavKey === "security" ? "page" : undefined}
              className={`${styles.bottomNavItem} ${activeNavKey === "security" ? styles.activeBottomItem : ""}`}
              href="/workspace/it/security"
            >
              <div className={styles.bottomNavIconCircle}>X</div>
              <span>Security</span>
            </Link>

            <button
              aria-label="Buka seluruh menu"
              className={styles.bottomNavItem}
              onClick={() => setDrawerOpen(true)}
              type="button"
            >
              <div className={styles.bottomNavIconCircle}>M</div>
              <span>Menu</span>
            </button>
          </>
        ) : (
          <>
            <Link
              aria-current={activeNavKey === "overview" ? "page" : undefined}
              className={`${styles.bottomNavItem} ${activeNavKey === "overview" ? styles.activeBottomItem : ""}`}
              href={getWorkspaceRoot(identity.workspaceKey)}
            >
              <div className={styles.bottomNavIconCircle}>O</div>
              <span>Overview</span>
            </Link>

            <Link
              aria-current={activeNavKey === "projects" || activeNavKey === "tasks" ? "page" : undefined}
              className={`${styles.bottomNavItem} ${activeNavKey === "projects" || activeNavKey === "tasks" ? styles.activeBottomItem : ""}`}
              href={getWorkspaceModuleRoute(identity.workspaceKey, "tasks")}
            >
              <div className={styles.bottomNavIconCircle}>W</div>
              <span>Work</span>
            </Link>

            <Link
              aria-current={activeNavKey === "approvals" ? "page" : undefined}
              className={`${styles.bottomNavItem} ${activeNavKey === "approvals" ? styles.activeBottomItem : ""}`}
              href={getWorkspaceModuleRoute(identity.workspaceKey, "approvals")}
            >
              <div className={styles.bottomNavIconCircle}>A</div>
              <span>Approval</span>
            </Link>

            <Link
              aria-current={activeNavKey === "ara" ? "page" : undefined}
              className={`${styles.bottomNavItem} ${activeNavKey === "ara" ? styles.activeBottomItem : ""}`}
              href={getWorkspaceAraRoute(identity.workspaceKey)}
            >
              <div className={styles.bottomNavIconCircle}>AI</div>
              <span>AI</span>
            </Link>

            <button
              aria-label="Buka seluruh menu"
              className={styles.bottomNavItem}
              onClick={() => setDrawerOpen(true)}
              type="button"
            >
              <div className={styles.bottomNavIconCircle}>M</div>
              <span>Menu</span>
            </button>
          </>
        )}
      </nav>
    </>
  );
}
