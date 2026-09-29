"use client";

import { use } from "react";
import { LegalCasesPage } from "@/features/legal";

export default function WorkspaceLegalCasesRoute({ params }: Readonly<{ params: Promise<{ workspaceKey: string }> | { workspaceKey: string } }>) {
  const resolved = "then" in params ? use(params) : params;
  return <LegalCasesPage workspaceKey={resolved.workspaceKey} />;
}
