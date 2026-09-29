"use client";

import { use } from "react";
import { FinancePayablesPage } from "@/features/finance";

export default function Page({ params }: Readonly<{ params: Promise<{ workspaceKey: string }> | { workspaceKey: string } }>) {
  const resolved = "then" in params ? use(params) : params;
  return <FinancePayablesPage workspaceKey={resolved.workspaceKey} />;
}
