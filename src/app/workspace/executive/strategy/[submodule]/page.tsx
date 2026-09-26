import { StrategySubmoduleRunner } from "@/modules/strategy";

export default function ExecutiveStrategySubmodulePage({
  params,
}: {
  params: Promise<{ submodule: string }>;
}) {
  return <StrategySubmoduleRunner workspaceKey="executive" params={params} />;
}
