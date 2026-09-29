"use client";

import { use } from "react";
import { LegalRisksPage } from "@/features/legal";

export default function WorkspaceLegalRisksRoute({ params }: Readonly<{ params: Promise<{ workspaceKey: string }> | { workspaceKey: string } }>) {
  const resolved = "then" in params ? use(params) : params;
  return <LegalRisksPage workspaceKey={resolved.workspaceKey} />;
}
