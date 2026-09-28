"use client";
import { use } from "react";
import { SalesReadinessPage } from "@/features/sales";
export default function Page({ params }: Readonly<{ params: Promise<{ workspaceKey: string }> }>) {
  return <SalesReadinessPage workspaceKey={use(params).workspaceKey} title="KPR & Akad" description="Visibilitas operasional KPR dan akad sesuai kewenangan Sales." detail="Tahap KPR, SP3K, dan akad memerlukan contract serta verifikasi Finance dan Legal." />;
}
