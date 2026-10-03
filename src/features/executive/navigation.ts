import {
  AlertCircle,
  BarChart3,
  Briefcase,
  Building2,
  CheckSquare,
  ClipboardCheck,
  FileCheck2,
  FileText,
  Gauge,
  LayoutDashboard,
  ListChecks,
  MessageCircleQuestion,
  Target,
} from "lucide-react";

import type { AppNavigationSection } from "@/components/app-shell/app-shell";

export function executiveNavigation(workspaceKey: string): readonly AppNavigationSection[] {
  const base = `/workspace/${encodeURIComponent(workspaceKey)}`;

  return [
    {
      items: [
        { href: `${base}/summary`, icon: LayoutDashboard, label: "Ringkasan" },
        { href: `${base}/brief`, icon: ClipboardCheck, label: "Brief Eksekutif" },
      ],
      label: "PUSAT KENDALI",
    },
    {
      items: [
        { href: `${base}/planning`, icon: Target, label: "Rencana & Target" },
        { href: `${base}/performance`, icon: Gauge, label: "Kinerja" },
        { href: `${base}/initiatives`, icon: ListChecks, label: "Inisiatif Strategis" },
        { href: `${base}/reviews`, icon: ClipboardCheck, label: "Review & Revisi" },
      ],
      label: "STRATEGI & KINERJA",
    },
    {
      items: [{ href: `${base}/divisions`, icon: Building2, label: "Divisi" }],
      label: "ORGANISASI",
    },
    {
      items: [
        { href: `${base}/processes`, icon: CheckSquare, label: "Perlu Tindakan" },
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
      items: [{ href: `${base}/ara`, icon: MessageCircleQuestion, label: "Tanya ARA" }],
      label: "ARA",
    },
  ];
}

