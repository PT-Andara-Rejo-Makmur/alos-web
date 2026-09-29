"use client";

import { use } from "react";
import { ExecutivePlanningPage } from "@/features/executive";

export default function WorkspaceExecutivePlanningRoute({
  params,
}: Readonly<{ params: Promise<{ workspaceKey: string }> | { workspaceKey: string } }>) {
  const resolved = "then" in params ? use(params) : params;
  return <ExecutivePlanningPage workspaceKey={resolved.workspaceKey} />;
}
