"use client";
import { use } from "react";
import { AraPage } from "@/features/ara";

export default function Page({
  params,
}: Readonly<{ params: Promise<{ workspaceKey: string }> | { workspaceKey: string } }>) {
  const resolved = "then" in params ? use(params) : params;
  return <AraPage workspaceKey={resolved.workspaceKey} />;
}
