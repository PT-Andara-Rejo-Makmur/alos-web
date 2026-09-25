import { notFound } from "next/navigation";
import { BusinessWorkspace } from "@/experiences/business/workspace";
import { LegacyCompatibilityRedirect } from "@/features/workspace-routing";
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

  // Settings is deferred compatibility per architectural requirement
  if (module === "settings") {
    return <BusinessWorkspace module={module} />;
  }

  return <LegacyCompatibilityRedirect targetPath={`/business/${module}`} />;
}
