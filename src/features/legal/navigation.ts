import {
  AlertTriangle,
  BarChart3,
  BriefcaseBusiness,
  CheckSquare,
  FileCheck2,
  FileText,
  Gauge,
  Gavel,
  KeyRound,
  MessageCircleQuestion,
  Scale,
  ShieldCheck,
} from "lucide-react";
import type { AppNavigationSection } from "@/components/app-shell/app-shell";

export function legalNavigation(workspaceKey: string): readonly AppNavigationSection[] {
  const base = `/workspace/${encodeURIComponent(workspaceKey)}`;
  return [
    { label: "PUSAT LEGAL", items: [
      { href: `${base}/summary`, icon: Gauge, label: "Ringkasan" },
      { href: `${base}/risks`, icon: AlertTriangle, label: "Risiko & Kepatuhan" },
    ] },
    { label: "KONTRAK & DOKUMEN", items: [
      { href: `${base}/contracts`, icon: FileText, label: "Kontrak & Perjanjian" },
      { href: `${base}/reviews`, icon: Scale, label: "Review Legal" },
      { href: `${base}/permits`, icon: ShieldCheck, label: "Perizinan" },
      { href: `${base}/assets`, icon: KeyRound, label: "Legalitas Proyek & Aset" },
    ] },
    { label: "PERKARA & KEWAJIBAN", items: [
      { href: `${base}/cases`, icon: Gavel, label: "Sengketa & Klaim" },
      { href: `${base}/obligations`, icon: CheckSquare, label: "Kewajiban & Tenggat" },
    ] },
    { label: "KINERJA", items: [{ href: `${base}/performance`, icon: BarChart3, label: "Target & Kinerja" }] },
    { label: "PEKERJAAN", items: [
      { href: `${base}/projects`, icon: BriefcaseBusiness, label: "Proyek" },
      { href: `${base}/tasks`, icon: CheckSquare, label: "Tugas" },
      { href: `${base}/approvals`, icon: FileCheck2, label: "Persetujuan" },
      { href: `${base}/documents`, icon: FileText, label: "Dokumen" },
      { href: `${base}/reports`, icon: BarChart3, label: "Laporan" },
      { href: `${base}/findings`, icon: AlertTriangle, label: "Temuan" },
    ] },
    { label: "ARA", items: [{ href: `${base}/ara`, icon: MessageCircleQuestion, label: "Tanya ARA" }] },
  ];
}
