"use client";

import { useState } from "react";
import { PageHeader, Section, Tabs, type TabItem } from "@/components/ui";
import type { SessionProjection } from "@/features/session";

import { PropertyLayout } from "../property-layout";
import { PropertySourceNote, PropertyUnavailableState } from "../shared/property-ui";
import styles from "../property.module.css";

const tabs: readonly TabItem[] = [
  { id: "summary", label: "Ringkasan" }, { id: "work", label: "Pekerjaan" }, { id: "progress", label: "Progres" },
  { id: "documents", label: "Dokumen" }, { id: "inspection", label: "Inspeksi" }, { id: "findings", label: "Temuan" }, { id: "opname", label: "Opname" }, { id: "history", label: "Riwayat" },
];

export function PropertyContractorDetailPage({ contractorId, workspaceKey }: Readonly<{ contractorId: string; workspaceKey?: string }>) { return <PropertyLayout workspaceKey={workspaceKey}>{(session) => <PropertyContractorDetail contractorId={contractorId} session={session} />}</PropertyLayout>; }

function PropertyContractorDetail({ contractorId, session }: Readonly<{ contractorId: string; session: SessionProjection }>) {
  const [tab, setTab] = useState("summary");
  const activeKey = session.principal && "actor" in session.principal ? session.principal.active_workspace?.workspace.workspace_key : null;
  return <div className={styles.page}>
    <PageHeader description="Detail pelaksanaan teknis kontraktor dan projection lintas domain." eyebrow="PROPERTY & TEKNIK" metadata={`Workspace aktif: ${activeKey ?? "—"}`} title="Detail Kontraktor" />
    <PropertySourceNote>Detail kontraktor belum terhubung. Status legal dan pembayaran tetap read-only.</PropertySourceNote>
    <Tabs ariaLabel="Navigasi detail kontraktor" items={tabs} onValueChange={setTab} value={tab} />
    {tab === "summary" ? <><Section title="Pelaksanaan Teknis"><PropertyUnavailableState description={`Pelaksanaan teknis untuk kontraktor ${contractorId} belum tersedia.`} /></Section><Section title="Status Legal"><PropertyUnavailableState description="Status legal belum tersedia dan tidak dapat diubah Property." /></Section><Section title="Pembayaran"><PropertyUnavailableState description="Status pembayaran belum tersedia dan tidak dapat diubah Property." /></Section></> : <Section title={tabs.find((item) => item.id === tab)?.label ?? "Ringkasan"}><PropertyUnavailableState description="Data detail kontraktor belum terhubung." /></Section>}
  </div>;
}
