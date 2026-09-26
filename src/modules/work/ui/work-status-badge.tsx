"use client";

import React from "react";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";
import styles from "./work-ui.module.css";

interface WorkStatusBadgeProps {
  readonly status?: string | null;
  readonly tone?: "success" | "warning" | "danger" | "info" | "neutral";
}

export const WorkStatusBadge: React.FC<WorkStatusBadgeProps> = ({ status, tone }) => {
  if (!status) {
    return <span className={`${styles.badge} ${styles.badgeNeutral}`}>—</span>;
  }

  const s = status.toUpperCase();

  let resolvedTone = tone;
  if (!resolvedTone) {
    if (["ON_TRACK", "COMPLETED", "DONE", "APPROVED", "HEALTHY", "RESOLVED"].includes(s)) {
      resolvedTone = "success";
    } else if (["AT_RISK", "IN_PROGRESS", "IN_REVIEW", "PENDING", "HIGH", "ATTENTION"].includes(s)) {
      resolvedTone = "warning";
    } else if (["CRITICAL", "REJECTED", "OVERDUE", "FAILED", "BLOCKED"].includes(s)) {
      resolvedTone = "danger";
    } else if (["TODO", "DRAFT", "LOW", "MEDIUM", "INFO"].includes(s)) {
      resolvedTone = "info";
    } else {
      resolvedTone = "neutral";
    }
  }

  const badgeClass =
    resolvedTone === "success"
      ? styles.badgeSuccess
      : resolvedTone === "warning"
        ? styles.badgeWarning
        : resolvedTone === "danger"
          ? styles.badgeDanger
          : resolvedTone === "info"
            ? styles.badgeInfo
            : styles.badgeNeutral;

  return (
    <span className={`${styles.badge} ${badgeClass}`}>
      {resolvedTone === "success" && <CheckCircle2 size={11} aria-hidden="true" />}
      {resolvedTone === "warning" && <Clock size={11} aria-hidden="true" />}
      {resolvedTone === "danger" && <AlertCircle size={11} aria-hidden="true" />}
      <span>{status.replace(/_/g, " ")}</span>
    </span>
  );
};
