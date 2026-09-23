import { ExperiencePage } from "@/components/layout/experience-page";
import { FactoryWorkspace } from "@/features/factory";
import { ItReviewProjection } from "@/features/reviews/it-review-projection";
import { GenesisWorkspace, GenesisRdGovernanceView } from "@/experiences/genesis";
import { getExperience } from "@/experiences/registry";

export default function GenesisPage() {
  return (
    <ExperiencePage experience={getExperience("genesis")}>
      <FactoryWorkspace />
      <ItReviewProjection />
      <GenesisRdGovernanceView />
      <GenesisWorkspace />
    </ExperiencePage>
  );
}
