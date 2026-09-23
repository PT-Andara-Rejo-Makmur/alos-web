"use client";

import { ProtectedDomainWorkspace } from "@/features/workspace-shell";
import { LegalDashboardHome } from "./legal-dashboard-home";
import { createDefaultLegalSnapshot } from "./legal-dashboard-projection";
import type { LegalDashboardSnapshot } from "./types";

export function LegalDashboardPage({ initialSnapshot }: { readonly initialSnapshot?: LegalDashboardSnapshot | null }) {
  const snapshot = initialSnapshot ?? createDefaultLegalSnapshot();
  return (
    <ProtectedDomainWorkspace deniedTitle="Bukan Otoritas Legal & Compliance" divisionCodes={["LEGAL"]} loadingLabel="Memuat Legal Command Center…" roleLabel="Legal & Compliance Manager" workspaceKeys={["legal"]}>
      {() => <LegalDashboardHome snapshot={snapshot} />}
    </ProtectedDomainWorkspace>
  );
}
