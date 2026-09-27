"use client";

import Link from "next/link";
import { AlertCircle } from "lucide-react";

import { ProtectedDomainWorkspace } from "@/features/workspace-shell";
import { ExecutiveDashboardHome } from "./executive-dashboard-home";
import { ExecutiveDashboardSkeleton } from "./components/executive-dashboard-skeleton";
import { useExecutiveOverview } from "./use-executive-overview";
import type { ExecutiveDashboardSnapshot } from "./types";
import styles from "./executive-dashboard.module.css";

export function ExecutiveDashboardPage({
  initialSnapshot,
}: {
  readonly initialSnapshot?: ExecutiveDashboardSnapshot | null;
}) {
  return (
    <ProtectedDomainWorkspace
      deniedDescription="Halaman ini merupakan Executive Command Center / Pusat Kendali Eksekutif dan memerlukan role serta workspace yang diberikan Backend."
      deniedTitle="Akses Dibatasi"
      divisionCodes={["EXEC", "EXECUTIVE"]}
      loadingLabel="Memuat Pusat Kendali Eksekutif…"
      workspaceKeys={["executive", "director"]}
    >
      {({ actor }) =>
        actor.roles.includes("EXECUTIVE") ? (
          <ExecutiveContent initialSnapshot={initialSnapshot} />
        ) : (
          <section className={styles.statePanel} role="alert">
            <div className={styles.stateIcon} aria-hidden="true">
              <AlertCircle size={24} />
            </div>
            <h2 className={styles.stateTitle}>Akses Eksekutif Dibatasi</h2>
            <p className={styles.stateDesc}>
              Anda tidak memiliki akses untuk melakukan tindakan ini. Backend tidak memberikan hak Direktur untuk sesi ini.
            </p>
            <Link href="/workspace" className={styles.stateActionBtn}>
              Kembali ke Ruang Kerja Saya
            </Link>
          </section>
        )
      }
    </ProtectedDomainWorkspace>
  );
}

function ExecutiveContent({
  initialSnapshot,
}: {
  readonly initialSnapshot?: ExecutiveDashboardSnapshot | null;
}) {
  const {
    initialLoading,
    refreshing,
    error,
    partialRefreshError,
    loadingTasks,
    loadingCompletedCount,
    loadingTotalCount,
    loadingPercent,
    snapshot,
    activePlan,
    corporateTargets,
    rawTargets,
    headlines,
    domainSummaries,
    earlyWarnings,
    decisionItems,
    divisionItems,
    dataStatus,
    lastUpdatedTime,
    refresh,
    retry,
  } = useExecutiveOverview(initialSnapshot);

  if (initialLoading) {
    return (
      <ExecutiveDashboardSkeleton
        loadingTasks={loadingTasks}
        completedCount={loadingCompletedCount}
        totalCount={loadingTotalCount}
        percent={loadingPercent}
      />
    );
  }

  if (error) {
    return (
      <div className={styles.statePanel} role="alert">
        <div className={styles.stateIcon} aria-hidden="true">
          <AlertCircle size={24} />
        </div>
        <h2 className={styles.stateTitle}>Kendala Memuat Data</h2>
        <p className={styles.stateDesc}>{error}</p>
        <button type="button" onClick={retry} className={styles.stateActionBtn}>
          Muat Ulang
        </button>
      </div>
    );
  }

  return (
    <ExecutiveDashboardHome
      snapshot={snapshot}
      activePlan={activePlan}
      rawTargets={rawTargets}
      corporateTargets={corporateTargets}
      headlines={headlines}
      domainSummaries={domainSummaries}
      earlyWarnings={earlyWarnings}
      decisionItems={decisionItems}
      divisionItems={divisionItems}
      dataStatus={dataStatus}
      lastUpdatedTime={lastUpdatedTime}
      refreshing={refreshing}
      partialError={partialRefreshError}
      onRefresh={refresh}
      onRetry={refresh}
    />
  );
}
