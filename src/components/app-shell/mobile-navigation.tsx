"use client";

import { X } from "lucide-react";
import { useEffect, useRef, type RefObject } from "react";

import type { AppShellProfile } from "./app-shell";
import { AppSidebar } from "./app-sidebar";
import styles from "./app-shell.module.css";

interface MobileNavigationProps {
  readonly loggingOut: boolean;
  readonly menuButtonRef: RefObject<HTMLButtonElement | null>;
  readonly onClose: () => void;
  readonly onLogout: () => void;
  readonly open: boolean;
  readonly profile: AppShellProfile;
}

export function MobileNavigation({
  loggingOut,
  menuButtonRef,
  onClose,
  onLogout,
  open,
  profile,
}: MobileNavigationProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);
  const previousOverflow = useRef("");

  useEffect(() => {
    if (!open) {
      if (wasOpen.current) menuButtonRef.current?.focus();
      wasOpen.current = false;
      return;
    }

    wasOpen.current = true;
    previousOverflow.current = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    }

    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.body.style.overflow = previousOverflow.current;
    };
  }, [menuButtonRef, onClose, open]);

  if (!open) return null;

  return (
    <div className={styles.mobileNavigationLayer} role="presentation">
      <button
        aria-label="Tutup navigasi"
        className={styles.mobileNavigationBackdrop}
        onClick={onClose}
        type="button"
      />
      <div
        aria-label="Navigasi mobile"
        aria-modal="true"
        className={styles.mobileNavigationDrawer}
        role="dialog"
      >
        <div className={styles.mobileNavigationHeader}>
          <span className={styles.mobileNavigationTitle}>Menu</span>
          <button
            aria-label="Tutup navigasi"
            className={styles.closeButton}
            onClick={onClose}
            ref={closeButtonRef}
            type="button"
          >
            <X aria-hidden="true" size={20} strokeWidth={1.9} />
          </button>
        </div>
        <AppSidebar
          loggingOut={loggingOut}
          mobile
          onLogout={onLogout}
          onNavigate={onClose}
          profile={profile}
        />
      </div>
    </div>
  );
}
