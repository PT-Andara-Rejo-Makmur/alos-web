"use client";

import { use } from "react";
import { LegalDetailPage } from "@/features/legal";

export default function WorkspaceLegalPermitDetailRoute({ params }: Readonly<{ params: Promise<{ workspaceKey: string; permitId: string }> | { workspaceKey: string; permitId: string } }>) {
  const resolved = "then" in params ? use(params) : params;
  return <LegalDetailPage kind="permit" recordId={resolved.permitId} workspaceKey={resolved.workspaceKey} />;
}
