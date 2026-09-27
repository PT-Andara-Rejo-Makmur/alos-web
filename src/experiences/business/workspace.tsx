"use client";

import {
  ExecutiveDashboardPage,
  ExecutiveDivisionsPage,
  ExecutiveBriefPage,
} from "@/features/executive-dashboard";

export function BusinessWorkspace({ module }: { module?: string }) {
  if (module === "divisions") return <ExecutiveDivisionsPage />;
  if (module === "brief") return <ExecutiveBriefPage />;
  return <ExecutiveDashboardPage />;
}
