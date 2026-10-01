"use client";

import { useEffect, useState } from "react";

import { ApiError } from "@/lib/api";
import type { ExecutiveOverviewProjection, PlanningAssumption, StrategyAuthorityProjection, StrategyPlan, BusinessTarget } from "@/lib/contracts";
import { strategyApi } from "@/modules/strategy";

/** Summary and brief have one governed source. Dedicated Strategy views retain their APIs. */
export function useExecutiveOverview(workspaceKey: string) {
  const [state, setState] = useState<{
    key: string;
    data: ExecutiveOverviewProjection | null;
    error: string | null;
    sessionExpired: boolean;
  } | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    void strategyApi.getExecutiveOverview(controller.signal).then((data) => {
      if (!controller.signal.aborted) setState({ key: workspaceKey, data, error: null, sessionExpired: false });
    }).catch((caught: unknown) => {
      if (!controller.signal.aborted) setState({
        key: workspaceKey,
        data: null,
        error: caught instanceof ApiError && caught.status === 403
          ? "Anda tidak memiliki akses ke proyeksi Executive pada ruang kerja ini."
          : "Data Executive belum dapat dimuat. Silakan coba kembali beberapa saat lagi.",
        sessionExpired: caught instanceof ApiError && caught.status === 401,
      });
    });
    return () => controller.abort();
  }, [workspaceKey]);

  const current = state?.key === workspaceKey ? state : null;
  return { data: current?.data ?? null, error: current?.error ?? null, loading: !current, sessionExpired: current?.sessionExpired ?? false };
}

export interface ExecutiveStrategySnapshot {
  readonly assumptions: readonly PlanningAssumption[];
  readonly authority: StrategyAuthorityProjection | null;
  readonly plans: readonly StrategyPlan[];
  readonly targets: readonly BusinessTarget[];
}

export function useExecutiveStrategyData() {
  const [refresh, setRefresh] = useState(0);
  const [data, setData] = useState<ExecutiveStrategySnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [plans, targets, assumptions, authority] = await Promise.all([
          strategyApi.listPlans(),
          strategyApi.listTargets(),
          strategyApi.listAssumptions(),
          strategyApi.getAuthority(),
        ]);
        if (!cancelled) setData({ plans, targets, assumptions, authority });
      } catch (caught) {
        if (!cancelled) {
          if (caught instanceof ApiError && caught.status === 401) setSessionExpired(true);
          else setError("Data strategi belum dapat dimuat. Silakan coba kembali beberapa saat lagi.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [refresh]);

  return { data, error, loading, sessionExpired, reload: () => { setLoading(true); setError(null); setRefresh((value) => value + 1); } } as const;
}
