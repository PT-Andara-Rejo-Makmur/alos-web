import { notFound, redirect } from "next/navigation";
import { isKnownWorkspaceModule, normalizeCanonicalModuleSegment } from "@/features/workspace-routing";
import { ContextualWorkspaceModulePage } from "@/features/workspace-shell";

export default async function ExecutiveModuleRoute({
  params,
}: {
  params: Promise<{ module: string }>;
}) {
  const { module: rawModule } = await params;
  const canonicalModule = normalizeCanonicalModuleSegment(rawModule);

  if (rawModule !== canonicalModule) {
    redirect(`/workspace/executive/${canonicalModule}`);
  }

  if (!isKnownWorkspaceModule("executive", canonicalModule)) {
    notFound();
  }

  return <ContextualWorkspaceModulePage module={canonicalModule} workspaceKey="executive" />;
}
