import { notFound, redirect } from "next/navigation";
import { isKnownWorkspaceModule } from "@/features/workspace-routing";
import { ContextualWorkspaceModulePage } from "@/features/workspace-shell";

export default async function FinanceModuleRoute({
  params,
}: {
  params: Promise<{ module: string }>;
}) {
  const { module } = await params;
  if (module.toLowerCase() === "close") {
    redirect("/workspace/finance/month-close");
  }
  if (!isKnownWorkspaceModule("finance", module)) {
    notFound();
  }
  return <ContextualWorkspaceModulePage module={module} workspaceKey="finance" />;
}
