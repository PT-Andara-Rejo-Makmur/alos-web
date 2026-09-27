"use client";

import { use } from "react";

import { ModulePlaceholder } from "@/features/shared-work";

export default function WorkspaceApprovalsPageRoute({
  params,
}: {
  readonly params: Promise<{ workspaceKey: string }>;
}) {
  const { workspaceKey } = use(params);
  return (
    <ModulePlaceholder
      description="Kelola permintaan yang membutuhkan tinjauan atau keputusan sesuai kewenangan Anda."
      module="approvals"
      title="Persetujuan"
      workspaceKey={workspaceKey}
    />
  );
}
