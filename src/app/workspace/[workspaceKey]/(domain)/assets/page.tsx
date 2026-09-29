"use client";

import { use } from "react";
import { LegalAssetsPage } from "@/features/legal";

export default function WorkspaceLegalAssetsRoute({ params }: Readonly<{ params: Promise<{ workspaceKey: string }> | { workspaceKey: string } }>) {
  const resolved = "then" in params ? use(params) : params;
  return <LegalAssetsPage workspaceKey={resolved.workspaceKey} />;
}
