import { ExperiencePage } from "@/components/layout/experience-page";
import { BusinessMvp1Workspace } from "@/experiences/business/mvp1-workspace";
import { getExperience } from "@/experiences/registry";

export default function BusinessPage() {
  return (
    <ExperiencePage experience={getExperience("business")}>
      <BusinessMvp1Workspace />
    </ExperiencePage>
  );
}
