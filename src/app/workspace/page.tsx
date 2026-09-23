import type { Metadata } from "next";
import { WorkspaceResolverPage } from "@/features/workspace-resolver";

export const metadata: Metadata = {
  title: "Workspace | ALOS — Andara Lean Operating System",
  description: "Pilih ruang kerja ALOS yang terverifikasi sesuai akses dan peran Anda.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function WorkspacePage() {
  return <WorkspaceResolverPage />;
}
