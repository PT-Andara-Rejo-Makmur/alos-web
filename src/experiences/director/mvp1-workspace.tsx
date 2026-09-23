"use client";

import { ExecutiveDashboardPage } from "@/features/executive-dashboard";

/**
 * Adapter for /director compatibility route, delegating to the new Executive Dashboard.
 */
export function DirectorMvp1Workspace() {
  return <ExecutiveDashboardPage />;
}
