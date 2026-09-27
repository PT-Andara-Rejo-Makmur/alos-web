"use client";

import { use } from "react";

import { ModulePlaceholder } from "@/features/shared-work";

export default function WorkspaceFindingsPageRoute({
  params,
}: {
  readonly params: Promise<{ workspaceKey: string }>;
}) {
  const { workspaceKey } = use(params);
  return (
    <ModulePlaceholder
      description="Kelola masalah, ketidaksesuaian, dan tindak lanjut yang memerlukan perhatian."
      module="findings"
      title="Temuan"
      workspaceKey={workspaceKey}
    />
  );
}
