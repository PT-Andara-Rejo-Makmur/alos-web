import { ExperiencePage } from "@/components/layout/experience-page";
import { ItReviewProjection } from "@/features/reviews/it-review-projection";
import { getExperience } from "@/experiences/registry";

export default function GenesisPage() {
  return (
    <ExperiencePage experience={getExperience("genesis")}>
      <ItReviewProjection />
    </ExperiencePage>
  );
}
