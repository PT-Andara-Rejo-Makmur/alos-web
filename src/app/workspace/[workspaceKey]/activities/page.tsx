"use client";
import { use } from "react";
import { SalesReadinessPage } from "@/features/sales";
const tabs = [{ id: "today", label: "Hari Ini" }, { id: "overdue", label: "Terlambat" }, { id: "upcoming", label: "Mendatang" }, { id: "done", label: "Selesai" }, { id: "all", label: "Semua Aktivitas" }] as const;
export default function Page({ params }: Readonly<{ params: Promise<{ workspaceKey: string }> }>) {
  return <SalesReadinessPage workspaceKey={use(params).workspaceKey} title="Aktivitas & Tindak Lanjut" description="Catatan interaksi dan tindak lanjut operasional penjualan." detail="Aktivitas, survey, dan tindak lanjut belum terhubung." tabs={tabs} />;
}
