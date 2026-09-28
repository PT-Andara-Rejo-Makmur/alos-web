"use client";
import { use } from "react";
import { SalesReadinessPage } from "@/features/sales";
export default function Page({ params }: Readonly<{ params: Promise<{ workspaceKey: string }> }>) {
  return <SalesReadinessPage workspaceKey={use(params).workspaceKey} title="Pipeline Penjualan" description="Pantau prospek dan tahap penjualan sesuai data yang tersedia." detail="Daftar pipeline, nilai potensi, dan tindakan berikutnya belum terhubung." />;
}
