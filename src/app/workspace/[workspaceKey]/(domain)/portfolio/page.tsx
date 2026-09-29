"use client";
import { use } from "react";
import { PropertyPortfolioPage } from "@/features/property";

export default function Page({ params }: Readonly<{ params: Promise<{ workspaceKey: string }> | { workspaceKey: string } }>) {
  const resolved = "then" in params ? use(params) : params;
  return <PropertyPortfolioPage workspaceKey={resolved.workspaceKey} />;
}
