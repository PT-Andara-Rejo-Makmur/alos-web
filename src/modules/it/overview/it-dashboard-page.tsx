"use client";

import { ProtectedDomainWorkspace } from "@/features/workspace-shell";
import { ItDashboardHome } from "./it-dashboard-home";
import { createDefaultItSnapshot } from "./it-dashboard-projection";
import type { ItDashboardSnapshot } from "./types";

export function ItDashboardPage({ initialSnapshot }: { readonly initialSnapshot?: ItDashboardSnapshot | null }) {
  const snapshot = initialSnapshot ?? createDefaultItSnapshot();
  return (
    <ProtectedDomainWorkspace deniedTitle="Bukan Otoritas IT & Technology" divisionCodes={["IT", "TECHNOLOGY"]} loadingLabel="Memuat IT Command Center…" workspaceKeys={["it", "technology"]}>
      {() => <ItDashboardHome snapshot={snapshot} />}
    </ProtectedDomainWorkspace>
  );
}

export const ItOverviewPage = ItDashboardPage;
