import type { Metadata } from "next";
import { WorkspaceSharedModulePage } from "@/features/workspace-shell";

export const metadata: Metadata = {
  title: "Projects | ALOS",
  description: "Portofolio proyek, milestone, dan isu lintas divisi PT Andara Rejo Makmur.",
  robots: { index: false, follow: false },
};

export default function WorkspaceProjectsRoute() {
  return <WorkspaceSharedModulePage module="projects" />;
}
