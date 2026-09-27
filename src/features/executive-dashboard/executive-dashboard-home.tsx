"use client";

import React, { useState } from "react";
import type { BusinessTarget, StrategyPlan } from "@/lib/contracts";
import type {
  DecisionQueueItem,
  DivisionHealthItem,
  ExecutiveCorporateTargetRow,
  ExecutiveDashboardSnapshot,
  ExecutiveDataStatusSummary,
  ExecutiveDomainSummaryCard,
  ExecutiveEarlyWarningItem,
  ExecutiveHeadlineItem,
  ExecutiveRefreshProgress,
} from "./types";
import {
  projectCorporateTargets,
  projectDataStatusSummary,
  projectDecisionQueue,
  projectDivisionHealth,
  projectDomainSummaries,
  projectExecutiveEarlyWarnings,
  projectExecutiveHeadlines,
} from "./executive-dashboard-projection";

import { ExecutivePageHeader } from "./components/executive-page-header";
import { ExecutiveDataStatus } from "./components/executive-data-status";
import { ExecutiveHeadlineStrip } from "./components/executive-headline-strip";
import { ExecutiveTargetPerformance } from "./components/executive-target-performance";
import { ExecutiveDomainSummary } from "./components/executive-domain-summary";
import { ExecutiveAttention } from "./components/executive-attention";
import { ExecutiveDecisionQueue } from "./components/executive-decision-queue";
import { ExecutiveDivisionHealth } from "./components/executive-division-health";
import { ExecutiveGenesisAnalysis } from "./components/executive-genesis-analysis";
import { ExecutiveGovernanceCadence } from "./components/executive-governance-cadence";
import { ExecutiveDetailDrawer, type DrawerType } from "./components/executive-detail-drawer";
import styles from "./executive-dashboard.module.css";

export interface ExecutiveDashboardHomeProps {
  readonly snapshot: ExecutiveDashboardSnapshot;
  readonly activePlan?: StrategyPlan | null;
  readonly rawTargets?: readonly BusinessTarget[];
  readonly corporateTargets?: readonly ExecutiveCorporateTargetRow[];
  readonly headlines?: readonly ExecutiveHeadlineItem[];
  readonly domainSummaries?: readonly ExecutiveDomainSummaryCard[];
  readonly earlyWarnings?: readonly ExecutiveEarlyWarningItem[];
  readonly decisionItems?: readonly DecisionQueueItem[];
  readonly divisionItems?: readonly DivisionHealthItem[];
  readonly dataStatus?: ExecutiveDataStatusSummary;
  readonly lastUpdatedTime?: string | null;
  readonly refreshing?: boolean;
  readonly refreshProgress?: ExecutiveRefreshProgress | null;
  readonly partialError?: string | null;
  readonly onRefresh?: () => void;
  readonly onRetry?: () => void;
}

export function ExecutiveDashboardHome({
  snapshot,
  activePlan = null,
  rawTargets = [],
  corporateTargets: providedCorporateTargets,
  headlines: providedHeadlines,
  domainSummaries: providedDomainSummaries,
  earlyWarnings: providedEarlyWarnings,
  decisionItems: providedDecisionItems,
  divisionItems: providedDivisionItems,
  dataStatus: providedDataStatus,
  lastUpdatedTime = snapshot?.generated_at || null,
  refreshing = false,
  refreshProgress = null,
  partialError = null,
  onRefresh = () => {},
  onRetry,
}: ExecutiveDashboardHomeProps) {
  const [drawerState, setDrawerState] = useState<DrawerType>(null);

  const isSnapshotConnected = Boolean(snapshot && snapshot.generated_at);
  const isStrategyConnected = rawTargets.length > 0 || Boolean(activePlan);

  // Projections fallback if not provided via hook
  const headlines =
    providedHeadlines ??
    projectExecutiveHeadlines(
      isSnapshotConnected ? snapshot : null,
      rawTargets,
      activePlan ? [activePlan] : [],
      isSnapshotConnected,
    );

  const corporateTargets =
    providedCorporateTargets ?? projectCorporateTargets(rawTargets);

  const domainSummaries =
    providedDomainSummaries ??
    projectDomainSummaries(
      isSnapshotConnected ? snapshot : null,
      isSnapshotConnected,
    );

  const earlyWarnings =
    providedEarlyWarnings ??
    (isSnapshotConnected ? projectExecutiveEarlyWarnings(snapshot) : []);

  const decisionItems =
    providedDecisionItems ??
    (isSnapshotConnected ? projectDecisionQueue(snapshot) : []);

  const divisionItems =
    providedDivisionItems ??
    (isSnapshotConnected ? projectDivisionHealth(snapshot) : []);

  const dataStatus =
    providedDataStatus ??
    projectDataStatusSummary(
      isSnapshotConnected,
      isStrategyConnected,
      lastUpdatedTime,
    );

  const activeWorkflowsCount = divisionItems.reduce(
    (sum, d) => sum + (d.active_genesis_workflows || 0),
    0,
  );

  return (
    <div className={styles.container}>
      {/* 01. Header & Konteks Perusahaan */}
      <ExecutivePageHeader
        activePlan={activePlan}
        lastUpdatedTime={lastUpdatedTime}
        refreshing={refreshing}
        refreshProgress={refreshProgress}
        onRefresh={onRefresh}
      />

      {/* 02. Status Data Perusahaan */}
      <ExecutiveDataStatus
        summary={dataStatus}
        partialError={partialError}
        onOpenSourceDrawer={() =>
          setDrawerState({ kind: "SOURCES", sources: dataStatus.sources })
        }
        onRetry={onRetry}
      />

      {/* 03. Ringkasan Utama Perusahaan (6 Headlines) */}
      <ExecutiveHeadlineStrip headlines={headlines} />

      {/* 04. Pencapaian Target Perusahaan (Stage 2 Data) */}
      <ExecutiveTargetPerformance
        targets={corporateTargets}
        onSelectTarget={(target) => setDrawerState({ kind: "TARGET", target })}
      />

      {/* 05 - 10. Ringkasan Domain Operasional (6 Area Bisnis) */}
      <ExecutiveDomainSummary
        summaries={domainSummaries}
        onSelectDomain={(domain) => setDrawerState({ kind: "DOMAIN", domain })}
      />

      {/* 11. Peringatan Dini */}
      <ExecutiveAttention warnings={earlyWarnings} />

      {/* 12. Keputusan Menunggu */}
      <ExecutiveDecisionQueue items={decisionItems} />

      {/* 13. Status Operasional Divisi */}
      <ExecutiveDivisionHealth divisions={divisionItems} />

      {/* 14. Analisis GENESIS */}
      <ExecutiveGenesisAnalysis activeWorkflows={activeWorkflowsCount} />

      {/* 15. Ritme Pelaporan & Tata Kelola */}
      <ExecutiveGovernanceCadence />

      {/* Detail Drawer for target, sources, or domain */}
      <ExecutiveDetailDrawer
        drawerState={drawerState}
        onClose={() => setDrawerState(null)}
      />
    </div>
  );
}

export function ExecutiveHomeDashboard({
  dashboard,
  snapshot,
}: {
  readonly dashboard?: ExecutiveDashboardSnapshot;
  readonly snapshot?: ExecutiveDashboardSnapshot;
}) {
  return <ExecutiveDashboardHome snapshot={(dashboard ?? snapshot)!} />;
}
