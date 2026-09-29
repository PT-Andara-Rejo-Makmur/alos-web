"use client";
import { use } from "react";
import { PropertyContractorDetailPage } from "@/features/property";

export default function Page({ params }: Readonly<{ params: Promise<{ workspaceKey: string; contractorId: string }> | { workspaceKey: string; contractorId: string } }>) {
  const resolved = "then" in params ? use(params) : params;
  return <PropertyContractorDetailPage contractorId={resolved.contractorId} workspaceKey={resolved.workspaceKey} />;
}
