"use client";

import { use } from "react";
import { ExecutiveBriefPage } from "@/features/executive";

export default function WorkspaceExecutiveBriefRoute({
  params,
}: Readonly<{ params: Promise<{ workspaceKey: string }> | { workspaceKey: string } }>) {
  const resolved = "then" in params ? use(params) : params;
  return <ExecutiveBriefPage workspaceKey={resolved.workspaceKey} />;
}
