import { StrategySubmoduleRunner } from "@/modules/strategy";

export default function LegalStrategySubmodulePage({
  params,
}: {
  params: Promise<{ submodule: string }>;
}) {
  return <StrategySubmoduleRunner workspaceKey="legal" params={params} />;
}
