"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronsUpDown, LogOut, Settings } from "lucide-react";

import type { SessionActor } from "@/features/session";
import type { WorkspaceShellIdentity } from "./types";
import styles from "./workspace-shell.module.css";

function formatDisplayName(actor?: SessionActor | null, fallbackRole?: string): string {
  if (!actor) return "Pengguna ALOS";
  const emailName = (actor as { email?: string }).email?.split("@")[0];
  if (emailName) {
    return emailName.charAt(0).toUpperCase() + emailName.slice(1);
  }
  return fallbackRole || "Pengguna ALOS";
}

function userInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name ? name.substring(0, 2).toUpperCase() : "AL";
}

export function WorkspaceProfileMenu({
  identity,
  actor,
  onLogout,
}: {
  readonly identity: WorkspaceShellIdentity;
  readonly actor?: SessionActor | null;
  readonly onLogout?: () => Promise<void> | void;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const displayName = formatDisplayName(actor, identity.roleLabel);
  const initials = userInitials(displayName);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && open) {
        setOpen(false);
      }
    }

    function handleClickOutside(event: MouseEvent) {
      if (
        open &&
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <div className={styles.profileContainer} ref={containerRef}>
      <button
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Menu profil untuk ${displayName}`}
        className={styles.profileTrigger}
        onClick={() => setOpen((prev) => !prev)}
        type="button"
      >
        <div aria-hidden="true" className={styles.profileAvatar}>
          {initials}
        </div>
        <div className={styles.profileCopy}>
          <span className={styles.profileName}>{displayName}</span>
          <span className={styles.profileRole}>{identity.workspaceLabel}</span>
        </div>
        <ChevronDown
          aria-hidden="true"
          color="#7E848C"
          size={14}
          strokeWidth={2}
          style={{
            transform: open ? "rotate(180deg)" : "rotate(0)",
            transition: "transform 150ms ease",
          }}
        />
      </button>

      {open ? (
        <div aria-label="Menu pengguna" className={styles.profileDropdown} role="menu">
          <div className={styles.dropdownHeader}>
            <div style={{ fontWeight: 600, fontSize: "0.86rem", color: "#1C1D1F" }}>
              {displayName}
            </div>
            <div style={{ fontSize: "0.74rem", color: "#7E848C" }}>
              Workspace aktif: {identity.workspaceLabel}
            </div>
          </div>

          <Link
            className={styles.dropdownItem}
            href="/workspace"
            onClick={() => setOpen(false)}
            role="menuitem"
          >
            <ChevronsUpDown size={15} strokeWidth={1.8} aria-hidden="true" />
            <span>Ganti workspace</span>
          </Link>
          <div className={styles.workspaceRoleContext}>
            <span>Peran pada workspace ini</span>
            <strong>{identity.roleLabel}</strong>
            <small>Pilih workspace lain untuk berpindah ke kelolaan sesuai aksesnya.</small>
          </div>

          <Link
            className={styles.dropdownItem}
            href="/business/settings"
            onClick={() => setOpen(false)}
            role="menuitem"
          >
            <Settings size={15} strokeWidth={1.8} aria-hidden="true" />
            <span>Pengaturan</span>
          </Link>

          {onLogout ? (
            <button
              className={`${styles.dropdownItem} ${styles.logoutItem}`}
              onClick={() => {
                setOpen(false);
                void onLogout();
              }}
              role="menuitem"
              type="button"
            >
              <LogOut size={15} strokeWidth={1.8} aria-hidden="true" />
              <span>Keluar</span>
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
