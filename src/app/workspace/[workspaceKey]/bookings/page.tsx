"use client";
import { use } from "react";
import { SalesReadinessPage } from "@/features/sales";
const tabs = [{ id: "new", label: "Booking Baru" }, { id: "verification", label: "Menunggu Verifikasi" }, { id: "processing", label: "Diproses" }, { id: "closing", label: "Closing" }, { id: "cancelled", label: "Dibatalkan" }, { id: "all", label: "Semua" }] as const;
export default function Page({ params }: Readonly<{ params: Promise<{ workspaceKey: string }> }>) {
  return <SalesReadinessPage workspaceKey={use(params).workspaceKey} title="Booking & Closing" description="Pantau pengajuan booking dan outcome closing yang telah diverifikasi." detail="Booking, verifikasi Finance/Legal, dan closing resmi belum terhubung. Sales tidak dapat menetapkan closing resmi." tabs={tabs} />;
}
