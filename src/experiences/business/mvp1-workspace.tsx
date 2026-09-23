"use client";

import type { DashboardModuleKey } from "@/features/mvp1/lib/dashboard-modules";
import { ExecutiveDashboard } from "@/features/mvp1/components/executive-dashboard";

export function BusinessMvp1Workspace({ module }: { module?: DashboardModuleKey }) {
  return <ExecutiveDashboard module={module} />;
}
