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
  let defaultLabel = "NOT CONNECTED";

  switch (status) {
    case "LIVE":
      styleClass = styles.statusLive;
      defaultLabel = "LIVE";
      break;
    case "READY":
      styleClass = styles.statusLive;
      defaultLabel = "READY";
      break;
    case "AVAILABLE":
      styleClass = styles.statusAvailable;
      defaultLabel = "AVAILABLE";
      break;
    case "PARTIAL":
      styleClass = styles.statusPartial;
      defaultLabel = "PARTIAL";
      break;
    case "NOT_CONNECTED":
      styleClass = styles.statusNotConnected;
      defaultLabel = "NOT CONNECTED";
      break;
    case "NEEDS_TELEMETRY":
      styleClass = styles.statusNeedsTelemetry;
      defaultLabel = "NEEDS TELEMETRY";
      break;
    case "BLOCKED":
      styleClass = styles.statusBlocked;
      defaultLabel = "BLOCKED";
      break;
  }

  return (
    <span className={`${styles.statusBadge} ${styleClass}`}>
      <span aria-hidden="true" className={styles.dot} />
      <span>{label ?? defaultLabel}</span>
    </span>
  );
}
