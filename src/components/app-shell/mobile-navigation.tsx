"use client";

import { X } from "lucide-react";
import { useRef, type RefObject } from "react";

import { useOverlayFocus } from "@/components/ui/overlay-focus";

import type { AppNavigationSection, AppShellProfile } from "./app-shell";
import { AppSidebar } from "./app-sidebar";
import styles from "./app-shell.module.css";

interface MobileNavigationProps {
  readonly loggingOut: boolean;
  readonly menuButtonRef: RefObject<HTMLButtonElement | null>;
  readonly navigationSections: readonly AppNavigationSection[];
  readonly onClose: () => void;
  readonly onLogout: () => void;
  readonly open: boolean;
  readonly profile: AppShellProfile;
}

export function MobileNavigation({
  loggingOut,
  menuButtonRef,
  navigationSections,
  onClose,
  onLogout,
  open,
  profile,
}: MobileNavigationProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  useOverlayFocus({ dialogRef: drawerRef, onClose, open, triggerRef: menuButtonRef });

  if (!open) return null;

  return (
    <div className={styles.mobileNavigationLayer} role="presentation">
      <button
        aria-hidden="true"
        aria-label="Tutup navigasi"
        className={styles.mobileNavigationBackdrop}
        onClick={onClose}
        type="button"
      />
      <div
        aria-label="Navigasi mobile"
        aria-modal="true"
        className={styles.mobileNavigationDrawer}
        ref={drawerRef}
        role="dialog"
      >
        <div className={styles.mobileNavigationHeader}>
          <span className={styles.mobileNavigationTitle}>Menu</span>
          <button
            aria-label="Tutup navigasi"
            className={styles.closeButton}
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" size={20} strokeWidth={1.9} />
          </button>
        </div>
        <AppSidebar
          loggingOut={loggingOut}
          mobile
          navigationSections={navigationSections}
          onLogout={onLogout}
          onNavigate={onClose}
          profile={profile}
        />
      </div>
    </div>
  );
}
