"use client";

import React from "react";
import { Check, Circle } from "lucide-react";
import type { ExecutiveLoadingTask } from "../types";
import styles from "../executive-dashboard.module.css";

interface ExecutiveDashboardSkeletonProps {
  readonly loadingTasks?: readonly ExecutiveLoadingTask[];
  readonly completedCount?: number;
  readonly totalCount?: number;
  readonly percent?: number;
}

export function ExecutiveDashboardSkeleton({
  loadingTasks = [],
  completedCount = 0,
  totalCount = 3,
  percent = 0,
}: ExecutiveDashboardSkeletonProps) {
  return (
    <div
      className={styles.skeletonContainer}
      role="status"
      aria-live="polite"
      aria-label="Menyiapkan Pusat Kendali Eksekutif"
    >
      {/* Real Loading Progress Banner */}
      <div className={styles.loadingBanner}>
        <div className={styles.loadingBannerHeader}>
          <div>
            <h2 className={styles.loadingBannerTitle}>Menyiapkan Pusat Kendali Eksekutif</h2>
            <p className={styles.loadingBannerSubtitle}>
              Memeriksa sumber data kanonis: <strong>{completedCount}</strong> dari <strong>{totalCount}</strong> selesai ({percent}%)
            </p>
          </div>
        </div>

        {/* Real Progress Bar */}
        <div className={styles.loadingProgressTrack}>
          <div
            className={styles.loadingProgressFill}
            style={{ width: `${percent}%` }}
          />
        </div>

        {/* Checklist of Real Requests */}
        {loadingTasks.length > 0 && (
          <div className={styles.loadingTaskList}>
            {loadingTasks.map((t) => (
              <div key={t.id} className={styles.loadingTaskItem}>
                {t.completed ? (
                  <Check size={14} className={styles.loadingCheckCompleted} aria-hidden="true" />
                ) : (
                  <Circle size={14} className={styles.loadingCheckPending} aria-hidden="true" />
                )}
                <span className={t.completed ? styles.loadingTextCompleted : styles.loadingTextPending}>
                  {t.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Header Skeleton */}
      <div className={styles.skeletonHeader}>
        <div className={`${styles.skeletonPulse} ${styles.skeletonBreadcrumb}`} />
        <div className={`${styles.skeletonPulse} ${styles.skeletonPageTitle}`} />
        <div className={`${styles.skeletonPulse} ${styles.skeletonPageSubtitle}`} />
        <div className={styles.skeletonContextRow}>
          <div className={`${styles.skeletonPulse} ${styles.skeletonContextItem}`} />
          <div className={`${styles.skeletonPulse} ${styles.skeletonContextItem}`} />
          <div className={`${styles.skeletonPulse} ${styles.skeletonContextItem}`} />
        </div>
      </div>

      {/* Data Status Skeleton */}
      <div className={`${styles.skeletonPulse} ${styles.skeletonStatusBar}`} />

      {/* 6 Headlines Skeleton */}
      <div className={styles.skeletonHeadlineGrid}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={`${styles.skeletonPulse} ${styles.skeletonHeadlineCard}`} />
        ))}
      </div>

      {/* Target Table Skeleton */}
      <div className={styles.skeletonTableCard}>
        <div className={`${styles.skeletonPulse} ${styles.skeletonTableHeader}`} />
        <div className={styles.skeletonTableRows}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={`${styles.skeletonPulse} ${styles.skeletonTableRow}`} />
          ))}
        </div>
      </div>

      {/* Domain Panels Skeleton */}
      <div className={styles.skeletonDomainGrid}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={`${styles.skeletonPulse} ${styles.skeletonDomainCard}`} />
        ))}
      </div>
    </div>
  );
}
