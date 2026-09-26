import { notFound, redirect } from "next/navigation";
import { isKnownWorkspaceModule, normalizeCanonicalModuleSegment } from "@/features/workspace-routing";
import { ContextualWorkspaceModulePage } from "@/features/workspace-shell";

export default async function PropertyModuleRoute({
  params,
}: {
  params: Promise<{ module: string }>;
}) {
  const { module: rawModule } = await params;
  const canonicalModule = normalizeCanonicalModuleSegment(rawModule);

  if (rawModule !== canonicalModule) {
    redirect(`/workspace/property/${canonicalModule}`);
  }

  if (!isKnownWorkspaceModule("property", canonicalModule)) {
    notFound();
  }

  return <ContextualWorkspaceModulePage module={canonicalModule} workspaceKey="property" />;
}
