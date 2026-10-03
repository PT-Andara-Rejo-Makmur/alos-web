"use client";

import { PageHeader, Section } from "@/components/ui";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Tabs, type TabItem } from "@/components/ui";
import type { SessionProjection } from "@/features/session";

import { PropertyLayout } from "../property-layout";
import { PropertySourceNote, PropertyUnavailableState } from "../shared/property-ui";
import styles from "../property.module.css";
import { propertyApi } from "../api";
import type { PropertyUnitProjection } from "@/lib/contracts";
import { SourceStateView, sourceFailure } from "@/features/business-records/record-panel";
import type { SourceState } from "@/features/business-records/resource";
import { readableValue, statusLabel } from "@/lib/presentation";

const tabs: readonly TabItem[] = [
  { id: "summary", label: "Ringkasan" }, { id: "progress", label: "Progres" }, { id: "milestone", label: "Milestone" },
  { id: "inspection", label: "Inspeksi" }, { id: "documents", label: "Dokumen" }, { id: "findings", label: "Temuan" },
  { id: "sales", label: "Booking / Sales" }, { id: "handover", label: "Serah Terima" }, { id: "activity", label: "Aktivitas" },
];
export function PropertyUnitDetailPage({ unitId, workspaceKey }: Readonly<{ unitId: string; workspaceKey?: string }>) {
  return <PropertyLayout workspaceKey={workspaceKey}>{(session) => <PropertyUnitDetail key={`${session.principal && "actor" in session.principal ? session.principal.active_workspace?.workspace.workspace_id : "unknown"}-${unitId}`} session={session} unitId={unitId} />}</PropertyLayout>;
}

function PropertyUnitDetail({ session, unitId }: Readonly<{ session: SessionProjection; unitId: string }>) {
  const [unit, setUnit] = useState<PropertyUnitProjection | null>(null);
  const [state, setState] = useState<SourceState>("loading");
  useEffect(() => {
    let current = true; const controller = new AbortController();
    void propertyApi.property_units.detail(unitId, controller.signal).then((data) => { if (current) { setUnit(data); setState("CONNECTED"); } })
      .catch((error: unknown) => { if (current) { setUnit(null); setState(sourceFailure(error)); } });
    return () => { current = false; controller.abort(); };
  }, [unitId]);
  const router = useRouter();
  const [tab, setTab] = useState("summary");
  const activeKey = session.principal && "actor" in session.principal ? session.principal.active_workspace?.workspace.workspace_key : null;
  const base = activeKey ? `/workspace/${encodeURIComponent(activeKey)}` : "/workspace";
  return <div className={styles.page}>
    <PageHeader description="Informasi unit dalam ruang kerja Anda." eyebrow="PROPERTY & TEKNIK" metadata={session.principal && "actor" in session.principal ? session.principal.active_workspace?.workspace.workspace_name : undefined} title="Detail Unit" />
    <PropertySourceNote>Kesiapan teknis dan keputusan penjualan mengikuti pemeriksaan pada proses terkait.</PropertySourceNote>
    <SourceStateView state={state} />
    {unit ? <Section title="Rekaman Unit"><dl className={styles.detailList}><dt>Kode Unit</dt><dd>{unit.unit_code}</dd><dt>Nama Unit</dt><dd>{unit.unit_name ?? "—"}</dd><dt>Status Unit</dt><dd>{statusLabel(unit.status)}</dd><dt>Luas Tanah</dt><dd>{unit.area_land ?? "—"}</dd><dt>Luas Bangunan</dt><dd>{unit.area_building ?? "—"}</dd><dt>Proyek Terkait</dt><dd>{unit.project_id ? <Link href={`${base}/projects/${encodeURIComponent(unit.project_id)}`}>Buka proyek terkait</Link> : "Belum ditentukan"}</dd><dt>Pembaruan Sumber</dt><dd>{readableValue(unit.updated_at)}</dd></dl></Section> : null}
    <Tabs ariaLabel="Navigasi detail unit" items={tabs} onValueChange={setTab} value={tab} />
    {tab === "summary" ? <><Section title="Status Teknis"><PropertyUnavailableState description="Status teknis unit belum tersedia." /></Section><Section title="Kesiapan Teknis"><PropertyUnavailableState description="Kesiapan teknis belum dinilai." title="Belum Dinilai" /></Section><Section title="Status Komersial"><PropertyUnavailableState description="Status komersial berasal dari proses Sales dan hanya dapat dilihat dari halaman ini." /></Section><Section title="Serah Terima"><PropertyUnavailableState description="Kesiapan serah terima belum tersedia." /></Section></> : <Section title={tabs.find((item) => item.id === tab)?.label ?? "Ringkasan"}><PropertyUnavailableState description="Data detail unit belum terhubung." /></Section>}
    <div className={styles.actionBar}><Button onClick={() => router.push(`${base}/documents`)} variant="secondary">Buka Dokumen</Button><Button onClick={() => router.push(`${base}/findings`)} variant="secondary">Buka Temuan</Button></div>
  </div>;
}
