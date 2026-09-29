"use client";
import { use } from "react";
import { PropertyProgressPage } from "@/features/property";

export default function Page({ params }: Readonly<{ params: Promise<{ workspaceKey: string }> | { workspaceKey: string } }>) {
  const resolved = "then" in params ? use(params) : params;
  return <PropertyProgressPage workspaceKey={resolved.workspaceKey} />;
}
