import { ExperiencePage } from "@/components/layout/experience-page";
import { AgentCapabilitySummaryList } from "@/features/agents";
import { getExperience } from "@/experiences/registry";

export default function AgentsPage() {
  return (
    <ExperiencePage experience={getExperience("agents")}>
      <AgentCapabilitySummaryList items={[]} />
    </ExperiencePage>
  );
}
