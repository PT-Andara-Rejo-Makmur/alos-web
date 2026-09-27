"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { Alert, DataTable, EmptyState, LoadingState, PageHeader, Section, Status, Tabs, type TabItem } from "@/components/ui";
import type { BusinessTarget } from "@/lib/contracts";

import { ExecutiveLayout } from "./executive-layout";
import { useExecutiveStrategyData } from "./executive-data";
import { corporateTargets, formatValue, observationFor, performanceLabel, performanceVariant, valueForObservation, verificationLabel } from "./executive-model";
import styles from "./executive.module.css";

export function ExecutivePerformancePage() { return <ExecutiveLayout>{() => <PerformanceContent />}</ExecutiveLayout>; }

function PerformanceContent() {
  const { data, error, loading } = useExecutiveStrategyData();
  const [tab, setTab] = useState("company");
  const tabs: readonly TabItem[] = useMemo(() => [
    { id: "company", label: "Perusahaan" }, { id: "kpi", label: "KPI" }, { id: "division", label: "Divisi" }, { id: "forecast", label: "Perkiraan" }, { id: "history", label: "Riwayat" },
  ], []);
  const targets = corporateTargets(data?.targets ?? []);
  return <div className={styles.page}>
    <PageHeader description="Pantau aktual, perkiraan, status kinerja, verifikasi, dan evidence dari sumber yang tersedia." eyebrow="STRATEGI & KINERJA" title="Kinerja" />
    {error ? <Alert message={error} title="Data belum dapat dimuat." variant="warning" /> : null}
    <Tabs ariaLabel="Kinerja" items={tabs} onValueChange={setTab} value={tab} />
    {loading ? <LoadingState label="Memuat kinerja perusahaan" variant="table" /> : null}
    {!loading && tab === "company" ? <PerformanceTable targets={targets} /> : null}
    {!loading && tab === "kpi" ? <EmptyState description="Definisi KPI akan ditampilkan setelah public contract dan sumbernya tersedia." title="Definisi KPI belum tersedia." /> : null}
    {!loading && tab === "division" ? <DivisionPerformance /> : null}
    {!loading && tab === "forecast" ? <PerformanceTable targets={targets} /> : null}
    {!loading && tab === "history" ? <EmptyState description="Riwayat observasi akan tersedia pada detail target yang dapat diakses." title="Riwayat belum tersedia." /> : null}
    <Section title="Pencatatan Aktual dan Perkiraan"><div className={styles.readinessRow}><Status label="Belum Siap" variant="neutral" /><p>Form pencatatan hanya ditampilkan ketika Backend memberikan action resmi dan evidence requirement yang sesuai.</p></div></Section>
  </div>;
}

function PerformanceTable({ targets }: Readonly<{ targets: readonly BusinessTarget[] }>) {
  return <Section title="Kinerja Perusahaan" description="Status performa berasal dari Backend; halaman ini tidak menghitung threshold sendiri."><DataTable caption="Kinerja target perusahaan" columns={[
    { header: "Target", key: "target", render: (target: BusinessTarget) => target.name }, { header: "Aktual", key: "actual", render: (target: BusinessTarget) => valueForObservation(observationFor(target, "ACTUAL"), formatValue) },
    { header: "Perkiraan", key: "forecast", render: (target: BusinessTarget) => valueForObservation(observationFor(target, "FORECAST"), formatValue) }, { header: "Variance", key: "variance", render: () => "—" },
    { header: "Status", key: "status", render: (target: BusinessTarget) => <Status label={performanceLabel(target.performance_state)} variant={performanceVariant(target.performance_state)} /> },
    { header: "Verifikasi", key: "verification", render: (target: BusinessTarget) => verificationLabel(observationFor(target, "ACTUAL")?.verification_state) }, { header: "Sumber", key: "source", render: (target: BusinessTarget) => target.source_refs[0] ?? "—" }, { header: "Evidence", key: "evidence", render: (target: BusinessTarget) => target.evidence_refs[0] ?? "—" },
  ]} getRowKey={(target) => `${target.target_id}-${target.version}`} rowAction={(target) => <Link className={styles.detailLink} href={`/workspace/executive/performance?target=${encodeURIComponent(target.target_id)}`}>Lihat Detail</Link>} rows={targets} /></Section>;
}

function DivisionPerformance() { return <Section title="Kinerja Divisi"><DataTable caption="Rollup kinerja divisi" columns={[
  { header: "Divisi", key: "division", render: (row: readonly string[]) => row[0] }, { header: "Target", key: "target", render: () => "—" }, { header: "Aktual", key: "actual", render: () => "—" }, { header: "Status", key: "status", render: () => <Status label="Belum Terhubung" variant="neutral" /> }, { header: "Temuan", key: "findings", render: () => "—" }, { header: "Perkiraan", key: "forecast", render: () => "—" },
]} getRowKey={(row) => row[1]} rowAction={(row) => <Link className={styles.detailLink} href={`/workspace/executive/divisions/${row[1]}`}>Lihat Detail</Link>} rows={[["Sales & Marketing", "sales"], ["Property & Teknik", "property"], ["Finance & Pajak", "finance"], ["Legal", "legal"], ["HR/GA", "hr"], ["IT", "it"]]} /></Section>; }
