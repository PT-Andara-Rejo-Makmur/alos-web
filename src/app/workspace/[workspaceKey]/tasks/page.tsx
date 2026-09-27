"use client";

import { use } from "react";

import { TasksPage } from "@/features/shared-work";

export default function WorkspaceTasksPageRoute({
  params,
}: {
  readonly params: Promise<{ workspaceKey: string }>;
}) {
  const { workspaceKey } = use(params);
  return <TasksPage workspaceKey={workspaceKey} />;
}
