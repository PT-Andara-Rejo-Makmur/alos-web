import { StrategySubmoduleRunner } from "@/modules/strategy";

export default function PropertyStrategySubmodulePage({
  params,
}: {
  params: Promise<{ submodule: string }>;
}) {
  return <StrategySubmoduleRunner workspaceKey="property" params={params} />;
}
