"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { AppShell } from "@/components/app-shell/app-shell";
import type { SessionProjection } from "@/features/session";
import { ApiError, sessionApiRequest } from "@/lib/api";
import { strategyApi } from "@/modules/strategy";

import { executiveNavigation } from "./navigation";
import { ExecutiveDashboard } from "./executive-dashboard";
import type { ExecutiveStrategyData } from "./executive-model";
import { hasExecutiveContext } from "./executive-model";
import styles from "./executive-dashboard.module.css";

type AccessState = "loading" | "ready" | "no_access" | "session_expired";

export function ExecutiveDashboardPage() {
  const router = useRouter();
  const [accessState, setAccessState] = useState<AccessState>("loading");
  const [session, setSession] = useState<SessionProjection | null>(null);
  const [strategyData, setStrategyData] = useState<ExecutiveStrategyData | null>(null);
  const [strategyLoading, setStrategyLoading] = useState(true);
  const [strategyError, setStrategyError] = useState<string | undefined>();

  const loadStrategy = useCallback(async () => {
    setStrategyLoading(true);
    setStrategyError(undefined);
    try {
      const [plans, targets] = await Promise.all([strategyApi.listPlans(), strategyApi.listTargets()]);
      setStrategyData({ plans, targets });
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 401) {
        setSession(null);
        setAccessState("session_expired");
      } else {
        setStrategyError("Silakan coba kembali.");
      }
    } finally {
      setStrategyLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadSession() {
      try {
        const nextSession = await sessionApiRequest<SessionProjection>("/");
        if (cancelled) return;
        if (!nextSession.authenticated || !nextSession.principal) {
          setAccessState("no_access");
          return;
        }
        if (!hasExecutiveContext(nextSession)) {
          setAccessState("no_access");
          return;
        }
        setSession(nextSession);
        setAccessState("ready");
        void loadStrategy();
      } catch (caught) {
        if (!cancelled) {
          setAccessState(caught instanceof ApiError && caught.status === 401 ? "session_expired" : "no_access");
        }
      }
    }

    void loadSession();
    return () => {
      cancelled = true;
    };
  }, [loadStrategy]);

  if (accessState === "ready" && session) {
    return (
      <AppShell navigationSections={executiveNavigation} session={session}>
        <ExecutiveDashboard
          data={strategyData}
          errorMessage={strategyError}
          loading={strategyLoading}
          onRefresh={() => void loadStrategy()}
          refreshing={strategyLoading && strategyData !== null}
        />
      </AppShell>
    );
  }

  return (
    <main className={styles.stateContainer}>
      <div className={styles.stateCard}>
        <p className={styles.stateBrand}>ALOS</p>
        {accessState === "loading" ? (
          <p aria-live="polite" className={styles.stateText}>Memeriksa hak akses…</p>
        ) : accessState === "session_expired" ? (
          <>
            <h1 className={styles.stateTitle}>Sesi Anda sudah berakhir.</h1>
            <p className={styles.stateText}>Silakan masuk kembali untuk melanjutkan.</p>
            <button className={styles.primaryButton} onClick={() => router.replace("/login")} type="button">
              Masuk kembali
            </button>
          </>
        ) : (
          <>
            <h1 className={styles.stateTitle}>Anda tidak memiliki akses ke halaman ini.</h1>
            <p className={styles.stateText}>Halaman ini hanya tersedia untuk ruang kerja eksekutif.</p>
            <button className={styles.primaryButton} onClick={() => router.replace("/workspace")} type="button">
              Kembali ke ruang kerja
            </button>
          </>
        )}
      </div>
    </main>
  );
}
