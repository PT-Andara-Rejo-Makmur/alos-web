import { ExperiencePage } from "@/components/layout/experience-page";
import { getExperience } from "@/experiences/registry";

export default function AraPage() {
  return <ExperiencePage experience={getExperience("ara")} />;
}
