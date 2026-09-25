import { notFound } from "next/navigation";
import { isKnownWorkspaceModule } from "@/features/workspace-routing";
import { ContextualWorkspaceModulePage } from "@/features/workspace-shell";

export default async function PropertyModuleRoute({
  params,
}: {
  params: Promise<{ module: string }>;
}) {
  const { module } = await params;
  if (!isKnownWorkspaceModule("property", module)) {
    notFound();
  }
  return <ContextualWorkspaceModulePage module={module} workspaceKey="property" />;
}
