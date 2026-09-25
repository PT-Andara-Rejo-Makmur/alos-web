import { notFound } from "next/navigation";
import { isKnownWorkspaceModule } from "@/features/workspace-routing";
import { ContextualWorkspaceModulePage } from "@/features/workspace-shell";

export default async function SalesModuleRoute({
  params,
}: {
  params: Promise<{ module: string }>;
}) {
  const { module } = await params;
  if (!isKnownWorkspaceModule("sales", module)) {
    notFound();
  }
  return <ContextualWorkspaceModulePage module={module} workspaceKey="sales" />;
}
