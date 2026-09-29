"use client";

import { use } from "react";

import { DocumentsPage } from "@/features/shared-work/documents";

export default function WorkspaceDocumentsPageRoute({
  params,
}: {
  readonly params: Promise<{ workspaceKey: string }> | { workspaceKey: string };
}) {
  const resolved = "then" in params ? use(params) : params;
  return <DocumentsPage workspaceKey={resolved.workspaceKey} />;
}
