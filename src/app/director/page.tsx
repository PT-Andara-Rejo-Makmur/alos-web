import { ExperiencePage } from "@/components/layout/experience-page";
import { DirectorReviewProjection } from "@/features/reviews/director-review-projection";
import { getExperience } from "@/experiences/registry";

export default function DirectorPage() {
  return (
    <ExperiencePage experience={getExperience("director")}>
      <DirectorReviewProjection />
    </ExperiencePage>
  );
}
