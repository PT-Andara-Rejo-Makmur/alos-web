"use client";

import { use } from "react";

import { DocumentsPage } from "@/features/shared-work/documents";

export default function WorkspaceDocumentsPageRoute({
  params,
}: {
  readonly params: Promise<{ workspaceKey: string }>;
}) {
  const { workspaceKey } = use(params);
  return <DocumentsPage workspaceKey={workspaceKey} />;
}
