"use client";

import Link from "next/link";

import { Alert, DataTable, EmptyState, Metric, PageHeader, Section, Status } from "@/components/ui";
import type { BusinessTargetDetail } from "@/lib/contracts";

import { ExecutiveLayout } from "./executive-layout";
import { useExecutiveOverview } from "./executive-data";
import { formatValue, lifecycleLabel, performanceLabel, performanceVariant, periodLabel, valueForObservation, verificationLabel } from "./executive-model";
import { connectionLabel, ExecutiveSourceState, ExecutiveSourceStatus, sourceDate } from "./executive-source-status";
import { ExecutiveWorkSections } from "./executive-work-sections";
import styles from "./executive.module.css";

const domains = [["Sales & Marketing", "SALES", "sales"], ["Property & Teknik", "PROPERTY", "property"], ["Finance & Pajak", "FINANCE", "finance"], ["Legal", "LEGAL", "legal"], ["HR/GA", "HR", "hr"], ["IT", "IT", "it"]] as const;

export function ExecutiveSummaryPage({ workspaceKey }: Readonly<{ workspaceKey?: string }> = {}) {
  return <ExecutiveLayout workspaceKey={workspaceKey}>{(_session, activeKey) => <ExecutiveSummaryContent key={activeKey} workspaceKey={activeKey} />}</ExecutiveLayout>;
}

function ExecutiveSummaryContent({ workspaceKey }: Readonly<{ workspaceKey: string }>) {
  const base = `/workspace/${encodeURIComponent(workspaceKey)}`;
  const { data, error, loading, sessionExpired } = useExecutiveOverview(workspaceKey);
  const strategyStatus = data?.strategy.status ?? (loading ? "loading" : "ERROR");
  const workStatus = data?.shared_work.status ?? (loading ? "loading" : "ERROR");
  const strategy = strategyStatus === "CONNECTED" || strategyStatus === "CONNECTED_EMPTY" ? data?.strategy_data : null;
  const work = workStatus === "CONNECTED" || workStatus === "CONNECTED_EMPTY" ? data?.shared_work_data : null;
  const targets = strategy?.targets ?? [];
  const plan = strategy?.active_operating_plans[0] ?? strategy?.active_strategic_plans[0];
  const domainStatus = (id: string) => data?.domains.find((item) => item.domain === id)?.status ?? (loading ? "loading" : "ERROR");

  return <div className={styles.page}>
    <PageHeader description="Ringkasan kondisi, kinerja, temuan, dan keputusan perusahaan dalam visibility ruang kerja aktif." eyebrow="EKSEKUTIF" metadata={plan ? `Rencana aktif · ${periodLabel(plan.period)} · Waktu sumber ${sourceDate(data?.last_updated_at)}` : `Waktu sumber · ${sourceDate(data?.last_updated_at)}`} title="Pusat Kendali Eksekutif" />
    {sessionExpired ? <Alert message="Sesi Anda sudah berakhir. Silakan masuk kembali." title="Sesi berakhir" variant="warning" /> : null}
    {error ? <Alert message={error} title="Data belum dapat dimuat." variant="warning" /> : null}
    <ExecutiveSourceStatus overview={data} loading={loading} error={error} />

    <Section bordered title="Ringkasan Utama"><div className={styles.metricsStrip}>
      {[["Pendapatan", "SALES"], ["Penjualan / Closing", "SALES"], ["Kas & Likuiditas", "FINANCE"], ["Progres Proyek", "PROPERTY"]].map(([label, domain]) => <Metric key={label} label={label} supportingText={["CONNECTED", "CONNECTED_EMPTY"].includes(domainStatus(domain)) ? "Sumber terhubung; metrik belum tersedia." : connectionLabel(domainStatus(domain)).label} value="—" />)}
      <Metric label="Keputusan Menunggu" supportingText={connectionLabel(workStatus).label} value={work ? String(work.counts.pending_approvals) : "—"} />
      <Metric label="Temuan Aktif" supportingText={connectionLabel(workStatus).label} value={work ? String(work.counts.active_findings) : "—"} />
    </div></Section>

    <Section actions={<Link className={styles.detailLink} href={`${base}/performance`}>Lihat Kinerja</Link>} description="Target, aktual, perkiraan, dan status hasil proyeksi Strategy authoritative." title="Target & Kinerja Perusahaan">
      <ExecutiveSourceState status={strategyStatus} emptyTitle="Belum ada target perusahaan." />
      {strategyStatus === "CONNECTED" && targets.length === 0 ? <EmptyState description="Target akan ditampilkan setelah tersedia pada rencana perusahaan." title="Belum ada target perusahaan." /> : null}
      {targets.length > 0 ? <ExecutiveTargetTable base={base} targets={targets} /> : null}
    </Section>

    <Section title="Ringkasan Domain" description="Kondisi domain operasional tersedia setelah sumber canonical terhubung."><div className={styles.domainGrid}>
      {domains.map(([name, id, key]) => <article className={styles.domainPanel} key={id}>
        <div><h3>{name}</h3><p>—</p></div><Status {...connectionLabel(domainStatus(id))} />
        <Link className={styles.detailLink} href={`${base}/divisions/${key}`}>Lihat Detail</Link>
      </article>)}
    </div></Section>

    <ExecutiveWorkSections base={base} status={workStatus} data={work ?? null} />

    <Section title="Status Divisi" description="Status koneksi canonical; Shared Work tidak menggantikan metrik domain bisnis.">
      <DataTable caption="Status divisi" columns={[
        { header: "Divisi", key: "division", render: (row: typeof domains[number]) => row[0] },
        { header: "Status", key: "status", render: (row: typeof domains[number]) => <Status {...connectionLabel(domainStatus(row[1]))} /> },
        { header: "Update sumber", key: "updated", render: (row: typeof domains[number]) => sourceDate(data?.domains.find((item) => item.domain === row[1])?.last_verified_at) },
      ]} getRowKey={(row) => row[1]} rowAction={(row) => <Link className={styles.detailLink} href={`${base}/divisions/${row[2]}`}>Lihat Detail</Link>} rows={domains} />
    </Section>
    <Section title="Analisis GENESIS"><div className={styles.readinessRow}><Status label="Belum Terhubung" variant="neutral" /><p>Analisis advisory belum terhubung.</p></div></Section>
  </div>;
}

