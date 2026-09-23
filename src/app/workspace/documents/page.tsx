import type { Metadata } from "next";
import { WorkspaceSharedModulePage } from "@/features/workspace-shell";

export const metadata: Metadata = {
  title: "Documents | ALOS",
  description: "Pusat dokumen, verifikasi checklist, dan maker-checker independen.",
  robots: { index: false, follow: false },
};

export default function WorkspaceDocumentsRoute() {
  return <WorkspaceSharedModulePage module="documents" />;
}
