import React from "react";
import Link from "next/link";
import { AlertCircle, type LucideIcon } from "lucide-react";
import { ItStatusBadge, type ItStatusType } from "./it-status-badge";
import styles from "./it-ui.module.css";

export interface ItUnavailableSurfaceProps {
  readonly eyebrow?: string;
  readonly title: string;
  readonly description?: string;
  readonly readiness?: {
    readonly availability: string;
    readonly blockReason?: string;
  };
  readonly backHref?: string;
  readonly backLabel?: string;
  readonly action?: React.ReactNode;
  readonly icon?: LucideIcon;
}

export function ItUnavailableSurface({
  eyebrow,
  title,
  description,
  readiness,
  backHref,
  backLabel,
  action,
  icon: Icon = AlertCircle,
}: ItUnavailableSurfaceProps) {
  const status = (readiness?.availability ?? "BLOCKED") as ItStatusType;
  const label = readiness?.blockReason
    ? `BLOCKED · ${readiness.blockReason}`
    : readiness?.availability ?? "BLOCKED";

  return (
    <section
      aria-label={`Modul ${title} Belum Tersedia`}
      className={styles.unavailableSurface}
      role="status"
    >
      <div className={styles.unavailableIconWrap}>
        <Icon aria-hidden={true} size={24} strokeWidth={2} />
      </div>

      {eyebrow && <span className={styles.unavailableEyebrow}>{eyebrow}</span>}

      <div className={styles.unavailableBadge}>
        <ItStatusBadge label={label} status={status} />
      </div>

      <h2 className={styles.unavailableTitle}>{title}</h2>

      {description && (
        <p className={styles.unavailableDescription}>{description}</p>
      )}

      {action ? (
        action
      ) : backHref ? (
        <Link className={styles.unavailableAction} href={backHref}>
          {backLabel ?? "← Kembali"}
        </Link>
      ) : null}
    </section>
  );
}
