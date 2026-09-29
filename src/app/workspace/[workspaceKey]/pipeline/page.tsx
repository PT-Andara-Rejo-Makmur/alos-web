"use client";
import { use } from "react";
import { SalesReadinessPage } from "@/features/sales";
export default function Page({ params }: Readonly<{ params: Promise<{ workspaceKey: string }> | { workspaceKey: string } }>) {
  const resolved = "then" in params ? use(params) : params;
  return <SalesReadinessPage workspaceKey={resolved.workspaceKey} title="Pipeline Penjualan" description="Pantau prospek dan tahap penjualan sesuai data yang tersedia." detail="Daftar pipeline, nilai potensi, dan tindakan berikutnya belum terhubung." />;
}
