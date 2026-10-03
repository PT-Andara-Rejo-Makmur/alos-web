import {
  AlertCircle,
  BarChart3,
  Boxes,
  Briefcase,
  CheckSquare,
  CircleHelp,
  FileCheck2,
  FileText,
  Gauge,
  KeyRound,
  Link2,
  MessageCircleQuestion,
  MonitorCog,
  Package,
  Rocket,
  ServerCog,
  ShieldCheck,
  TicketCheck,
  Users,
} from "lucide-react";

import type { AppNavigationSection } from "@/components/app-shell/app-shell";

/** IT navigation is built from the validated active workspace key. */
export function itNavigation(workspaceKey: string): readonly AppNavigationSection[] {
  const base = `/workspace/${encodeURIComponent(workspaceKey)}`;
  return [
    { label: "PUSAT IT", items: [
      { href: `${base}/summary`, icon: Gauge, label: "Ringkasan" },
      { href: `${base}/services`, icon: TicketCheck, label: "Layanan & Insiden" },
    ] },
    { label: "PLATFORM & SISTEM", items: [
      { href: `${base}/systems`, icon: MonitorCog, label: "Sistem & Aplikasi" },
      { href: `${base}/infrastructure`, icon: ServerCog, label: "Infrastruktur & Lingkungan" },
      { href: `${base}/alos-genesis`, icon: Boxes, label: "ALOS & GENESIS" },
      { href: `${base}/integrations`, icon: Link2, label: "Integrasi & Connector" },
    ] },
    { label: "AKSES & IDENTITAS", items: [
      { href: `${base}/accounts`, icon: Users, label: "Akun Karyawan" },
      { href: `${base}/access`, icon: KeyRound, label: "Akses & Identitas" },
      { href: `${base}/security`, icon: ShieldCheck, label: "Keamanan & Kepatuhan" },
    ] },
    { label: "PERUBAHAN", items: [{ href: `${base}/changes`, icon: Rocket, label: "Perubahan & Rilis" }] },
    { label: "OPERASIONAL", items: [
      { href: `${base}/assets`, icon: Package, label: "Aset IT" },
      { href: `${base}/support`, icon: CircleHelp, label: "Dukungan & Permintaan" },
    ] },
    { label: "KINERJA", items: [{ href: `${base}/performance`, icon: BarChart3, label: "Target & Kinerja" }] },
    { label: "PEKERJAAN", items: [
      { href: `${base}/processes`, icon: CheckSquare, label: "Perlu Tindakan" },
      { href: `${base}/projects`, icon: Briefcase, label: "Proyek" },
      { href: `${base}/tasks`, icon: CheckSquare, label: "Tugas" },
      { href: `${base}/approvals`, icon: FileCheck2, label: "Persetujuan" },
      { href: `${base}/documents`, icon: FileText, label: "Dokumen" },
      { href: `${base}/reports`, icon: BarChart3, label: "Laporan" },
      { href: `${base}/findings`, icon: AlertCircle, label: "Temuan" },
    ] },
    { label: "ARA", items: [{ href: `${base}/ara`, icon: MessageCircleQuestion, label: "Tanya ARA" }] },
  ];
}
