import { notFound } from "next/navigation";
import { isKnownWorkspaceModule } from "@/features/workspace-routing";
import { ContextualWorkspaceModulePage } from "@/features/workspace-shell";

export default async function HrModuleRoute({
  params,
}: {
  params: Promise<{ module: string }>;
}) {
  const { module } = await params;
  if (!isKnownWorkspaceModule("hr", module)) {
    notFound();
  }
  return <ContextualWorkspaceModulePage module={module} workspaceKey="hr" />;
}
