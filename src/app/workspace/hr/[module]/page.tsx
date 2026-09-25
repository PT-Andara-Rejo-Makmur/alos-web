import { ContextualWorkspaceModulePage } from "@/features/workspace-shell";

export default async function HrModuleRoute({
  params,
}: {
  params: Promise<{ module: string }>;
}) {
  const { module } = await params;
  return <ContextualWorkspaceModulePage module={module} workspaceKey="hr" />;
}
