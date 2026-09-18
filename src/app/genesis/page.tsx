import { ExperiencePage } from "@/components/layout/experience-page";
import { FactoryWorkspace } from "@/features/factory";
import { ItReviewProjection } from "@/features/reviews/it-review-projection";
import { GenesisMvp1Workspace } from "@/experiences/genesis/mvp1-workspace";
import { getExperience } from "@/experiences/registry";

export default function GenesisPage() {
  return (
    <ExperiencePage experience={getExperience("genesis")}>
      <FactoryWorkspace />
      <ItReviewProjection />
      <GenesisMvp1Workspace />
    </ExperiencePage>
  );
}
