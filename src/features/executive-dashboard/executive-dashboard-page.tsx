"use client";

import { useEffect, useState } from "react";

import { ProtectedDomainWorkspace } from "@/features/workspace-shell";
import { authenticatedApiRequest } from "@/lib/api";
import { ExecutiveDashboardHome } from "./executive-dashboard-home";
import { createEmptyExecutiveSnapshot } from "./executive-dashboard-projection";
import type { ExecutiveDashboardSnapshot } from "./types";

export function ExecutiveDashboardPage({ initialSnapshot }: { readonly initialSnapshot?: ExecutiveDashboardSnapshot | null }) {
  return (
    <ProtectedDomainWorkspace deniedDescription="Halaman ini merupakan Command Center Direktur Utama dan memerlukan role serta workspace yang diberikan Backend." divisionCodes={["EXEC", "EXECUTIVE"]} loadingLabel="Memuat Executive Command Center…" roleLabel="Direktur Utama" workspaceKeys={["executive", "director"]}>
      {({ actor }) => actor.roles.includes("EXECUTIVE")
        ? <ExecutiveContent initialSnapshot={initialSnapshot} />
        : <section className="panel workspace-panel" role="alert"><h1>Akses eksekutif ditolak</h1><p>Backend tidak memberikan role Direktur untuk sesi ini.</p></section>}
    </ProtectedDomainWorkspace>
  );
}

function ExecutiveContent({ initialSnapshot }: { readonly initialSnapshot?: ExecutiveDashboardSnapshot | null }) {
  const [snapshot, setSnapshot] = useState<ExecutiveDashboardSnapshot | null>(initialSnapshot ?? null);
  useEffect(() => {
    if (initialSnapshot) return;
    const controller = new AbortController();
    authenticatedApiRequest<ExecutiveDashboardSnapshot>("/api/v1/executive-dashboard", { signal: controller.signal })
      .then(setSnapshot)
      .catch(() => { if (!controller.signal.aborted) setSnapshot(createEmptyExecutiveSnapshot()); });
    return () => controller.abort();
  }, [initialSnapshot]);
  if (!snapshot) return <div className="alos-loading-shell">Memuat data eksekutif…</div>;
  return <ExecutiveDashboardHome snapshot={snapshot} />;
}
