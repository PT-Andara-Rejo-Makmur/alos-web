"use client";

import { AraPage } from "@/features/ara";

/**
 * Universal ARA wrapper for Executive Workspace context.
 * UI implementation and authority boundaries are strictly centralized in Universal ARA.
 */
export function ExecutiveAraPage() {
  return <AraPage workspaceKey="executive" />;
}
