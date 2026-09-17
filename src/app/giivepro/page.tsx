import { ExperiencePage } from "@/components/layout/experience-page";
import { getExperience } from "@/experiences/registry";

export default function GiiveproPage() {
  return <ExperiencePage experience={getExperience("giivepro")} />;
}
