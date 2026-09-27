"use client";

import React from "react";
import { RefreshCw, Calendar, FileText, Clock } from "lucide-react";
import type { StrategyPlan } from "@/lib/contracts";
import { formatDateIndonesian } from "../executive-dashboard-projection";
import styles from "../executive-dashboard.module.css";

interface ExecutivePageHeaderProps {
  readonly activePlan: StrategyPlan | null;
  readonly lastUpdatedTime?: string | null;
  readonly refreshing: boolean;
  readonly onRefresh: () => void;
}

export function ExecutivePageHeader({
  activePlan,
  lastUpdatedTime,
  refreshing,
  onRefresh,
}: ExecutivePageHeaderProps) {
  const periodLabel = activePlan?.period?.label
    ? activePlan.period.label
    : activePlan?.period?.starts_at && activePlan?.period?.ends_at
      ? `${activePlan.period.starts_at.slice(0, 4)}–${activePlan.period.ends_at.slice(0, 4)}`
      : "Periode belum tersedia";

  const planName = activePlan?.name ?? "Belum ada rencana aktif";

  return (
    <header className={styles.headerContainer}>
      <div className={styles.headerTopRow}>
        <div>
          <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
            <span>Eksekutif</span>
            <span aria-hidden="true" style={{ margin: "0 0.4rem" }}>/</span>
            <span className={styles.breadcrumbCurrent}>Ringkasan</span>
          </nav>
          <h1 className={styles.pageTitle}>Pusat Kendali Eksekutif</h1>
          <p className={styles.pageSubtitle}>
            Ringkasan kondisi perusahaan, pencapaian target, pekerjaan yang perlu mendapat perhatian, dan keputusan yang menunggu tindakan pimpinan.
          </p>
        </div>

        <div className={styles.headerActions}>
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            className={styles.refreshButton}
            aria-label="Segarkan seluruh data eksekutif"
          >
            <RefreshCw
              size={15}
              className={refreshing ? styles.spinningIcon : undefined}
              aria-hidden="true"
            />
            <span>{refreshing ? "Memperbarui..." : "Segarkan Data"}</span>
          </button>
        </div>
      </div>

      <div className={styles.contextBar}>
        <div className={styles.contextItem}>
          <Calendar size={14} className={styles.contextIcon} aria-hidden="true" />
          <span className={styles.contextLabel}>Periode Aktif:</span>
          <strong className={styles.contextValue}>{periodLabel}</strong>
        </div>

        <div className={styles.contextItem}>
          <FileText size={14} className={styles.contextIcon} aria-hidden="true" />
          <span className={styles.contextLabel}>Rencana Strategis:</span>
          <strong className={styles.contextValue}>{planName}</strong>
        </div>

        <div className={styles.contextItem}>
          <Clock size={14} className={styles.contextIcon} aria-hidden="true" />
          <span className={styles.contextLabel}>Pembaruan Terakhir:</span>
          <strong className={styles.contextValue}>
            {lastUpdatedTime ? formatDateIndonesian(lastUpdatedTime) : "—"}
          </strong>
        </div>
      </div>
    </header>
  );
}
