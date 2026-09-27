"use client";

import { use } from "react";

import { ModulePlaceholder } from "@/features/shared-work";

export default function WorkspaceTasksPageRoute({
  params,
}: {
  readonly params: Promise<{ workspaceKey: string }>;
}) {
  const { workspaceKey } = use(params);
  return (
    <ModulePlaceholder
      description="Kelola pekerjaan yang ditugaskan kepada Anda dan tim."
      module="tasks"
      title="Tugas"
      workspaceKey={workspaceKey}
    />
  );
}
