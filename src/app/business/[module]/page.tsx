import { notFound } from "next/navigation";

import { BusinessMvp1Workspace } from "@/experiences/business/mvp1-workspace";
import {
  dashboardModules,
  isDashboardModuleKey,
} from "@/features/mvp1/lib/dashboard-modules";

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

  return <BusinessMvp1Workspace module={module} />;
}
