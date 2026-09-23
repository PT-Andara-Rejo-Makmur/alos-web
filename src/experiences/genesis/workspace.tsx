"use client";

import { Suspense } from "react";

import { GovernanceDashboard } from "@/features/governance/governance-dashboard";
import { DependencyBoundary } from "@/features/workspace-routing/dependency-boundary";

export function GenesisWorkspace() {
  return (
    <DependencyBoundary
      dependencies={[
        "GET /api/session",
        "/api/v1/agents",
        "/api/v1/release-requests",
        "/api/v1/workspaces/{workspace_id}/sources",
      ]}
    >
      <Suspense fallback={<p className="alos-loading-shell">Memuat Control Plane…</p>}>
        <GovernanceDashboard />
      </Suspense>
    </DependencyBoundary>
  );
}
