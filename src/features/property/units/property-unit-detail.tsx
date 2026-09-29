"use client";

import { PageHeader, Section } from "@/components/ui";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Tabs, type TabItem } from "@/components/ui";
import type { SessionProjection } from "@/features/session";

import { PropertyLayout } from "../property-layout";
import { PropertySourceNote, PropertyUnavailableFormDrawer, PropertyUnavailableState, type PropertyFormField } from "../shared/property-ui";
import styles from "../property.module.css";

const tabs: readonly TabItem[] = [
  { id: "summary", label: "Ringkasan" }, { id: "progress", label: "Progres" }, { id: "milestone", label: "Milestone" },
  { id: "inspection", label: "Inspeksi" }, { id: "documents", label: "Dokumen" }, { id: "findings", label: "Temuan" },
  { id: "sales", label: "Booking / Sales" }, { id: "handover", label: "Serah Terima" }, { id: "activity", label: "Aktivitas" },
];
const handoverFields: readonly PropertyFormField[] = [
  { label: "Proyek / Unit", name: "project-unit" }, { label: "Penyelesaian Teknis", name: "technical-completion" },
  { label: "Inspeksi Akhir", name: "final-inspection" }, { label: "Penyelesaian Cacat", name: "defect-resolution" },
  { label: "Kesiapan", name: "readiness" }, { label: "Evidence", name: "evidence" }, { label: "Referensi Dokumen BAST", name: "bast-reference" }, { label: "Catatan", name: "notes", type: "textarea" },
];

export function PropertyUnitDetailPage({ unitId, workspaceKey }: Readonly<{ unitId: string; workspaceKey?: string }>) {
  return <PropertyLayout workspaceKey={workspaceKey}>{(session) => <PropertyUnitDetail session={session} unitId={unitId} />}</PropertyLayout>;
}

function PropertyUnitDetail({ session, unitId }: Readonly<{ session: SessionProjection; unitId: string }>) {
  void unitId;
  const router = useRouter();
  const [tab, setTab] = useState("summary");
  const [handoverOpen, setHandoverOpen] = useState(false);
  const activeKey = session.principal && "actor" in session.principal ? session.principal.active_workspace?.workspace.workspace_key : null;
  const base = activeKey ? `/workspace/${encodeURIComponent(activeKey)}` : "/workspace";
  return <div className={styles.page}>
    <PageHeader description="Detail unit Property; boundary workspace tervalidasi sebelum projection ditampilkan." eyebrow="PROPERTY & TEKNIK" metadata={`Workspace aktif: ${activeKey ?? "—"}`} title="Detail Unit" />
    <PropertySourceNote>Projection unit belum terhubung. Status teknis, status komersial, dan serah terima tetap terpisah.</PropertySourceNote>
    <Tabs ariaLabel="Navigasi detail unit" items={tabs} onValueChange={setTab} value={tab} />
    {tab === "summary" ? <><Section title="Status Teknis"><PropertyUnavailableState description="Status teknis unit belum tersedia." /></Section><Section title="Kesiapan Teknis"><PropertyUnavailableState description="Kesiapan teknis belum dinilai." title="Belum Dinilai" /></Section><Section title="Status Komersial"><PropertyUnavailableState description="Status komersial adalah projection Sales read-only dan belum tersedia." /></Section><Section title="Serah Terima"><PropertyUnavailableState description="Kesiapan serah terima belum tersedia." /></Section></> : <Section title={tabs.find((item) => item.id === tab)?.label ?? "Ringkasan"}><PropertyUnavailableState description="Data detail unit belum terhubung." /></Section>}
    <div className={styles.actionBar}><Button onClick={() => router.push(`${base}/documents`)} variant="secondary">Buka Dokumen</Button><Button onClick={() => router.push(`${base}/findings`)} variant="secondary">Buka Temuan</Button><Button onClick={() => setHandoverOpen(true)} variant="primary">Siapkan Kesiapan Serah Terima</Button></div>
    <PropertyUnavailableFormDrawer description="Handover readiness belum memiliki lifecycle dan capability canonical." fields={handoverFields} onClose={() => setHandoverOpen(false)} open={handoverOpen} submitLabel="Simpan Kesiapan" title="Kesiapan Serah Terima" />
  </div>;
}
