import { X } from "lucide-react";
import type { ReactNode } from "react";

import { IconButton } from "./icon-button";
import type { StatusVariant } from "./status";
import styles from "./ui.module.css";

export interface AlertProps {
  readonly action?: ReactNode;
  readonly dismissLabel?: string;
  readonly icon?: ReactNode;
  readonly message: ReactNode;
  readonly onDismiss?: () => void;
  readonly role?: "alert" | "status";
  readonly title?: ReactNode;
  readonly variant?: StatusVariant;
}

export function Alert({
  action,
  dismissLabel = "Tutup pesan",
  icon,
  message,
  onDismiss,
  role,
  title,
  variant = "neutral",
}: AlertProps) {
  return (
    <div className={[styles.alert, styles[`alert${capitalize(variant)}`]].join(" ")} role={role ?? (variant === "danger" ? "alert" : "status")}>
      {icon ? <span aria-hidden="true" className={styles.alertIcon}>{icon}</span> : null}
      <div className={styles.alertCopy}>
        {title ? <p className={styles.alertTitle}>{title}</p> : null}
        <p className={styles.alertMessage}>{message}</p>
      </div>
      {action ? <div className={styles.alertAction}>{action}</div> : null}
      {onDismiss ? <IconButton icon={<X size={16} strokeWidth={1.9} />} label={dismissLabel} onClick={onDismiss} /> : null}
    </div>
  );
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
