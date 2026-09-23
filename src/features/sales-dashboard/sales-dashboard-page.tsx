"use client";

import { ProtectedDomainWorkspace } from "@/features/workspace-shell";
import { SalesDashboardHome } from "./sales-dashboard-home";
import { createDefaultSalesSnapshot } from "./sales-dashboard-projection";
import type { SalesDashboardSnapshot } from "./types";

export function SalesDashboardPage({ initialSnapshot }: { readonly initialSnapshot?: SalesDashboardSnapshot | null }) {
  const snapshot = initialSnapshot ?? createDefaultSalesSnapshot();
  return (
    <ProtectedDomainWorkspace deniedTitle="Bukan Otoritas Sales & Marketing" divisionCodes={["SALES", "SALES_MARKETING"]} loadingLabel="Memuat Sales Command Center…" roleLabel="Sales Manager" workspaceKeys={["sales", "sales-marketing"]}>
      {() => <SalesDashboardHome snapshot={snapshot} />}
    </ProtectedDomainWorkspace>
  );
}
