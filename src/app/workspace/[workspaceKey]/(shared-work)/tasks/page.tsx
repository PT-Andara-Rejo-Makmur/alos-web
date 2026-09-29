"use client";

import { use } from "react";

import { TasksPage } from "@/features/shared-work";

export default function WorkspaceTasksPageRoute({
  params,
}: {
  readonly params: Promise<{ workspaceKey: string }> | { workspaceKey: string };
}) {
  const resolved = "then" in params ? use(params) : params;
  return <TasksPage workspaceKey={resolved.workspaceKey} />;
}
