import {
  AlertCircle,
  BarChart3,
  Briefcase,
  CheckSquare,
  FileCheck2,
  FileText,
  House,
  LayoutDashboard,
  MessageCircleQuestion,
  Users,
} from "lucide-react";

import type { AppNavigationSection } from "@/components/app-shell/app-shell";
import { executiveNavigation } from "@/features/executive/navigation";
import { activeSalesWorkspaceKey, hasSalesContext } from "@/features/sales/sales-model";
import { salesNavigation } from "@/features/sales/navigation";
import type { SessionProjection } from "@/features/session";

export function navigationForSession(
  includeExecutive: boolean,
  workspaceKey?: string | null,
  includeAccountManagement = false,
  session?: SessionProjection | null,
): readonly AppNavigationSection[] {
  if (includeExecutive && workspaceKey === "executive") return executiveNavigation;
  const activeKey =
    session?.principal && "actor" in session.principal && session.principal.active_workspace
      ? session.principal.active_workspace.workspace.workspace_key
      : null;
  const effectiveWorkspaceKey = workspaceKey ?? activeKey;

  const salesWorkspaceKey = session && hasSalesContext(session) ? activeSalesWorkspaceKey(session) : null;
  if (salesWorkspaceKey && salesWorkspaceKey === effectiveWorkspaceKey) return salesNavigation(salesWorkspaceKey);
  const base = effectiveWorkspaceKey ? `/workspace/${effectiveWorkspaceKey}` : "/workspace";

  const sections: AppNavigationSection[] = [
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
    {
      items: [
        { href: `${base}/ara`, icon: MessageCircleQuestion, label: "Tanya ARA" },
      ],
      label: "ARA",
    },
  ];
  return includeAccountManagement && workspaceKey
    ? [...sections, { items: [{ href: `/workspace/${workspaceKey}/accounts`, icon: Users, label: "Pengguna & Akses" }], label: "ADMINISTRASI" }]
    : sections;
}

/** Navigation for the IT identity surface; callers must already have passed the authoritative access check. */
export function navigationForItWorkspace(workspaceKey: string): readonly AppNavigationSection[] {
  return navigationForSession(false, workspaceKey, true);
}
