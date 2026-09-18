import { ExperiencePage } from "@/components/layout/experience-page";
import { DirectorReviewProjection } from "@/features/reviews/director-review-projection";
import { DirectorMvp1Workspace } from "@/experiences/director/mvp1-workspace";
import { getExperience } from "@/experiences/registry";

export default function DirectorPage() {
  return (
    <ExperiencePage experience={getExperience("director")}>
      <DirectorReviewProjection />
      <DirectorMvp1Workspace />
    </ExperiencePage>
  );
}
