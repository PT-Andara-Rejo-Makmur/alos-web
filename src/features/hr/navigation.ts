import {
  Archive,
  BarChart3,
  BriefcaseBusiness,
  CalendarDays,
  CheckSquare,
  ClipboardCheck,
  FileCheck2,
  FileText,
  Gauge,
  HeartHandshake,
  MessageCircleQuestion,
  Network,
  ReceiptText,
  UserRoundPlus,
  Users,
  WalletCards,
} from "lucide-react";
import type { AppNavigationSection } from "@/components/app-shell/app-shell";

export function hrNavigation(workspaceKey: string, includeGa: boolean): readonly AppNavigationSection[] {
  const base = `/workspace/${encodeURIComponent(workspaceKey)}`;
  const sections: AppNavigationSection[] = [
    { label: "PUSAT SDM", items: [
      { href: `${base}/summary`, icon: Gauge, label: "Ringkasan" },
      { href: `${base}/organization`, icon: Network, label: "Organisasi & Tenaga Kerja" },
    ] },
    { label: "TALENTA", items: [
      { href: `${base}/recruitment`, icon: UserRoundPlus, label: "Rekrutmen & Kandidat" },
      { href: `${base}/onboarding`, icon: HeartHandshake, label: "Onboarding & Masa Percobaan" },
      { href: `${base}/employees`, icon: Users, label: "Karyawan" },
    ] },
    { label: "OPERASIONAL SDM", items: [
      { href: `${base}/attendance`, icon: CalendarDays, label: "Kehadiran & Cuti" },
      { href: `${base}/people-performance`, icon: ClipboardCheck, label: "Kinerja & Pengembangan" },
      { href: `${base}/compensation`, icon: WalletCards, label: "Kompensasi & Benefit" },
      { href: `${base}/compliance`, icon: FileText, label: "Dokumen & Kepatuhan" },
      { href: `${base}/offboarding`, icon: Archive, label: "Perubahan & Offboarding" },
      ...(includeGa ? [{ href: `${base}/ga`, icon: BriefcaseBusiness, label: "GA & Fasilitas" }] : []),
    ] },
  ];
  sections.push(
    { label: "KINERJA", items: [{ href: `${base}/performance`, icon: BarChart3, label: "Target & Kinerja" }] },
    { label: "PEKERJAAN", items: [
      { href: `${base}/projects`, icon: BriefcaseBusiness, label: "Proyek" },
      { href: `${base}/tasks`, icon: CheckSquare, label: "Tugas" },
      { href: `${base}/approvals`, icon: FileCheck2, label: "Persetujuan" },
      { href: `${base}/documents`, icon: FileText, label: "Dokumen" },
      { href: `${base}/reports`, icon: ReceiptText, label: "Laporan" },
      { href: `${base}/findings`, icon: ClipboardCheck, label: "Temuan" },
    ] },
    { label: "ARA", items: [{ href: `${base}/ara`, icon: MessageCircleQuestion, label: "Tanya ARA" }] },
  );
  return sections;
}
