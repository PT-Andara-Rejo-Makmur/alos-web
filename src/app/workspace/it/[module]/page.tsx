import { notFound } from "next/navigation";
import { isKnownWorkspaceModule } from "@/features/workspace-routing";
import { ContextualWorkspaceModulePage } from "@/features/workspace-shell";

export default async function ItModuleRoute({
  params,
}: {
  params: Promise<{ module: string }>;
}) {
  const { module } = await params;
  if (!isKnownWorkspaceModule("it", module)) {
    notFound();
  }
  return <ContextualWorkspaceModulePage module={module} workspaceKey="it" />;
}
