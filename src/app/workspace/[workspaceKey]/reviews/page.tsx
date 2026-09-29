"use client";

import { use } from "react";
import { ExecutiveReviewsPage } from "@/features/executive";

export default function WorkspaceExecutiveReviewsRoute({
  params,
}: Readonly<{ params: Promise<{ workspaceKey: string }> | { workspaceKey: string } }>) {
  const resolved = "then" in params ? use(params) : params;
  return <ExecutiveReviewsPage workspaceKey={resolved.workspaceKey} />;
}
