"use client";
import { use } from "react";
import { SalesModuleReadinessPage } from "@/features/sales";
export default function Page({ params }: Readonly<{ params: Promise<{ workspaceKey: string }> | { workspaceKey: string } }>) {
  const resolved = "then" in params ? use(params) : params;
  return <SalesModuleReadinessPage workspaceKey={resolved.workspaceKey} title="KPR & Akad" description="Visibilitas operasional KPR dan akad sesuai kewenangan Sales." detail="Tahap KPR, SP3K, dan akad memerlukan contract serta verifikasi Finance dan Legal." />;
}
