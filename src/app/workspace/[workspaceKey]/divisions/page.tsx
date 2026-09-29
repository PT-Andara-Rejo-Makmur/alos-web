"use client";

import { use } from "react";
import { ExecutiveDivisionsPage } from "@/features/executive";

export default function WorkspaceExecutiveDivisionsRoute({
  params,
}: Readonly<{ params: Promise<{ workspaceKey: string }> | { workspaceKey: string } }>) {
  const resolved = "then" in params ? use(params) : params;
  return <ExecutiveDivisionsPage workspaceKey={resolved.workspaceKey} />;
}
