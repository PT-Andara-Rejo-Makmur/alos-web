"use client";

import { use } from "react";

import { ProjectsPage } from "@/features/shared-work";

export default function WorkspaceProjectsPageRoute({
  params,
}: {
  readonly params: Promise<{ workspaceKey: string }> | { workspaceKey: string };
}) {
  const resolved = "then" in params ? use(params) : params;
  return <ProjectsPage workspaceKey={resolved.workspaceKey} />;
}
