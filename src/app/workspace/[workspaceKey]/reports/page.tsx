"use client";

import { use } from "react";

import { ModulePlaceholder } from "@/features/shared-work";

export default function WorkspaceReportsPageRoute({
  params,
}: {
  readonly params: Promise<{ workspaceKey: string }>;
}) {
  const { workspaceKey } = use(params);
  return (
    <ModulePlaceholder
      description="Kelola definisi dan hasil laporan kerja berkala."
      module="reports"
      title="Laporan"
      workspaceKey={workspaceKey}
    />
  );
}
