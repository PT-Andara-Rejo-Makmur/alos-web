"use client";
import { use } from "react";
import { SalesCampaignsPage } from "@/features/sales";
export default function Page({ params }: Readonly<{ params: Promise<{ workspaceKey: string }> | { workspaceKey: string } }>) {
  const resolved = "then" in params ? use(params) : params;
  return <SalesCampaignsPage workspaceKey={resolved.workspaceKey} />;
}
