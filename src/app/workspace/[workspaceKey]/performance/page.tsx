"use client";
import { use } from "react";
import { SalesReadinessPage } from "@/features/sales";
const tabs = [{ id: "summary", label: "Ringkasan" }, { id: "targets", label: "Target" }, { id: "kpi", label: "KPI" }, { id: "owner", label: "Per Sales" }, { id: "project", label: "Per Project" }, { id: "channel", label: "Per Channel" }, { id: "history", label: "Riwayat" }] as const;
export default function Page({ params }: Readonly<{ params: Promise<{ workspaceKey: string }> }>) {
  return <SalesReadinessPage workspaceKey={use(params).workspaceKey} title="Target & Kinerja" description="Target dan kinerja Sales ditampilkan dari sumber Strategy yang berwenang." detail="Target Sales dan closing resmi memerlukan projection Strategy serta outcome lintas domain." tabs={tabs} />;
}
