"use client";

import { use } from "react";
import { FinanceReconciliationPage } from "@/features/finance";

export default function Page({ params }: Readonly<{ params: Promise<{ workspaceKey: string }> | { workspaceKey: string } }>) {
  const resolved = "then" in params ? use(params) : params;
  return <FinanceReconciliationPage workspaceKey={resolved.workspaceKey} />;
}
