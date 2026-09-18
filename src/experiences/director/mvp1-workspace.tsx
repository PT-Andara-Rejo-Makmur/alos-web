"use client";

import { ExecutiveDashboard } from "@/features/mvp1/components/executive-dashboard";
import { Mvp1MigrationBoundary } from "@/features/mvp1/migration-boundary";

export function DirectorMvp1Workspace() {
  return (
    <Mvp1MigrationBoundary
      dependencies={[
        "GET /api/v1/whoami",
        "GET /api/v1/executive-dashboard",
        "GET /api/v1/readiness/decisions",
      ]}
    >
      <ExecutiveDashboard />
    </Mvp1MigrationBoundary>
  );
}
