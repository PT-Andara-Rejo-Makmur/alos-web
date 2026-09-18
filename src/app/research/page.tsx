import { ExperiencePage } from "@/components/layout/experience-page";
import { SharedResearchWorkspace } from "@/features/research";
import { getExperience } from "@/experiences/registry";

export default function ResearchPage() {
  return (
    <ExperiencePage experience={getExperience("research")}>
      <SharedResearchWorkspace />
    </ExperiencePage>
  );
}
