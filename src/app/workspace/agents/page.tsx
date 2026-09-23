import { Suspense } from "react";
import type { Metadata } from "next";

import { AgentWorkforcePage } from "@/features/agent-workforce";

export const metadata: Metadata = {
  title: "Agent Workforce | ALOS",
  description:
    "Business-facing view of ALOS AI capabilities and digital workforce for active workspaces.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function WorkspaceAgentsRoute() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            display: "flex",
            height: "100vh",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#141619",
            color: "#c5a572",
            fontFamily: "Manrope, sans-serif",
          }}
        >
          <p>Memuat Agent Workforce...</p>
        </div>
      }
    >
      <AgentWorkforcePage />
    </Suspense>
  );
}
