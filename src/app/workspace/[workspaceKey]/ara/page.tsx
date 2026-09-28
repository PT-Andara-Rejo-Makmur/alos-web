"use client";
import { use } from "react";
import { SalesReadinessPage } from "@/features/sales";
export default function Page({ params }: Readonly<{ params: Promise<{ workspaceKey: string }> }>) {
  return <SalesReadinessPage workspaceKey={use(params).workspaceKey} title="Tanya ARA" description="ARA hanya dapat membaca informasi sesuai ruang lingkup dan klasifikasi yang berlaku." detail="Integrasi ARA belum tersedia; tidak ada jawaban atau analisis yang dibuat secara simulasi." />;
}
