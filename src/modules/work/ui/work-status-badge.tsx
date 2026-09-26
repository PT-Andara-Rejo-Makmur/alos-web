"use client";

import React from "react";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";
import styles from "./work-ui.module.css";

interface WorkStatusBadgeProps {
  readonly status?: string | null;
  readonly tone?: "success" | "warning" | "danger" | "info" | "neutral";
}

const STATUS_LABELS: Record<string, string> = {
  // Projects & General
  ON_TRACK: "Tepat Waktu",
  AT_RISK: "Berisiko",
  CRITICAL: "Kritis",
  COMPLETED: "Selesai",

  // Tasks
  DRAFT: "Draf",
  TODO: "Akan Dikerjakan",
  IN_PROGRESS: "Sedang Dikerjakan",
  IN_REVIEW: "Dalam Review",
  DONE: "Selesai",
  CANCELLED: "Dibatalkan",

  // Documents & Approvals
  SUBMITTED: "Diajukan untuk Review",
  CHECKED: "Selesai Diperiksa",
  REVIEWED: "Selesai Ditelaah",
  APPROVED: "Disetujui",
  REJECTED: "Ditolak",
  PENDING: "Menunggu Persetujuan",

  // Findings & Urgency
  OPEN: "Terbuka",
  ACKNOWLEDGED: "Diakui",
  IN_MITIGATION: "Dalam Mitigasi",
  RESOLVED: "Terselesaikan",
  CLOSED: "Ditutup",
  LOW: "Rendah",
  MEDIUM: "Sedang",
  HIGH: "Tinggi",
  URGENT: "Mendesak",

  // Operations
  HEALTHY: "Sehat",
  ATTENTION: "Perlu Perhatian",
  FAILED: "Gagal",
  BLOCKED: "Terblokir",
  OVERDUE: "Terlambat",
};

export const WorkStatusBadge: React.FC<WorkStatusBadgeProps> = ({ status, tone }) => {
  if (!status) {
    return <span className={`${styles.badge} ${styles.badgeNeutral}`}>—</span>;
  }

  const s = status.toUpperCase();

  let resolvedTone = tone;
  if (!resolvedTone) {
    if (["ON_TRACK", "COMPLETED", "DONE", "APPROVED", "HEALTHY", "RESOLVED"].includes(s)) {
      resolvedTone = "success";
    } else if (["AT_RISK", "IN_PROGRESS", "IN_REVIEW", "PENDING", "HIGH", "ATTENTION", "ACKNOWLEDGED"].includes(s)) {
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

  const label = STATUS_LABELS[s] ?? status.replace(/_/g, " ");

  return (
    <span className={`${styles.badge} ${badgeClass}`}>
      {resolvedTone === "success" && <CheckCircle2 size={11} aria-hidden="true" />}
      {resolvedTone === "warning" && <Clock size={11} aria-hidden="true" />}
      {resolvedTone === "danger" && <AlertCircle size={11} aria-hidden="true" />}
      <span>{label}</span>
    </span>
  );
};
