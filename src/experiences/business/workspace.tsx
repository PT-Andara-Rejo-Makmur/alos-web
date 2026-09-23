"use client";

import type { DashboardModuleKey } from "@/features/workspace-routing/dashboard-modules";
import { ExecutiveDashboard } from "@/features/executive-dashboard/workspace-dashboard";

export function BusinessWorkspace({ module }: { module?: DashboardModuleKey }) {
  return <ExecutiveDashboard module={module} />;
}
