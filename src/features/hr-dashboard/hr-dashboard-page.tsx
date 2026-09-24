"use client";

import { ProtectedDomainWorkspace } from "@/features/workspace-shell";
import { HrDashboardHome } from "./hr-dashboard-home";
import { createDefaultHrSnapshot } from "./hr-dashboard-projection";
import type { HrDashboardSnapshot } from "./types";

export function HrDashboardPage({ initialSnapshot }: { readonly initialSnapshot?: HrDashboardSnapshot | null }) {
  const snapshot = initialSnapshot ?? createDefaultHrSnapshot();
  return (
    <ProtectedDomainWorkspace deniedTitle="Bukan Otoritas HR & People" divisionCodes={["HR", "PEOPLE"]} loadingLabel="Memuat HR & People Command Center…" workspaceKeys={["hr", "people"]}>
      {() => <HrDashboardHome snapshot={snapshot} />}
    </ProtectedDomainWorkspace>
  );
}
