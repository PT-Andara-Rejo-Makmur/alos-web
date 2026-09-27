"use client";

import React from "react";
import { AlertTriangle, ChevronRight } from "lucide-react";
import type { ExecutiveDataStatusSummary } from "../types";
import styles from "../executive-dashboard.module.css";

interface ExecutiveDataStatusProps {
  readonly summary: ExecutiveDataStatusSummary;
  readonly partialError?: string | null;
  readonly onOpenSourceDrawer: () => void;
  readonly onRetry?: () => void;
}

export function ExecutiveDataStatus({
  summary,
  partialError,
  onOpenSourceDrawer,
  onRetry,
}: ExecutiveDataStatusProps) {
  const parts: string[] = [];
  if (summary.liveCount > 0) parts.push(`${summary.liveCount} terkini`);
  if (summary.partialCount > 0) parts.push(`${summary.partialCount} sebagian tersedia`);
  if (summary.notConnectedCount > 0) parts.push(`${summary.notConnectedCount} belum terhubung`);
  if (summary.staleCount > 0) parts.push(`${summary.staleCount} perlu diperbarui`);
  if (summary.errorCount > 0) parts.push(`${summary.errorCount} gagal memuat`);

  return (
    <div className={styles.dataStatusWrapper}>
      {partialError && (
        <div className={styles.partialErrorBanner} role="alert">
          <AlertTriangle size={16} aria-hidden="true" />
          <span>{partialError}</span>
          {onRetry && (
            <button type="button" onClick={onRetry} className={styles.retryInlineButton}>
              Coba Lagi
            </button>
          )}
        </div>
      )}

      <div className={styles.dataStatusBar} role="region" aria-label="Status Kesiapan Data Perusahaan">
        <div className={styles.dataStatusLeft}>
          <div className={styles.dataStatusBadge}>
            <span
              className={`${styles.statusDot} ${
                summary.liveCount > 0 ? styles.dotSuccess : styles.dotPartial
              }`}
              aria-hidden="true"
            />
            <span className={styles.dataStatusTitle}>Status Data</span>
          </div>

          <div className={styles.dataStatusCounts}>
            <span>
              <strong>{summary.inspectedCount}</strong> sumber diperiksa melalui request
            </span>
            <span aria-hidden="true" className={styles.dataStatusDivider}>·</span>
            <span>{parts.join(" · ")}</span>
            <span aria-hidden="true" className={styles.dataStatusDivider}>·</span>
            <span style={{ color: "var(--workspace-muted, #7e848c)" }}>
              {summary.catalogUnconnectedCount} sumber domain terdaftar belum terhubung
            </span>
          </div>
        </div>

        <div className={styles.dataStatusRight}>
          <button
            type="button"
            onClick={onOpenSourceDrawer}
            className={styles.viewSourcesButton}
          >
            <span>Lihat Status Sumber</span>
            <ChevronRight size={14} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
