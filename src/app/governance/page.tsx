import { ExperiencePage } from "@/components/layout/experience-page";
import { ItReviewProjection } from "@/features/reviews/it-review-projection";
import { getExperience } from "@/experiences/registry";

export default function GovernancePage() {
  return (
    <ExperiencePage experience={getExperience("governance")}>
      <ItReviewProjection />
    </ExperiencePage>
  );
}
