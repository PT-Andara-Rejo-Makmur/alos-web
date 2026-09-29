"use client";

import { use } from "react";
import { ExecutiveInitiativesPage } from "@/features/executive";

export default function WorkspaceExecutiveInitiativesRoute({
  params,
}: Readonly<{ params: Promise<{ workspaceKey: string }> | { workspaceKey: string } }>) {
  const resolved = "then" in params ? use(params) : params;
  return <ExecutiveInitiativesPage workspaceKey={resolved.workspaceKey} />;
}
