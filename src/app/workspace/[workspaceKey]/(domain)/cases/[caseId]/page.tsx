"use client";

import { use } from "react";
import { LegalDetailPage } from "@/features/legal";

export default function WorkspaceLegalCaseDetailRoute({ params }: Readonly<{ params: Promise<{ workspaceKey: string; caseId: string }> | { workspaceKey: string; caseId: string } }>) {
  const resolved = "then" in params ? use(params) : params;
  return <LegalDetailPage kind="case" recordId={resolved.caseId} workspaceKey={resolved.workspaceKey} />;
}
