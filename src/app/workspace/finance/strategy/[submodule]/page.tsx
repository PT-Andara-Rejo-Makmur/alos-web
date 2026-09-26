import { StrategySubmoduleRunner } from "@/modules/strategy";

export default function FinanceStrategySubmodulePage({
  params,
}: {
  params: Promise<{ submodule: string }>;
}) {
  return <StrategySubmoduleRunner workspaceKey="finance" params={params} />;
}
