"use client";

import { use } from "react";

import { ApprovalsPage } from "@/features/shared-work/approvals";

export default function WorkspaceApprovalsPageRoute({
  params,
}: {
  readonly params: Promise<{ workspaceKey: string }>;
}) {
  const { workspaceKey } = use(params);
  return <ApprovalsPage workspaceKey={workspaceKey} />;
}
