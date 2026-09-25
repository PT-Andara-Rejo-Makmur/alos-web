import { ContextualWorkspaceModulePage } from "@/features/workspace-shell";

export default async function FinanceModuleRoute({
  params,
}: {
  params: Promise<{ module: string }>;
}) {
  const { module } = await params;
  return <ContextualWorkspaceModulePage module={module} workspaceKey="finance" />;
}
