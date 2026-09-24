"use client";

import { useEffect, useState } from "react";

import { ProtectedDomainWorkspace, type WorkspaceShellIdentity } from "@/features/workspace-shell";
import { authenticatedApiRequest } from "@/lib/api";
import { FinanceDashboardHome } from "./finance-dashboard-home";
import { createEmptyFinanceSnapshot } from "./finance-dashboard-projection";
import type { FinanceDashboardSnapshot } from "./types";

export function FinanceDashboardPage({ initialSnapshot }: { readonly initialSnapshot?: FinanceDashboardSnapshot | null }) {
  return (
    <ProtectedDomainWorkspace deniedDescription="Halaman ini merupakan operational control room divisi Keuangan dan memerlukan workspace yang diberikan Backend." divisionCodes={["FINANCE"]} loadingLabel="Memuat Finance Command Center…" workspaceKeys={["finance"]}>
      {({ identity }) => <FinanceContent identity={identity} initialSnapshot={initialSnapshot} />}
    </ProtectedDomainWorkspace>
  );
}

function FinanceContent({ identity, initialSnapshot }: { readonly identity: WorkspaceShellIdentity; readonly initialSnapshot?: FinanceDashboardSnapshot | null }) {
  const [snapshot, setSnapshot] = useState<FinanceDashboardSnapshot | null>(initialSnapshot ?? null);
  useEffect(() => {
    if (initialSnapshot) return;
    const controller = new AbortController();
    authenticatedApiRequest<FinanceDashboardSnapshot>("/api/v1/finance-dashboard", { signal: controller.signal })
      .then(setSnapshot)
      .catch(() => {
        if (!controller.signal.aborted) setSnapshot(createEmptyFinanceSnapshot(identity.workspaceId, identity.workspaceLabel));
      });
    return () => controller.abort();
  }, [identity.workspaceId, identity.workspaceLabel, initialSnapshot]);
  if (!snapshot) return <div className="alos-loading-shell">Memuat data Finance…</div>;
  return <FinanceDashboardHome snapshot={snapshot} />;
}
