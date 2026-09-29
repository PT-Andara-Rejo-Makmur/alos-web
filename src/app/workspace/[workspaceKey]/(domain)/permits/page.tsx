"use client";

import { use } from "react";
import { LegalPermitsPage } from "@/features/legal";

export default function WorkspaceLegalPermitsRoute({ params }: Readonly<{ params: Promise<{ workspaceKey: string }> | { workspaceKey: string } }>) {
  const resolved = "then" in params ? use(params) : params;
  return <LegalPermitsPage workspaceKey={resolved.workspaceKey} />;
}
