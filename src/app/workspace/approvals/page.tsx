import type { Metadata } from "next";
import { WorkspaceSharedModulePage } from "@/features/workspace-shell";

export const metadata: Metadata = {
  title: "Approvals | ALOS",
  description: "Daftar approval, maker-checker, dan eksekusi aksi material yang disetujui.",
  robots: { index: false, follow: false },
};

export default function WorkspaceApprovalsRoute() {
  return <WorkspaceSharedModulePage module="approvals" />;
}
