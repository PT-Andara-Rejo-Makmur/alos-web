"use client";

import Link from "next/link";
import { useState } from "react";
import { DataTable, Metric, PageHeader, Section } from "@/components/ui";
import type { SessionProjection } from "@/features/session";
import { LegalLayout } from "../legal-layout";
import { LegalSourceStateView, LegalSourceStrip, LegalStatusDrawer } from "../shared/legal-ui";
import styles from "../legal.module.css";

const metrics = ["Kontrak Aktif", "Kontrak Perlu Review", "Perizinan Aktif", "Perizinan Mendekati Tenggat", "Risiko Legal Terbuka", "Keputusan Menunggu"];
const secondary = ["Dokumen Tidak Lengkap", "Kasus / Sengketa Aktif", "Kewajiban Mendekati Tenggat", "Temuan Kritis"];
type SummaryRow = { readonly id: string; readonly item: string; readonly value: string; readonly status: string };
const summaryColumns = [{ header: "Indikator", key: "item", render: (row: SummaryRow) => row.item }, { header: "Nilai", key: "value", render: (row: SummaryRow) => row.value }, { header: "Status Data", key: "status", render: (row: SummaryRow) => row.status }];

export function LegalSummaryPage({ workspaceKey }: Readonly<{ workspaceKey?: string }>) { return <LegalLayout workspaceKey={workspaceKey}>{(session) => <LegalSummary session={session} />}</LegalLayout>; }

function LegalSummary({ session }: Readonly<{ session: SessionProjection }>) {
  const [statusOpen, setStatusOpen] = useState(false);
  const workspace = session.principal && "actor" in session.principal ? session.principal.active_workspace?.workspace : null;
  const base = workspace ? `/workspace/${encodeURIComponent(workspace.workspace_key)}` : "/workspace";
  return <div className={styles.page}><PageHeader description="Ringkasan kontrak, perizinan, kewajiban, risiko, dan status legal perusahaan." eyebrow="LEGAL" metadata={`Workspace aktif: ${workspace?.workspace_name ?? "—"}`} title="Legal" /><div className={styles.contextBar}><ContextItem label="Periode" value="—" /><ContextItem label="Workspace" value={workspace?.workspace_name ?? "—"} /><ContextItem label="Status Data" value="Belum Terhubung" /><ContextItem label="Pembaruan Terverifikasi Terakhir" value="—" /></div><LegalSourceStrip onStatus={() => setStatusOpen(true)} /><section aria-label="Indikator utama Legal" className={styles.metricGrid}>{metrics.map((label) => <Metric key={label} label={label} status="Belum Terhubung" value="—" />)}</section><Section title="Indikator Operasional"><DataTable caption="Indikator operasional Legal" columns={summaryColumns} rows={secondary.map((item) => ({ id: item, item, value: "—", status: "Belum Terhubung" }))} /></Section><div className={styles.summaryGrid}><ReadinessSection title="Perhatian Kontrak" description="Kontrak yang memerlukan perhatian belum tersedia." /><ReadinessSection title="Perhatian Perizinan" description="Data perizinan dan tenggat belum tersedia." /><ReadinessSection title="Risiko Legal" description="Risiko legal belum tersedia dari sumber penilaian resmi." /><Section actions={<Link href={`${base}/approvals`}>Lihat Semua Persetujuan</Link>} title="Keputusan & Persetujuan"><LegalSourceStateView description="Persetujuan legal belum tersedia." state="unavailable" /></Section></div><LegalStatusDrawer onClose={() => setStatusOpen(false)} open={statusOpen} /></div>;
}

function ReadinessSection({ description, title }: Readonly<{ description: string; title: string }>) { return <Section title={title}><LegalSourceStateView description={description} state="unavailable" /></Section>; }
function ContextItem({ label, value }: Readonly<{ label: string; value: string }>) { return <div className={styles.contextItem}><span className={styles.contextLabel}>{label}</span><span className={styles.contextValue}>{value}</span></div>; }
