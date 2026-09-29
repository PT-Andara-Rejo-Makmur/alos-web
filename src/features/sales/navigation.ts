import {
  BarChart3, Briefcase, CheckSquare, ClipboardList, FileCheck2, FileText, Funnel,
  Gauge, Megaphone, MessageCircleQuestion, ReceiptText, Target, UsersRound,
} from "lucide-react";

import type { AppNavigationSection } from "@/components/app-shell/app-shell";

/** Navigation is built from the Backend-projected active workspace, never a fixed URL key. */
export function salesNavigation(workspaceKey: string): readonly AppNavigationSection[] {
  const base = `/workspace/${encodeURIComponent(workspaceKey)}`;

  return [
  { label: "PUSAT PENJUALAN", items: [
    { href: `${base}/summary`, icon: Gauge, label: "Ringkasan" },
    { href: `${base}/pipeline`, icon: Funnel, label: "Pipeline Penjualan" },
  ] },
  { label: "PELANGGAN & AKTIVITAS", items: [
    { href: `${base}/leads`, icon: UsersRound, label: "Prospek & Lead" },
    { href: `${base}/activities`, icon: ClipboardList, label: "Aktivitas & Tindak Lanjut" },
    { href: `${base}/bookings`, icon: ReceiptText, label: "Booking & Closing" },
    { href: `${base}/kpr`, icon: FileCheck2, label: "KPR & Akad" },
  ] },
  { label: "MARKETING & KINERJA", items: [
    { href: `${base}/campaigns`, icon: Megaphone, label: "Kampanye & Saluran" },
    { href: `${base}/performance`, icon: Target, label: "Target & Kinerja" },
  ] },
  { label: "PEKERJAAN", items: [
    { href: `${base}/projects`, icon: Briefcase, label: "Proyek" },
    { href: `${base}/tasks`, icon: CheckSquare, label: "Tugas" },
    { href: `${base}/approvals`, icon: FileCheck2, label: "Persetujuan" },
    { href: `${base}/documents`, icon: FileText, label: "Dokumen" },
    { href: `${base}/reports`, icon: BarChart3, label: "Laporan" },
    { href: `${base}/findings`, icon: FileCheck2, label: "Temuan" },
  ] },
  { label: "ARA", items: [{ href: `${base}/ara`, icon: MessageCircleQuestion, label: "Tanya ARA" }] },
  ];
}
