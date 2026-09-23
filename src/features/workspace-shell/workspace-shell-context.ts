"use client";

import { createContext, useContext } from "react";
import type { WorkspaceShellContextValue } from "./types";

export type { WorkspaceShellContextValue };

export const WorkspaceShellContext = createContext<WorkspaceShellContextValue | null>(null);

export function useWorkspaceShell(): WorkspaceShellContextValue {
  const context = useContext(WorkspaceShellContext);
  if (!context) {
    throw new Error("useWorkspaceShell must be used within a WorkspaceShell");
  }
  return context;
}
