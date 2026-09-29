"use client";

import { use } from "react";
import { LegalObligationsPage } from "@/features/legal";

export default function WorkspaceLegalObligationsRoute({ params }: Readonly<{ params: Promise<{ workspaceKey: string }> | { workspaceKey: string } }>) {
  const resolved = "then" in params ? use(params) : params;
  return <LegalObligationsPage workspaceKey={resolved.workspaceKey} />;
}
