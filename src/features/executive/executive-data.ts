"use client";

import { useEffect, useState } from "react";

import { ApiError } from "@/lib/api";
import type { PlanningAssumption, StrategyAuthorityProjection, StrategyPlan, BusinessTarget } from "@/lib/contracts";
import { strategyApi } from "@/modules/strategy";

export interface ExecutiveStrategySnapshot {
  readonly assumptions: readonly PlanningAssumption[];
  readonly authority: StrategyAuthorityProjection | null;
  readonly plans: readonly StrategyPlan[];
  readonly targets: readonly BusinessTarget[];
}

export function useExecutiveStrategyData() {
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
  }, []);

  return { data, error, loading, sessionExpired } as const;
}
