"use client";

import { use } from "react";

import { ProjectsPage } from "@/features/shared-work";

export default function WorkspaceProjectsPageRoute({
  params,
}: {
  readonly params: Promise<{ workspaceKey: string }>;
}) {
  const resolved = use(params);
  return <ProjectsPage workspaceKey={resolved.workspaceKey} />;
}
