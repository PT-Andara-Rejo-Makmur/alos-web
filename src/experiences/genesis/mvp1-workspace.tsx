"use client";

import { Suspense } from "react";

import { GovernanceDashboard } from "@/features/mvp1/components/governance-dashboard";
import { Mvp1MigrationBoundary } from "@/features/mvp1/migration-boundary";

export function GenesisMvp1Workspace() {
  return (
    <Mvp1MigrationBoundary
      dependencies={[
        "GET /api/v1/whoami",
        "/api/v1/agents",
        "/api/v1/release-requests",
        "/api/v1/workspaces/{workspace_id}/sources",
      ]}
    >
      <Suspense fallback={<p className="alos-loading-shell">Memuat Control Plane…</p>}>
        <GovernanceDashboard />
      </Suspense>
    </Mvp1MigrationBoundary>
  );
}
