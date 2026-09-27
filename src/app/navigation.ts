import {
  AlertCircle,
  BarChart3,
  Briefcase,
  CheckSquare,
  FileCheck2,
  FileText,
  House,
  LayoutDashboard,
} from "lucide-react";

import type { AppNavigationSection } from "@/components/app-shell/app-shell";

export function navigationForSession(
  includeExecutive: boolean,
  workspaceKey?: string | null,
): readonly AppNavigationSection[] {
  const base = workspaceKey ? `/workspace/${workspaceKey}` : "/workspace";

  return [
    {
      items: [
        { href: "/workspace", icon: House, label: "Beranda" },
        ...(includeExecutive
          ? [{ href: "/workspace/executive", icon: LayoutDashboard, label: "Pusat Kendali" }]
          : []),
      ],
      label: "UTAMA",
    },
    {
      items: [
        { href: `${base}/projects`, icon: Briefcase, label: "Proyek" },
        { href: `${base}/tasks`, icon: CheckSquare, label: "Tugas" },
        { href: `${base}/approvals`, icon: FileCheck2, label: "Persetujuan" },
        { href: `${base}/documents`, icon: FileText, label: "Dokumen" },
        { href: `${base}/reports`, icon: BarChart3, label: "Laporan" },
        { href: `${base}/findings`, icon: AlertCircle, label: "Temuan" },
      ],
      label: "PEKERJAAN",
    },
  ];
}
