import type { Metadata } from "next";
import { WorkspaceSharedModulePage } from "@/features/workspace-shell";

export const metadata: Metadata = {
  title: "Tasks | ALOS",
  description: "Task Board dan eksekusi tugas operasional PT Andara Rejo Makmur.",
  robots: { index: false, follow: false },
};

export default function WorkspaceTasksRoute() {
  return <WorkspaceSharedModulePage module="tasks" />;
}
