"use client";

import Link from "next/link";
import { Alert, DataTable, Metric, PageHeader, Section, Status } from "@/components/ui";
import type { BusinessPerformance, BusinessTargetDetail } from "@/lib/contracts";
import { businessMetricValue, domainLabels, roleLabel } from "@/lib/presentation";
import { ExecutiveLayout } from "./executive-layout";
import { useExecutiveOverview } from "./executive-data";
import { formatValue, performanceLabel, performanceVariant, periodLabel, valueForObservation } from "./executive-model";
import { ExecutiveSourceState, sourceDate } from "./executive-source-status";
import { BusinessPerformancePanel, useBusinessPerformance } from "./business-performance";
import { ExecutiveWorkSections } from "./executive-work-sections";
import styles from "./executive.module.css";
import workStyles from "@/components/ui/work-surface.module.css";

export function ExecutiveSummaryPage({ workspaceKey }: Readonly<{ workspaceKey?: string }> = {}) {
  return <ExecutiveLayout workspaceKey={workspaceKey}>{(_session, activeKey) => <ExecutiveSummaryContent key={activeKey} workspaceKey={activeKey} />}</ExecutiveLayout>;
}

function ExecutiveSummaryContent({ workspaceKey }: Readonly<{ workspaceKey: string }>) {
  const base = `/workspace/${encodeURIComponent(workspaceKey)}`;
  const { data, error, loading, sessionExpired } = useExecutiveOverview(workspaceKey);
  const business = useBusinessPerformance(workspaceKey);
  const strategyStatus = data?.strategy.status ?? (loading ? "loading" : "ERROR");
  const workStatus = data?.shared_work.status ?? (loading ? "loading" : "ERROR");
  const strategy = ["CONNECTED", "CONNECTED_EMPTY"].includes(strategyStatus) ? data?.strategy_data : null;
  const work = ["CONNECTED", "CONNECTED_EMPTY"].includes(workStatus) ? data?.shared_work_data : null;
  const plan = strategy?.active_operating_plans[0] ?? strategy?.active_strategic_plans[0];
  const targets = (business.data?.target_details ?? strategy?.targets ?? []).filter(detail => detail.target.scope.type === "COMPANY");
  return <div className={styles.page}>
    <PageHeader title="Pusat Kendali Eksekutif" eyebrow="PT ANDARA REJO MAKMUR" description="Keputusan, perhatian utama, dan kondisi perusahaan." metadata={`Diperbarui ${sourceDate(data?.last_updated_at)}`} actions={<Link className={styles.detailLink} href={`${base}/brief`}>Baca Brief Eksekutif →</Link>} />
    {sessionExpired ? <Alert message="Sesi Anda sudah berakhir. Silakan masuk kembali." variant="warning" /> : null}
    {error ? <Alert message={error} variant="warning" /> : null}
    <div className={workStyles.metricStrip}>
      <Metric label="Perlu Keputusan" value={business.data ? String(business.data.decisions.length) : "Belum tersedia"} />
      <Metric label="Perlu Perhatian" value={business.data ? String(business.data.attention.length) : "Belum tersedia"} supportingText="Indikator yang memerlukan perhatian" />
      <Metric label="Untuk Diketahui" value={business.data ? String(business.data.acknowledgements.length) : "Belum tersedia"} />
      <Metric label="Rencana Aktif" value={plan?.name ?? "Belum tersedia"} supportingText={plan ? periodLabel(plan.period) : "Rencana perusahaan"} />
    </div>
    <BusinessPerformancePanel workspaceKey={workspaceKey} data={business.data} error={business.error} />
    <Section title="Kondisi Divisi" actions={<Link className={styles.detailLink} href={`${base}/divisions`}>Lihat Semua Divisi →</Link>}><ExecutiveDivisionOverview data={business.data} base={base} /></Section>
    <Section title="Proyek Perusahaan" actions={<Link className={styles.detailLink} href={`${base}/projects`}>Lihat Proyek →</Link>}>
      <ExecutiveSourceState status={workStatus} />
      {work ? <DataTable caption="Proyek perusahaan" rows={work.projects} getRowKey={row => row.project_id} columns={[
        { key: "name", header: "Proyek", render: row => row.name },
        { key: "status", header: "Status", render: row => <Status label={row.status} /> },
        { key: "owner", header: "Penanggung Jawab", render: row => row.owner_name ?? "Belum ditugaskan" },
        { key: "updated", header: "Diperbarui", render: row => sourceDate(row.updated_at) },
      ]} rowAction={row => <Link href={`${base}/projects/${encodeURIComponent(row.project_id)}`}>Lihat Detail</Link>} /> : null}
    </Section>
    <Section title="Target Perusahaan" actions={<Link className={styles.detailLink} href={`${base}/performance`}>Lihat Kinerja →</Link>}>
      <ExecutiveSourceState status={strategyStatus} emptyTitle="Belum ada target perusahaan." />
      <ExecutiveTargetTable base={base} targets={targets} />
    </Section>
    <details><summary>Pekerjaan Pendukung</summary><ExecutiveWorkSections base={base} status={workStatus} data={work ?? null} /></details>
    <p><Link className={styles.detailLink} href={`${base}/ara`}>Tanya ARA tentang kondisi perusahaan →</Link></p>
  </div>;
}

export function ExecutiveDivisionOverview({ data, base }: Readonly<{ data: BusinessPerformance | null; base: string }>) {
  return <div className={styles.domainGrid}>{Object.entries(domainLabels).map(([key, name]) => {
    const summary = data?.domains.find(item => item.domain === key);
    return <article className={styles.domainPanel} key={key}><h3>{name}</h3>
      {summary ? <dl className={workStyles.facts}>{summary.metrics.slice(0,3).map(metric => <div key={metric.code}><dt>{metric.label}</dt><dd>{businessMetricValue(metric)}</dd></div>)}</dl> : <p>Belum tersedia</p>}
      <Link className={styles.detailLink} href={`${base}/divisions/${key}`}>Lihat Detail →</Link>
    </article>;
  })}</div>;
}

export function ExecutiveTargetTable({ targets, base }: Readonly<{ targets: readonly BusinessTargetDetail[]; base: string }>) {
  return <DataTable caption="Target dan kinerja perusahaan" columns={[
    { header: "Target", key: "name", render: (detail: BusinessTargetDetail) => detail.target.name },
    { header: "Periode", key: "period", render: (detail: BusinessTargetDetail) => periodLabel(detail.target.period) },
    { header: "Nilai Target", key: "target", render: (detail: BusinessTargetDetail) => valueForObservation(detail.selected_observations?.target ?? null, formatValue) },
    { header: "Aktual", key: "actual", render: (detail: BusinessTargetDetail) => valueForObservation(detail.selected_observations?.actual ?? null, formatValue) },
    { header: "Perkiraan", key: "forecast", render: (detail: BusinessTargetDetail) => valueForObservation(detail.selected_observations?.forecast ?? null, formatValue) },
    { header: "Status", key: "performance", render: (detail: BusinessTargetDetail) => <Status label={performanceLabel(detail.performance_state)} variant={performanceVariant(detail.performance_state)} /> },
    { header: "Penanggung Jawab", key: "owner", render: (detail: BusinessTargetDetail) => roleLabel(detail.target.owner_role_ref) },
  ]} getRowKey={detail => `${detail.target.target_id}-${detail.target.version}`} rowAction={detail => <Link href={`${base}/performance?target=${encodeURIComponent(detail.target.target_id)}&version=${detail.target.version}`}>Lihat Detail</Link>} rows={targets} />;
}
