import { StrategySubmoduleRunner } from "@/modules/strategy";

export default function ItStrategySubmodulePage({
  params,
}: {
  params: Promise<{ submodule: string }>;
}) {
  return <StrategySubmoduleRunner workspaceKey="it" params={params} />;
}
