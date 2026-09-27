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

export const executiveNavigation: readonly AppNavigationSection[] = [
  {
    items: [
      { href: "/workspace/executive/summary", icon: LayoutDashboard, label: "Ringkasan" },
      { href: "/workspace/executive/brief", icon: ClipboardCheck, label: "Brief Eksekutif" },
    ],
    label: "PUSAT KENDALI",
  },
  {
    items: [
      { href: "/workspace/executive/planning", icon: Target, label: "Rencana & Target" },
      { href: "/workspace/executive/performance", icon: Gauge, label: "Kinerja" },
      { href: "/workspace/executive/initiatives", icon: ListChecks, label: "Inisiatif Strategis" },
      { href: "/workspace/executive/reviews", icon: ClipboardCheck, label: "Review & Revisi" },
    ],
    label: "STRATEGI & KINERJA",
  },
  {
    items: [{ href: "/workspace/executive/divisions", icon: Building2, label: "Divisi" }],
    label: "ORGANISASI",
  },
  {
    items: [
      { href: "/workspace/executive/projects", icon: Briefcase, label: "Proyek" },
      { href: "/workspace/executive/tasks", icon: CheckSquare, label: "Tugas" },
      { href: "/workspace/executive/approvals", icon: FileCheck2, label: "Persetujuan" },
      { href: "/workspace/executive/documents", icon: FileText, label: "Dokumen" },
      { href: "/workspace/executive/reports", icon: BarChart3, label: "Laporan" },
      { href: "/workspace/executive/findings", icon: AlertCircle, label: "Temuan" },
    ],
    label: "PEKERJAAN",
  },
  {
    items: [{ href: "/workspace/executive/ara", icon: MessageCircleQuestion, label: "Tanya ARA" }],
    label: "ARA",
  },
];
