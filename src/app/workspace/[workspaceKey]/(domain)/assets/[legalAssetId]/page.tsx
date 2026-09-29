"use client";

import { use } from "react";
import { LegalDetailPage } from "@/features/legal";

export default function WorkspaceLegalAssetDetailRoute({ params }: Readonly<{ params: Promise<{ workspaceKey: string; legalAssetId: string }> | { workspaceKey: string; legalAssetId: string } }>) {
  const resolved = "then" in params ? use(params) : params;
  return <LegalDetailPage kind="asset" recordId={resolved.legalAssetId} workspaceKey={resolved.workspaceKey} />;
}
