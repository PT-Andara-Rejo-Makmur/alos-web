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
import { propertyNavigation } from "@/features/property/navigation";
import { salesNavigation } from "@/features/sales/navigation";
import { financeNavigation } from "@/features/finance/navigation";
import { legalNavigation } from "@/features/legal/navigation";
import { hrNavigation } from "@/features/hr/navigation";
import { hasGaScope } from "@/features/hr/hr-model";
import { itNavigation } from "@/features/it/navigation";
import type { SessionProjection } from "@/features/session";
import { resolveWorkspaceDomain } from "@/features/session";

export function navigationForSession(
  includeExecutive: boolean,
  workspaceKey?: string | null,
  includeAccountManagement = false,
  session?: SessionProjection | null,
): readonly AppNavigationSection[] {
  const activeKey =
    session?.principal && "actor" in session.principal && session.principal.active_workspace
      ? session.principal.active_workspace.workspace.workspace_key
      : null;
  const effectiveWorkspaceKey = workspaceKey ?? activeKey;

  const resolution = session ? resolveWorkspaceDomain(session, effectiveWorkspaceKey) : null;
  const navigationWorkspaceKey = resolution?.valid
    ? resolution.activeWorkspaceKey
    : session
      ? activeKey
      : effectiveWorkspaceKey;

  if (resolution?.valid) {
    if (resolution.domain === "EXECUTIVE") {
      return executiveNavigation(resolution.activeWorkspaceKey!);
    }
    if (resolution.domain === "SALES") {
      return salesNavigation(resolution.activeWorkspaceKey!);
    }
    if (resolution.domain === "PROPERTY") {
      return propertyNavigation(resolution.activeWorkspaceKey!);
    }
    if (resolution.domain === "FINANCE") {
      return financeNavigation(resolution.activeWorkspaceKey!);
    }
    if (resolution.domain === "LEGAL") {
      return legalNavigation(resolution.activeWorkspaceKey!);
    }
    if (resolution.domain === "HR_GA") {
      return hrNavigation(resolution.activeWorkspaceKey!, hasGaScope(session));
    }
    if (resolution.domain === "IT") {
      return itNavigation(resolution.activeWorkspaceKey!);
    }
  }

  const base = navigationWorkspaceKey ? `/workspace/${encodeURIComponent(navigationWorkspaceKey)}` : "/workspace";
  const executiveHref =
    resolution?.domain === "EXECUTIVE" && resolution.activeWorkspaceKey
      ? `/workspace/${encodeURIComponent(resolution.activeWorkspaceKey)}/summary`
      : null;

  const sections: AppNavigationSection[] = [
    {
      items: [
        { href: "/workspace", icon: House, label: "Beranda" },
        ...(includeExecutive && executiveHref
          ? [{ href: executiveHref, icon: LayoutDashboard, label: "Pusat Kendali" }]
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
  return includeAccountManagement && navigationWorkspaceKey
    ? [...sections, { items: [{ href: `${base}/accounts`, icon: Users, label: "Pengguna & Akses" }], label: "ADMINISTRASI" }]
    : sections;
}

/** Navigation for the IT identity surface; callers must already have passed the authoritative access check. */
export function navigationForItWorkspace(workspaceKey: string): readonly AppNavigationSection[] {
  return itNavigation(workspaceKey);
}
