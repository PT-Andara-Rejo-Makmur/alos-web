import { StrategySubmoduleRunner } from "@/modules/strategy";

export default function HrStrategySubmodulePage({
  params,
}: {
  params: Promise<{ submodule: string }>;
}) {
  return <StrategySubmoduleRunner workspaceKey="hr" params={params} />;
}
