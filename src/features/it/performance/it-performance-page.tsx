"use client";

import { PageHeader, Section, Tabs } from "@/components/ui";
import type { SessionProjection } from "@/features/session";

import { ItLayout } from "../it-layout";
import { ItSourceStrip, ItSourceStateView } from "../shared/it-ui";
import styles from "../it.module.css";

const tabs = ["Ringkasan", "Target", "KPI", "Layanan", "Akses", "Riwayat"].map((label) => ({ id: label, label }));

export function ItPerformancePage({ workspaceKey }: Readonly<{ workspaceKey?: string }>) {
  return <ItLayout workspaceKey={workspaceKey}>{(session) => <ItPerformance session={session} />}</ItLayout>;
}

function ItPerformance({ session }: Readonly<{ session: SessionProjection }>) {
  const workspace = session.principal && "actor" in session.principal ? session.principal.active_workspace?.workspace : null;
  return <div className={styles.page}>
    <PageHeader description="Target berasal dari Strategi; aktual dan perkiraan IT menunggu sumber IT resmi." eyebrow="KINERJA IT" metadata={`Workspace aktif: ${workspace?.workspace_name ?? "—"}`} title="Target & Kinerja" />
    <Tabs ariaLabel="Navigasi kinerja IT" items={tabs} />
    <ItSourceStrip statuses={{ Strategi: "unavailable" }} />
    <Section title="Sumber Strategi"><ItSourceStateView description="Target Strategi belum tersedia pada sesi ini. Aktual dan perkiraan IT tidak disimpulkan dari sumber lain." state="unavailable" title="Strategi" /></Section>
    <Section title="Target, Aktual, dan Perkiraan"><ItSourceStateView description="Nilai target, aktual, dan perkiraan akan tampil terpisah setelah sumber masing-masing tersedia." state="unavailable" /></Section>
  </div>;
}
