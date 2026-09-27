"use client";

import React from "react";
import styles from "../executive-dashboard.module.css";

interface ExecutiveProgressProps {
  readonly label?: string;
  readonly current?: number | null;
  readonly target?: number | null;
  readonly percentage?: number | null;
  readonly unit?: string;
  readonly tone?: "SUCCESS" | "WARNING" | "DANGER" | "INFO" | "NEUTRAL";
  readonly ariaLabel?: string;
  readonly showDetails?: boolean;
}

export function ExecutiveProgress({
  label,
  current,
  target,
  percentage,
  unit,
  tone = "INFO",
  ariaLabel,
  showDetails = true,
}: ExecutiveProgressProps) {
  // Safe calculation of percentage
  let safePct: number | null = null;

  if (percentage !== undefined && percentage !== null && !isNaN(percentage)) {
    safePct = Math.min(100, Math.max(0, percentage));
  } else if (
    current !== undefined &&
    current !== null &&
    target !== undefined &&
    target !== null &&
    !isNaN(current) &&
    !isNaN(target) &&
    target > 0
  ) {
    safePct = Math.min(100, Math.max(0, (current / target) * 100));
  }

  if (safePct === null) {
    return null;
  }

  const formattedPct = `${new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(safePct)}%`;

  let fillClass = styles.progressFillInfo;
  if (tone === "SUCCESS" || safePct >= 100) fillClass = styles.progressFillSuccess;
  else if (tone === "WARNING" || (safePct > 0 && safePct < 70)) fillClass = styles.progressFillWarning;
  else if (tone === "DANGER") fillClass = styles.progressFillDanger;

  return (
    <div
      className={styles.progressContainer}
      role="progressbar"
      aria-label={ariaLabel || label || "Progres capaian"}
      aria-valuenow={Math.round(safePct)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuetext={formattedPct}
    >
      {showDetails && (
        <div className={styles.progressHeader}>
          {label && <span className={styles.progressLabel}>{label}</span>}
          <div className={styles.progressStats}>
            {current !== undefined && current !== null && target !== undefined && target !== null && (
              <span className={styles.progressCounts}>
                {new Intl.NumberFormat("id-ID").format(current)} dari{" "}
                {new Intl.NumberFormat("id-ID").format(target)}
                {unit ? ` ${unit}` : ""}
              </span>
            )}
            <strong className={styles.progressPercent}>{formattedPct}</strong>
          </div>
        </div>
      )}

      <div className={styles.progressTrack}>
        <div
          className={`${styles.progressFill} ${fillClass}`}
          style={{ width: `${safePct}%` }}
        />
      </div>
    </div>
  );
}
