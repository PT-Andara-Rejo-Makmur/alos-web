"use client";

import { use } from "react";

import { FindingsPage } from "@/features/shared-work/findings";

export default function WorkspaceFindingsPageRoute({
  params,
}: {
  readonly params: Promise<{ workspaceKey: string }> | { workspaceKey: string };
}) {
  const resolved = "then" in params ? use(params) : params;
  return <FindingsPage workspaceKey={resolved.workspaceKey} />;
}
