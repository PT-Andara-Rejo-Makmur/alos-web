"use client";

import { use } from "react";

import { ApprovalsPage } from "@/features/shared-work/approvals";

export default function WorkspaceApprovalsPageRoute({
  params,
}: {
  readonly params: Promise<{ workspaceKey: string }> | { workspaceKey: string };
}) {
  const resolved = "then" in params ? use(params) : params;
  return <ApprovalsPage workspaceKey={resolved.workspaceKey} />;
}
