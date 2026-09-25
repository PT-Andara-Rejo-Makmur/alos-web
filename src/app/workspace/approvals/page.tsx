import { LegacyCompatibilityRedirect } from "@/features/workspace-routing";

export default function WorkspaceApprovalsRoute() {
  return <LegacyCompatibilityRedirect targetPath="/workspace/approvals" />;
}
