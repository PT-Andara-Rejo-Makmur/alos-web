import { notFound, redirect } from "next/navigation";
import { isKnownWorkspaceModule, normalizeCanonicalModuleSegment } from "@/features/workspace-routing";
import { ContextualWorkspaceModulePage } from "@/features/workspace-shell";

export default async function HrModuleRoute({
  params,
}: {
  params: Promise<{ module: string }>;
}) {
  const { module: rawModule } = await params;
  const canonicalModule = normalizeCanonicalModuleSegment(rawModule);

  if (rawModule !== canonicalModule) {
    redirect(`/workspace/hr/${canonicalModule}`);
  }

  if (!isKnownWorkspaceModule("hr", canonicalModule)) {
    notFound();
  }

  return <ContextualWorkspaceModulePage module={canonicalModule} workspaceKey="hr" />;
}
