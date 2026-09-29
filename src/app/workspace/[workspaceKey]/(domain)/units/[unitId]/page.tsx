"use client";
import { use } from "react";
import { PropertyUnitDetailPage } from "@/features/property";

export default function Page({ params }: Readonly<{ params: Promise<{ workspaceKey: string; unitId: string }> | { workspaceKey: string; unitId: string } }>) {
  const resolved = "then" in params ? use(params) : params;
  return <PropertyUnitDetailPage unitId={resolved.unitId} workspaceKey={resolved.workspaceKey} />;
}
