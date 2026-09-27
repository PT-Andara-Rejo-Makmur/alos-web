"use client";

import { use } from "react";

import { ModulePlaceholder } from "@/features/shared-work";

export default function WorkspaceDocumentsPageRoute({
  params,
}: {
  readonly params: Promise<{ workspaceKey: string }>;
}) {
  const { workspaceKey } = use(params);
  return (
    <ModulePlaceholder
      description="Kelola dokumen kerja sesuai akses dan konteks bisnis Anda."
      module="documents"
      title="Dokumen"
      workspaceKey={workspaceKey}
    />
  );
}
