"use client";

import { use } from "react";
import { ProcessQueuePage } from "@/features/shared-work/processes/process-queue";

export default function WorkspaceProcessQueue({ params }: Readonly<{ params: Promise<{ workspaceKey: string }> }>) {
  const { workspaceKey } = use(params);
  return <ProcessQueuePage key={workspaceKey} workspaceKey={workspaceKey} />;
}
