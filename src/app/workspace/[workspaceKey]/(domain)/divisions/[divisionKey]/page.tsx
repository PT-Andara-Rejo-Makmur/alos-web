"use client";

import { use } from "react";
import { ExecutiveDivisionDetailPage } from "@/features/executive";

export default function WorkspaceExecutiveDivisionDetailRoute({
  params,
}: Readonly<{
  params:
    | Promise<{ workspaceKey: string; divisionKey: string }>
    | { workspaceKey: string; divisionKey: string };
}>) {
  const resolved = "then" in params ? use(params) : params;
  return (
    <ExecutiveDivisionDetailPage
      workspaceKey={resolved.workspaceKey}
      divisionKey={resolved.divisionKey}
    />
  );
}
