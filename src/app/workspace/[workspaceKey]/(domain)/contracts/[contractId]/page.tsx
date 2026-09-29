"use client";

import { use } from "react";
import { LegalDetailPage } from "@/features/legal";

export default function WorkspaceLegalContractDetailRoute({ params }: Readonly<{ params: Promise<{ workspaceKey: string; contractId: string }> | { workspaceKey: string; contractId: string } }>) {
  const resolved = "then" in params ? use(params) : params;
  return <LegalDetailPage kind="contract" recordId={resolved.contractId} workspaceKey={resolved.workspaceKey} />;
}
