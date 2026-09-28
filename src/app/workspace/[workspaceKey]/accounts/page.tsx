import { AccountManagementPage } from "@/features/it";

export default async function AccountManagementRoute({
  params,
}: Readonly<{ params: Promise<{ workspaceKey: string }> }>) {
  const { workspaceKey } = await params;
  return <AccountManagementPage workspaceKey={workspaceKey} />;
}
