"use client";

import { use } from "react";
import { LegalContractsPage } from "@/features/legal";

export default function WorkspaceLegalContractsRoute({ params }: Readonly<{ params: Promise<{ workspaceKey: string }> | { workspaceKey: string } }>) {
  const resolved = "then" in params ? use(params) : params;
  return <LegalContractsPage workspaceKey={resolved.workspaceKey} />;
}
