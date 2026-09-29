"use client";

import { use } from "react";
import { FinanceLiquidityPage } from "@/features/finance";

export default function Page({ params }: Readonly<{ params: Promise<{ workspaceKey: string }> | { workspaceKey: string } }>) {
  const resolved = "then" in params ? use(params) : params;
  return <FinanceLiquidityPage workspaceKey={resolved.workspaceKey} />;
}
