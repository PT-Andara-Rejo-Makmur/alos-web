import {
  BarChart3,
  BriefcaseBusiness,
  CheckSquare,
  ClipboardCheck,
  ClipboardList,
  FileCheck2,
  FileText,
  Gauge,
  Hammer,
  LayoutDashboard,
  MessageCircleQuestion,
  Package,
  ReceiptText,
  Target,
  UsersRound,
} from "lucide-react";

import type { AppNavigationSection } from "@/components/app-shell/app-shell";

/** Property navigation is built from the authoritative workspace key only for URL identity. */
export function propertyNavigation(workspaceKey: string): readonly AppNavigationSection[] {
  const base = `/workspace/${encodeURIComponent(workspaceKey)}`;

  return [
    {
      label: "PUSAT PROYEK",
      items: [
        { href: `${base}/summary`, icon: Gauge, label: "Ringkasan" },
        { href: `${base}/portfolio`, icon: BriefcaseBusiness, label: "Portofolio Proyek" },
      ],
    },
    {
      label: "PELAKSANAAN",
      items: [
        { href: `${base}/progress`, icon: ClipboardList, label: "Progres & Jadwal" },
        { href: `${base}/execution`, icon: Hammer, label: "Pekerjaan & Milestone" },
        { href: `${base}/units`, icon: LayoutDashboard, label: "Unit & Kesiapan" },
        { href: `${base}/quality`, icon: ClipboardCheck, label: "Inspeksi & Kualitas" },
      ],
    },
    {
      label: "SUMBER DAYA",
      items: [
        { href: `${base}/contractors`, icon: UsersRound, label: "Kontraktor" },
        { href: `${base}/budget`, icon: ReceiptText, label: "Anggaran & RAB" },
        { href: `${base}/materials`, icon: Package, label: "Material & Pengadaan" },
      ],
    },
    {
      label: "KINERJA",
      items: [{ href: `${base}/performance`, icon: Target, label: "Target & Kinerja" }],
    },
    {
      label: "PEKERJAAN",
      items: [
        { href: `${base}/projects`, icon: BriefcaseBusiness, label: "Proyek" },
        { href: `${base}/tasks`, icon: CheckSquare, label: "Tugas" },
        { href: `${base}/approvals`, icon: FileCheck2, label: "Persetujuan" },
        { href: `${base}/documents`, icon: FileText, label: "Dokumen" },
        { href: `${base}/reports`, icon: BarChart3, label: "Laporan" },
        { href: `${base}/findings`, icon: ClipboardCheck, label: "Temuan" },
      ],
    },
    {
      label: "ARA",
      items: [{ href: `${base}/ara`, icon: MessageCircleQuestion, label: "Tanya ARA" }],
    },
  ];
}
