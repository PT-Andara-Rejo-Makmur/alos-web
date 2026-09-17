import { ExperiencePage } from "@/components/layout/experience-page";
import { getExperience } from "@/experiences/registry";

export default function BusinessPage() {
  return <ExperiencePage experience={getExperience("business")} />;
}
