import { notFound } from "next/navigation";

import { BusinessWorkspace } from "@/experiences/business/workspace";
import {
  dashboardModules,
  isDashboardModuleKey,
} from "@/features/workspace-routing/dashboard-modules";

export function generateStaticParams() {
  return Object.keys(dashboardModules).map((module) => ({ module }));
}

export default async function BusinessModulePage({
  params,
}: {
  params: Promise<{ module: string }>;
}) {
  const { module } = await params;
  if (!isDashboardModuleKey(module)) notFound();

  return <BusinessWorkspace module={module} />;
}
