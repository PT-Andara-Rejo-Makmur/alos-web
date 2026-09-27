"use client";

import { use } from "react";

import { FindingsPage } from "@/features/shared-work/findings";

export default function WorkspaceFindingsPageRoute({
  params,
}: {
  readonly params: Promise<{ workspaceKey: string }>;
}) {
  const { workspaceKey } = use(params);
  return <FindingsPage workspaceKey={workspaceKey} />;
}
