"use client";

import { useCallback, useEffect, useState } from "react";
import { authenticatedApiRequest } from "@/lib/api";
import type { BusinessTarget, StrategyPlan } from "@/lib/contracts";
import { strategyApi } from "@/modules/strategy/backend/strategy-api";

import {
  createEmptyExecutiveSnapshot,
  projectCorporateTargets,
  projectDataStatusSummary,
  projectDecisionQueue,
  projectDivisionHealth,
  projectDomainSummaries,
  projectExecutiveEarlyWarnings,
  projectExecutiveHeadlines,
} from "./executive-dashboard-projection";
import type {
  DecisionQueueItem,
  DivisionHealthItem,
  ExecutiveCorporateTargetRow,
  ExecutiveDashboardSnapshot,
  ExecutiveDataStatusSummary,
  ExecutiveDomainSummaryCard,
  ExecutiveEarlyWarningItem,
  ExecutiveHeadlineItem,
  ExecutiveLoadingTask,
} from "./types";

export interface UseExecutiveOverviewResult {
  readonly initialLoading: boolean;
  readonly refreshing: boolean;
  readonly error: string | null;
  readonly partialRefreshError: string | null;
  readonly loadingTasks: readonly ExecutiveLoadingTask[];
  readonly loadingCompletedCount: number;
  readonly loadingTotalCount: number;
  readonly loadingPercent: number;
  readonly snapshot: ExecutiveDashboardSnapshot;
  readonly isSnapshotConnected: boolean;
  readonly isStrategyConnected: boolean;
  readonly activePlan: StrategyPlan | null;
  readonly corporateTargets: readonly ExecutiveCorporateTargetRow[];
  readonly rawTargets: readonly BusinessTarget[];
  readonly headlines: readonly ExecutiveHeadlineItem[];
  readonly domainSummaries: readonly ExecutiveDomainSummaryCard[];
  readonly earlyWarnings: readonly ExecutiveEarlyWarningItem[];
  readonly decisionItems: readonly DecisionQueueItem[];
  readonly divisionItems: readonly DivisionHealthItem[];
  readonly dataStatus: ExecutiveDataStatusSummary;
  readonly lastUpdatedTime: string | null;
  readonly refresh: () => Promise<void>;
  readonly retry: () => void;
}

const INITIAL_TASKS: readonly ExecutiveLoadingTask[] = [
  { id: "auth", label: "Konteks pengguna & otorisasi", completed: true },
  { id: "strategy", label: "Rencana & target perusahaan", completed: false },
  { id: "operational", label: "Ringkasan operasional eksekutif", completed: false },
];

