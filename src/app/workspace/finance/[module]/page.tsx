import { notFound, redirect } from "next/navigation";
import { isKnownWorkspaceModule, normalizeCanonicalModuleSegment } from "@/features/workspace-routing";
import { ContextualWorkspaceModulePage } from "@/features/workspace-shell";

export default async function FinanceModuleRoute({
  params,
}: {
  params: Promise<{ module: string }>;
}) {
  const { module: rawModule } = await params;
  const canonicalModule = normalizeCanonicalModuleSegment(rawModule);

  if (canonicalModule === "close") {
    redirect("/workspace/finance/month-close");
  }

  if (rawModule !== canonicalModule) {
    redirect(`/workspace/finance/${canonicalModule}`);
  }

  if (!isKnownWorkspaceModule("finance", canonicalModule)) {
    notFound();
  }

  return <ContextualWorkspaceModulePage module={canonicalModule} workspaceKey="finance" />;
}
