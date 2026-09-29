"use client";
import { use } from "react";
import { SalesReadinessPage } from "@/features/sales";
export default function Page({ params }: Readonly<{ params: Promise<{ workspaceKey: string }> | { workspaceKey: string } }>) {
  const resolved = "then" in params ? use(params) : params;
  return <SalesReadinessPage workspaceKey={resolved.workspaceKey} title="Campaign & Channel" description="Pantau atribusi campaign dan channel berdasarkan data marketing resmi." detail="Campaign, anggaran, belanja, dan CPL belum terhubung; nilai tidak ditampilkan sebagai nol." />;
}
