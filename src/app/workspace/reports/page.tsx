import type { Metadata } from "next";
import { WorkspaceSharedModulePage } from "@/features/workspace-shell";

export const metadata: Metadata = {
  title: "Reports | ALOS",
  description: "Definisi, jadwal, dan generasi laporan operasional dengan provenance terkontrol.",
  robots: { index: false, follow: false },
};

export default function WorkspaceReportsRoute() {
  return <WorkspaceSharedModulePage module="reports" />;
}