export function ExecutiveTargetTable({ targets, base }: Readonly<{ targets: readonly BusinessTargetDetail[]; base: string }>) {
  return <DataTable caption="Target dan kinerja perusahaan" columns={[
    { header: "Sasaran", key: "name", render: (detail: BusinessTargetDetail) => detail.target.name },
    { header: "Periode", key: "period", render: (detail: BusinessTargetDetail) => periodLabel(detail.target.period) },
    { header: "Target", key: "target", render: (detail: BusinessTargetDetail) => valueForObservation(detail.selected_observations?.target ?? null, formatValue) },
    { header: "Aktual", key: "actual", render: (detail: BusinessTargetDetail) => valueForObservation(detail.selected_observations?.actual ?? null, formatValue) },
    { header: "Perkiraan", key: "forecast", render: (detail: BusinessTargetDetail) => valueForObservation(detail.selected_observations?.forecast ?? null, formatValue) },
    { header: "Status", key: "performance", render: (detail: BusinessTargetDetail) => <Status label={performanceLabel(detail.performance_state)} variant={performanceVariant(detail.performance_state)} /> },
    { header: "Verifikasi", key: "verification", render: (detail: BusinessTargetDetail) => verificationLabel(detail.selected_observations?.actual?.verification_state) },
    { header: "Penanggung Jawab", key: "owner", render: (detail: BusinessTargetDetail) => detail.target.owner_role_ref },
    { header: "Lifecycle", key: "lifecycle", render: (detail: BusinessTargetDetail) => lifecycleLabel(detail.target.lifecycle_state) },
  ]} getRowKey={(detail) => `${detail.target.target_id}-${detail.target.version}`} rowAction={(detail) => <Link className={styles.detailLink} href={`${base}/performance?target=${encodeURIComponent(detail.target.target_id)}&version=${detail.target.version}`}>Lihat Detail</Link>} rows={targets} />;
}