export function useExecutiveOverview(
  initialSnapshot?: ExecutiveDashboardSnapshot | null,
): UseExecutiveOverviewResult {
  const [snapshot, setSnapshot] = useState<ExecutiveDashboardSnapshot>(
    initialSnapshot ?? createEmptyExecutiveSnapshot(),
  );
  const [isSnapshotConnected, setIsSnapshotConnected] = useState<boolean>(
    Boolean(initialSnapshot && initialSnapshot.generated_at),
  );
  const [isStrategyConnected, setIsStrategyConnected] = useState<boolean>(false);
  const [plans, setPlans] = useState<readonly StrategyPlan[]>([]);
  const [targets, setTargets] = useState<readonly BusinessTarget[]>([]);

  const [initialLoading, setInitialLoading] = useState<boolean>(!initialSnapshot);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [partialRefreshError, setPartialRefreshError] = useState<string | null>(null);
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string | null>(
    initialSnapshot?.generated_at || null,
  );

  const [loadingTasks, setLoadingTasks] = useState<readonly ExecutiveLoadingTask[]>(INITIAL_TASKS);
  const [reloadTrigger, setReloadTrigger] = useState<number>(0);

  const updateTaskStatus = (taskId: string, completed: boolean) => {
    setLoadingTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed } : t)),
    );
  };

  const refresh = useCallback(async () => {
    if (refreshing) return;
    setRefreshing(true);
    setPartialRefreshError(null);

    let operationalError = false;
    let strategyError = false;

    try {
      const [loadedPlans, loadedTargets] = await Promise.all([
        strategyApi.listPlans().catch((err) => {
          if ((err as { status?: number })?.status === 404) return [];
          throw err;
        }),
        strategyApi.listTargets().catch((err) => {
          if ((err as { status?: number })?.status === 404) return [];
          throw err;
        }),
      ]);
      setPlans(loadedPlans);
      setTargets(loadedTargets);
      setIsStrategyConnected(true);
      updateTaskStatus("strategy", true);
    } catch {
      strategyError = true;
      setIsStrategyConnected(false);
      updateTaskStatus("strategy", true);
    }

    try {
      const loadedSnapshot = await authenticatedApiRequest<ExecutiveDashboardSnapshot>(
        "/api/v1/executive-dashboard",
      );
      setSnapshot(loadedSnapshot);
      setIsSnapshotConnected(true);
      setLastUpdatedTime(loadedSnapshot.generated_at || new Date().toISOString());
      updateTaskStatus("operational", true);
    } catch (err) {
      const status = (err as { status?: number })?.status;
      if (status === 404) {
        setSnapshot(createEmptyExecutiveSnapshot());
        setIsSnapshotConnected(false);
      } else {
        operationalError = true;
      }
      updateTaskStatus("operational", true);
    }

    setRefreshing(false);
    if (operationalError || strategyError) {
      setPartialRefreshError(
        "Sebagian data gagal diperbarui. Data terakhir yang tersedia tetap ditampilkan.",
      );
    } else {
      setLastUpdatedTime(new Date().toISOString());
    }
  }, [refreshing]);

  useEffect(() => {
    let isCancelled = false;
    const controller = new AbortController();

    async function execute() {
      let operationalError = false;

      // 1. Fetch Stage 2 Strategy Plans and Targets
      try {
        const [loadedPlans, loadedTargets] = await Promise.all([
          strategyApi.listPlans(controller.signal).catch((err) => {
            if ((err as { status?: number })?.status === 404) return [];
            throw err;
          }),
          strategyApi.listTargets(controller.signal).catch((err) => {
            if ((err as { status?: number })?.status === 404) return [];
            throw err;
          }),
        ]);

        if (!isCancelled) {
          setPlans(loadedPlans);
          setTargets(loadedTargets);
          setIsStrategyConnected(true);
          updateTaskStatus("strategy", true);
        }
      } catch {
        if (!isCancelled) {
          setIsStrategyConnected(false);
          updateTaskStatus("strategy", true);
        }
      }

      // 2. Fetch Executive Operational Snapshot
      try {
        const loadedSnapshot = await authenticatedApiRequest<ExecutiveDashboardSnapshot>(
          "/api/v1/executive-dashboard",
          { signal: controller.signal },
        );

        if (!isCancelled) {
          setSnapshot(loadedSnapshot);
          setIsSnapshotConnected(true);
          setLastUpdatedTime(loadedSnapshot.generated_at || new Date().toISOString());
          updateTaskStatus("operational", true);
        }
      } catch (err) {
        if (!isCancelled) {
          const status = (err as { status?: number })?.status;
          if (status === 404) {
            setSnapshot(createEmptyExecutiveSnapshot());
            setIsSnapshotConnected(false);
          } else {
            operationalError = true;
          }
          updateTaskStatus("operational", true);
        }
      }

      if (!isCancelled) {
        setInitialLoading(false);
        if (operationalError && !isSnapshotConnected) {
          setError(
            "Ringkasan eksekutif belum dapat dimuat. Silakan coba lagi beberapa saat.",
          );
        }
      }
    }

    void execute();

    return () => {
      isCancelled = true;
      controller.abort();
    };
  }, [reloadTrigger, isSnapshotConnected]);

  const retry = useCallback(() => {
    setInitialLoading(true);
    setError(null);
    setLoadingTasks(INITIAL_TASKS);
    setReloadTrigger((prev) => prev + 1);
  }, []);

  const completedCount = loadingTasks.filter((t) => t.completed).length;
  const totalCount = loadingTasks.length;
  const loadingPercent = Math.round((completedCount / totalCount) * 100);

  // Active plan selection (prefer ACTIVE, then UNDER_REVIEW, then latest)
  const activePlan =
    plans.find((p) => p.lifecycle_state === "ACTIVE") ??
    plans.find((p) => p.lifecycle_state === "UNDER_REVIEW") ??
    plans[0] ??
    null;

  // View models
  const corporateTargets = projectCorporateTargets(targets);
  const headlines = projectExecutiveHeadlines(
    isSnapshotConnected ? snapshot : null,
    targets,
    plans,
    isSnapshotConnected,
  );
  const domainSummaries = projectDomainSummaries(
    isSnapshotConnected ? snapshot : null,
    isSnapshotConnected,
  );
  const earlyWarnings = isSnapshotConnected
    ? projectExecutiveEarlyWarnings(snapshot)
    : [];
  const decisionItems = isSnapshotConnected ? projectDecisionQueue(snapshot) : [];
  const divisionItems = isSnapshotConnected ? projectDivisionHealth(snapshot) : [];
  const dataStatus = projectDataStatusSummary(
    isSnapshotConnected,
    isStrategyConnected,
    lastUpdatedTime,
  );

  return {
    initialLoading,
    refreshing,
    error,
    partialRefreshError,
    loadingTasks,
    loadingCompletedCount: completedCount,
    loadingTotalCount: totalCount,
    loadingPercent,
    snapshot,
    isSnapshotConnected,
    isStrategyConnected,
    activePlan,
    corporateTargets,
    rawTargets: targets,
    headlines,
    domainSummaries,
    earlyWarnings,
    decisionItems,
    divisionItems,
    dataStatus,
    lastUpdatedTime,
    refresh,
    retry,
  };
}
