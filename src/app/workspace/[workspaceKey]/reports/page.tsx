"use client";

import { use } from "react";

import { ReportsPage } from "@/features/shared-work/reports";

export default function WorkspaceReportsPageRoute({
  params,
}: {
  readonly params: Promise<{ workspaceKey: string }>;
}) {
  const { workspaceKey } = use(params);
  return <ReportsPage workspaceKey={workspaceKey} />;
}
