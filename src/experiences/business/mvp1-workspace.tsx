"use client";

import type { DashboardModuleKey } from "@/features/mvp1/lib/dashboard-modules";
import { ExecutiveDashboard } from "@/features/mvp1/components/executive-dashboard";
import { Mvp1MigrationBoundary } from "@/features/mvp1/migration-boundary";

export function BusinessMvp1Workspace({ module }: { module?: DashboardModuleKey }) {
  return (
    <Mvp1MigrationBoundary
      dependencies={[
        "GET /api/v1/whoami",
        "GET /api/v1/executive-dashboard",
        "GET /api/v1/dashboard/operational",
        "GET /api/v1/projects/portfolio",
      ]}
    >
      <ExecutiveDashboard module={module} />
    </Mvp1MigrationBoundary>
  );
}
