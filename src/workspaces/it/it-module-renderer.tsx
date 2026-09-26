import type { ReactNode } from "react";
import { ItMonitoringWorkspace } from "./monitoring";

/**
 * Resolves IT workspace canonical module presentations.
 * Keeps WorkspaceShell decoupled from workspace-internal UI details.
 */
export function renderItWorkspaceModule(canonicalModule: string): ReactNode | null {
  if (canonicalModule === "monitoring") {
    return <ItMonitoringWorkspace />;
  }

  return null;
}
