import {
  BarChart3,
  Banknote,
  BriefcaseBusiness,
  CheckSquare,
  FileCheck2,
  FileText,
  Gauge,
  Landmark,
  MessageCircleQuestion,
  ReceiptText,
  Scale,
  WalletCards,
} from "lucide-react";

import type { AppNavigationSection } from "@/components/app-shell/app-shell";

/** Finance navigation uses the workspace key only as the canonical URL identity. */
export function financeNavigation(workspaceKey: string): readonly AppNavigationSection[] {
  const base = `/workspace/${encodeURIComponent(workspaceKey)}`;
  return [
    {
      label: "PUSAT KEUANGAN",
      items: [
        { href: `${base}/summary`, icon: Gauge, label: "Ringkasan" },
        { href: `${base}/liquidity`, icon: WalletCards, label: "Kas & Likuiditas" },
      ],
    },
    {
      label: "TRANSAKSI & KONTROL",
      items: [
        { href: `${base}/receivables`, icon: Banknote, label: "Penerimaan & Piutang" },
        { href: `${base}/payables`, icon: ReceiptText, label: "Pengeluaran & Utang" },
        { href: `${base}/budget`, icon: Scale, label: "Anggaran & Realisasi" },
        { href: `${base}/reconciliation`, icon: Landmark, label: "Rekonsiliasi" },
      ],
    },
    {
      label: "PAJAK",
      items: [{ href: `${base}/tax`, icon: FileText, label: "Pajak & Kewajiban" }],
    },
    {
      label: "KINERJA",
      items: [{ href: `${base}/performance`, icon: BarChart3, label: "Target & Kinerja" }],
    },
    {
      label: "PEKERJAAN",
      items: [
        { href: `${base}/projects`, icon: BriefcaseBusiness, label: "Proyek" },
        { href: `${base}/tasks`, icon: CheckSquare, label: "Tugas" },
        { href: `${base}/approvals`, icon: FileCheck2, label: "Persetujuan" },
        { href: `${base}/documents`, icon: FileText, label: "Dokumen" },
        { href: `${base}/reports`, icon: BarChart3, label: "Laporan" },
        { href: `${base}/findings`, icon: FileCheck2, label: "Temuan" },
      ],
    },
    {
      label: "ARA",
      items: [{ href: `${base}/ara`, icon: MessageCircleQuestion, label: "Tanya ARA" }],
    },
  ];
}
