import { ExperiencePage } from "@/components/layout/experience-page";
import { getExperience } from "@/experiences/registry";
import { AraMvp1Workspace } from "@/experiences/ara/mvp1-workspace";

export default function AraPage() {
  return (
    <ExperiencePage experience={getExperience("ara")}>
      <AraMvp1Workspace />
    </ExperiencePage>
  );
}
