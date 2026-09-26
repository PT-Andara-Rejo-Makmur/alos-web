import { notFound, redirect } from "next/navigation";
import { isKnownWorkspaceModule, normalizeCanonicalModuleSegment } from "@/features/workspace-routing";
import { ContextualWorkspaceModulePage } from "@/features/workspace-shell";

export default async function SalesModuleRoute({
  params,
}: {
  params: Promise<{ module: string }>;
}) {
  const { module: rawModule } = await params;
  const canonicalModule = normalizeCanonicalModuleSegment(rawModule);

  if (rawModule !== canonicalModule) {
    redirect(`/workspace/sales/${canonicalModule}`);
  }

  if (!isKnownWorkspaceModule("sales", canonicalModule)) {
    notFound();
  }

  return <ContextualWorkspaceModulePage module={canonicalModule} workspaceKey="sales" />;
}
