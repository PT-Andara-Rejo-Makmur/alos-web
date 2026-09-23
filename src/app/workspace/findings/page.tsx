import type { Metadata } from "next";
import { WorkspaceSharedModulePage } from "@/features/workspace-shell";

export const metadata: Metadata = {
  title: "Findings | ALOS",
  description: "Monitoring temuan, risiko operasional, dan tindak lanjut mitigasi.",
  robots: { index: false, follow: false },
};

export default function WorkspaceFindingsRoute() {
  return <WorkspaceSharedModulePage module="findings" />;
}
