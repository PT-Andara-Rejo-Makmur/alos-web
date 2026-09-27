"use client";

import { X } from "lucide-react";
import { useId, useRef, type ReactNode, type RefObject } from "react";

import { IconButton } from "./icon-button";
import { useOverlayFocus } from "./overlay-focus";
import styles from "./ui.module.css";

export interface DrawerProps {
  readonly children: ReactNode;
  readonly closeOnOverlayClick?: boolean;
  readonly description?: ReactNode;
  readonly footer?: ReactNode;
  readonly onClose: () => void;
  readonly open: boolean;
  readonly title: ReactNode;
  readonly triggerRef?: RefObject<HTMLElement | null>;
}

export function Drawer({
  children,
  closeOnOverlayClick = true,
  description,
  footer,
  onClose,
  open,
  title,
  triggerRef,
}: DrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const titleId = `alos-drawer-title-${useId().replaceAll(":", "")}`;
  const descriptionId = description ? `${titleId}-description` : undefined;
  useOverlayFocus({ dialogRef: drawerRef, onClose, open, triggerRef });

  if (!open) return null;

  return (
    <div className={styles.overlay}>
      <button
        aria-hidden="true"
        aria-label="Tutup drawer"
        className={styles.overlayBackdrop}
        onClick={closeOnOverlayClick ? onClose : undefined}
        tabIndex={-1}
        type="button"
      />
      <div
        aria-describedby={descriptionId}
        aria-labelledby={titleId}
        aria-modal="true"
        className={styles.drawer}
        ref={drawerRef}
        role="dialog"
        tabIndex={-1}
      >
        <header className={styles.overlayHeader}>
          <div>
            <h2 className={styles.overlayTitle} id={titleId}>{title}</h2>
            {description ? <p className={styles.overlayDescription} id={descriptionId}>{description}</p> : null}
          </div>
          <IconButton icon={<X size={18} strokeWidth={1.9} />} label="Tutup drawer" onClick={onClose} />
        </header>
        <div className={styles.overlayBody}>{children}</div>
        {footer ? <footer className={styles.overlayFooter}>{footer}</footer> : null}
      </div>
    </div>
  );
}
