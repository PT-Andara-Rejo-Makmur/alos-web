import { LegacyCompatibilityRedirect } from "@/features/workspace-routing";

export default function WorkspaceTasksRoute() {
  return <LegacyCompatibilityRedirect targetPath="/workspace/tasks" />;
}
