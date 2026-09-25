import { LegacyCompatibilityRedirect } from "@/features/workspace-routing";

export default function WorkspaceAgentsRoute() {
  return <LegacyCompatibilityRedirect targetPath="/workspace/agents" />;
}
