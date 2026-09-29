"use client";

import { Metric, PageHeader, Section } from "@/components/ui";
import type { SessionProjection } from "@/features/session";

import { ItLayout } from "../it-layout";
import { ItSourceStrip, ItSourceStateView } from "../shared/it-ui";
import styles from "../it.module.css";

const metrics = ["Layanan Berjalan", "Insiden Terbuka", "Akun Karyawan", "Akses Menunggu", "Aset Terdaftar", "Permintaan Dukungan"];

export function ItSummaryPage({ workspaceKey }: Readonly<{ workspaceKey?: string }>) {
  return <ItLayout workspaceKey={workspaceKey}>{(session) => <ItSummary session={session} />}</ItLayout>;
}

function ItSummary({ session }: Readonly<{ session: SessionProjection }>) {
  const workspace = session.principal && "actor" in session.principal ? session.principal.active_workspace?.workspace : null;
  return <div className={styles.page}>
    <PageHeader description="Ringkasan layanan, sistem, akses, keamanan, dan dukungan IT." eyebrow="IT & IDENTITAS" metadata={`Workspace aktif: ${workspace?.workspace_name ?? "—"}`} title="Ringkasan IT" />
    <div className={styles.contextBar}><ContextItem label="Periode" value="—" /><ContextItem label="Workspace" value={workspace?.workspace_name ?? "—"} /><ContextItem label="Status Data" value="Belum Terhubung" /><ContextItem label="Pembaruan Terverifikasi Terakhir" value="—" /></div>
    <ItSourceStrip />
    <section aria-label="Indikator utama IT" className={styles.metricGrid}>{metrics.map((label) => <Metric key={label} label={label} status="Belum Terhubung" value="—" />)}</section>
    <Section title="Kondisi Layanan"><ItSourceStateView description="Status layanan dan insiden belum tersedia dari sumber operasional IT." state="unavailable" /></Section>
    <Section title="Akses & Keamanan"><ItSourceStateView description="Data akses, identitas, dan keamanan akan tampil setelah sumber resmi terhubung." state="unavailable" /></Section>
  </div>;
}

function ContextItem({ label, value }: Readonly<{ label: string; value: string }>) { return <div className={styles.contextItem}><span className={styles.contextLabel}>{label}</span><span className={styles.contextValue}>{value}</span></div>; }
