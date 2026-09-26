import { StrategySubmoduleRunner } from "@/modules/strategy";

export default function SalesStrategySubmodulePage({
  params,
}: {
  params: Promise<{ submodule: string }>;
}) {
  return <StrategySubmoduleRunner workspaceKey="sales" params={params} />;
}
