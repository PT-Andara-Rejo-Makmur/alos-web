"use client";

import { use } from "react";
import { FinanceReceivablesPage } from "@/features/finance";

export default function Page({ params }: Readonly<{ params: Promise<{ workspaceKey: string }> | { workspaceKey: string } }>) {
  const resolved = "then" in params ? use(params) : params;
  return <FinanceReceivablesPage workspaceKey={resolved.workspaceKey} />;
}
