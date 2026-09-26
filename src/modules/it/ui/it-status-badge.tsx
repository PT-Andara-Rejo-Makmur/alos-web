import React from "react";
import styles from "./it-ui.module.css";

export type ItStatusType =
  | "LIVE"
  | "READY"
  | "AVAILABLE"
  | "PARTIAL"
  | "NOT_CONNECTED"
  | "NEEDS_TELEMETRY"
  | "BLOCKED";

export interface ItStatusBadgeProps {
  readonly status: ItStatusType;
  readonly label?: string;
}

export function ItStatusBadge({ status, label }: ItStatusBadgeProps) {
  let styleClass = styles.statusNotConnected;
  let defaultLabel = "BELUM TERHUBUNG";

  switch (status) {
    case "LIVE":
      styleClass = styles.statusLive;
      defaultLabel = "AKTIF";
      break;
    case "READY":
      styleClass = styles.statusLive;
      defaultLabel = "SIAP";
      break;
    case "AVAILABLE":
      styleClass = styles.statusAvailable;
      defaultLabel = "TERSEDIA";
      break;
    case "PARTIAL":
      styleClass = styles.statusPartial;
      defaultLabel = "SEBAGIAN";
      break;
    case "NOT_CONNECTED":
      styleClass = styles.statusNotConnected;
      defaultLabel = "BELUM TERHUBUNG";
      break;
    case "NEEDS_TELEMETRY":
      styleClass = styles.statusNeedsTelemetry;
      defaultLabel = "MEMERLUKAN TELEMETRI";
      break;
    case "BLOCKED":
      styleClass = styles.statusBlocked;
      defaultLabel = "TERBLOKIR";
      break;
  }

  return (
    <span className={`${styles.statusBadge} ${styleClass}`}>
      <span aria-hidden="true" className={styles.dot} />
      <span>{label ?? defaultLabel}</span>
    </span>
  );
}
