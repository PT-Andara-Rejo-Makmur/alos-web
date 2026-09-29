"use client";
import { use } from "react";
import { PropertyUnitsPage } from "@/features/property";

export default function Page({ params }: Readonly<{ params: Promise<{ workspaceKey: string }> | { workspaceKey: string } }>) {
  const resolved = "then" in params ? use(params) : params;
  return <PropertyUnitsPage workspaceKey={resolved.workspaceKey} />;
}
