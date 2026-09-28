"use client";
import { use } from "react";
import { SalesSummaryPage } from "@/features/sales";
export default function Page({ params }: Readonly<{ params: Promise<{ workspaceKey: string }> }>) {
  return <SalesSummaryPage workspaceKey={use(params).workspaceKey} />;
}
