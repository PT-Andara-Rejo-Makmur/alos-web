"use client";

import React from "react";
import Link from "next/link";
import { Target, ArrowRight, Activity, Layers, AlertCircle } from "lucide-react";
import type { StrategyContext, StrategySourceState } from "./types";
import styles from "../ui/strategy-ui.module.css";

interface StrategyPerformanceSummaryProps {
  readonly context?: StrategyContext;
  readonly workspaceKey?: string;
  readonly workspaceLabel?: string;
  readonly sourceState?: StrategySourceState;
  readonly workProgressPercent?: number | null;
  readonly kpiAchievementPercent?: number | null;
  readonly objectiveAchievementPercent?: number | null;
  readonly activeInitiativeCount?: number | null;
  readonly reviewAttentionCount?: number | null;
  readonly pendingRevisionCount?: number | null;
}

export const StrategyPerformanceSummary: React.FC<StrategyPerformanceSummaryProps> = ({
  context,
  workspaceKey = "executive",
  sourceState = "NOT_CONNECTED",
  workProgressPercent = null,
  kpiAchievementPercent = null,
  objectiveAchievementPercent = null,
}) => {
  const isSourceConnected = sourceState === "LIVE";
  const resolvedWorkspaceKey = context?.workspaceKey ?? workspaceKey;
  const strategyBaseUrl = `/workspace/${resolvedWorkspaceKey}/strategy`;

  return (
    <section className={styles.summarySection} aria-labelledby="strategy-summary-title">
      <div className={styles.summaryHeader}>
        <div className={styles.summaryTitleArea}>
          <div className={styles.sectionEyebrow}>Keterpaduan Kinerja</div>
          <h3 id="strategy-summary-title" className={styles.summaryTitle}>
            Strategi & Kinerja
          </h3>
          <p className={styles.summarySubtitle}>
            Tiga dimensi kemajuan organisasi yang terpisah: kemajuan operasional, pencapaian KPI, dan realisasi sasaran strategis.
          </p>
        </div>
        <div className={styles.summaryNavAction}>
          <Link href={strategyBaseUrl} className={styles.buttonSecondary}>
            <span>Buka Modul Strategi</span>
            <ArrowRight size={13} aria-hidden="true" />
          </Link>
        </div>
      </div>

      {/* 3 Distinct Progress Dimensions Card */}
      <div className={styles.metricsGridThree}>
        {/* 1. Kemajuan Pekerjaan */}
        <div className={styles.progressDimensionCard}>
          <div className={styles.progressDimensionCardTop}>
            <span className={styles.progressDimensionLabel}>Kemajuan Pekerjaan</span>
            <Activity size={15} className={styles.progressDimensionIcon} aria-hidden="true" />
          </div>
          <div className={styles.progressDimensionValue}>
            {workProgressPercent !== null && workProgressPercent !== undefined
              ? `${Math.round(workProgressPercent)}%`
              : "—"}
          </div>
          <p className={styles.progressDimensionHelper}>
            Agregat penyelesaian proyek dan tugas operasional di lapangan.
          </p>
        </div>

        {/* 2. Capaian KPI */}
        <div className={styles.progressDimensionCard}>
          <div className={styles.progressDimensionCardTop}>
            <span className={styles.progressDimensionLabel}>Capaian KPI</span>
            <Target size={15} className={styles.progressDimensionIcon} aria-hidden="true" />
          </div>
          <div className={styles.progressDimensionValue}>
            {isSourceConnected && kpiAchievementPercent !== null
              ? `${Math.round(kpiAchievementPercent)}%`
              : "—"}
          </div>
          <p className={styles.progressDimensionHelper}>
            {isSourceConnected
              ? "Realisasi indikator kinerja utama terhadap target aktif."
              : "Sumber data KPI resmi belum terhubung."}
          </p>
        </div>

        {/* 3. Capaian Sasaran */}
        <div className={styles.progressDimensionCard}>
          <div className={styles.progressDimensionCardTop}>
            <span className={styles.progressDimensionLabel}>Capaian Sasaran</span>
            <Layers size={15} className={styles.progressDimensionIcon} aria-hidden="true" />
          </div>
          <div className={styles.progressDimensionValue}>
            {isSourceConnected && objectiveAchievementPercent !== null
              ? `${Math.round(objectiveAchievementPercent)}%`
              : "—"}
          </div>
          <p className={styles.progressDimensionHelper}>
            {isSourceConnected
              ? "Tingkat pemenuhan sasaran strategis terbobot."
              : "Sumber sasaran strategis resmi belum terhubung."}
          </p>
        </div>
      </div>

      {/* Source Connection Banner */}
      {!isSourceConnected && (
        <div className={styles.summaryNotice}>
          <AlertCircle size={15} className={styles.summaryNoticeIcon} aria-hidden="true" />
          <div className={styles.summaryNoticeText}>
            <span className={styles.summaryNoticeTitle}>
              Sumber strategi dan KPI belum terhubung
            </span>
            <span className={styles.summaryNoticeDetail}>
              Kemajuan operasional dihitung dari proyek aktif. Capaian KPI dan Sasaran Strategis akan tampil jujur saat Backend terintegrasi.
            </span>
          </div>
        </div>
      )}
    </section>
  );
};
