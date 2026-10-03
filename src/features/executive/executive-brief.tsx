"use client";

import Link from "next/link";
import { Alert, LoadingState, PageHeader } from "@/components/ui";
import { businessMetricValue, domainLabels } from "@/lib/presentation";
import { processTitle } from "@/features/shared-work/processes/process-presentation";
import { ExecutiveLayout } from "./executive-layout";
import { useExecutiveOverview } from "./executive-data";
import { useBusinessPerformance } from "./business-performance";
import { periodLabel } from "./executive-model";
import { sourceDate } from "./executive-source-status";
import { ExecutiveTargetTable } from "./executive-summary";
import styles from "./executive.module.css";

export function ExecutiveBriefPage({ workspaceKey }: Readonly<{ workspaceKey?: string }> = {}) {
  return <ExecutiveLayout workspaceKey={workspaceKey}>{(_session, activeKey) => <BriefContent key={activeKey} workspaceKey={activeKey} />}</ExecutiveLayout>;
}
function BriefContent({ workspaceKey }: Readonly<{ workspaceKey: string }>) {
  const base = `/workspace/${encodeURIComponent(workspaceKey)}`;
  const overview = useExecutiveOverview(workspaceKey);
  const business = useBusinessPerformance(workspaceKey);
  const data = business.data;
  const work = ["CONNECTED", "CONNECTED_EMPTY"].includes(overview.data?.shared_work.status ?? "") ? overview.data?.shared_work_data : null;
  const strategy = ["CONNECTED", "CONNECTED_EMPTY"].includes(overview.data?.strategy.status ?? "") ? overview.data?.strategy_data : null;
  const plan = strategy?.active_operating_plans[0] ?? strategy?.active_strategic_plans[0];
  const targets = (data?.target_details ?? strategy?.targets ?? []).filter(item => item.target.scope.type === "COMPANY").slice(0, 3);
  return <div className={styles.page}>
    <PageHeader title="Brief Eksekutif" description="Keputusan dan perhatian utama untuk dibaca sebelum memulai hari." metadata={`Diperbarui ${sourceDate(overview.data?.last_updated_at)}`} actions={<Link href={`${base}/ara`}>Tanya ARA tentang kondisi perusahaan →</Link>} />
    {business.error || overview.error ? <Alert variant="warning" message={business.error ?? overview.error ?? "Sebagian informasi belum dapat dibaca."} /> : null}
    {!data && !business.error ? <LoadingState label="Menyiapkan brief perusahaan…" /> : null}
    <div className={styles.briefLayout}>
      <section className={styles.briefSection}><h2>Hari Ini</h2>
        <p>{data ? `${data.decisions.length} pengajuan memerlukan keputusan Anda. ${data.acknowledgements.length} pengajuan perlu diketahui.` : "Daftar keputusan belum tersedia."}</p>
        {data?.decisions.length ? <ol>{data.decisions.slice(0,3).map(item => <li key={item.process_id}><Link href={`${base}/processes/${encodeURIComponent(item.process_id)}`}>{processTitle(item)}</Link><p>{item.next_action}</p></li>)}</ol> : null}
        <Link href={`${base}/processes`}>Buka Perlu Tindakan →</Link>
      </section>
      <section className={styles.briefSection}><h2>Perhatian Utama</h2>{data ? data.attention.length ? <ul>{data.attention.slice(0,5).map(item => <li key={`${item.domain}-${item.code}`}>{item.label}: <strong>{businessMetricValue(item)}</strong> · {domainLabels[item.domain]}</li>)}</ul> : <p>Tidak ada perhatian tambahan dari indikator yang tersedia.</p> : <p>Belum tersedia</p>}</section>
      <section className={styles.briefSection}><h2>Kinerja</h2>{plan ? <p>{plan.name} · {periodLabel(plan.period)}</p> : <p>Rencana aktif belum tersedia.</p>}{data ? <ul>{data.domains.flatMap(domain => domain.metrics.filter(metric => ["recorded_sales_value", "receivables", "payables"].includes(metric.code)).map(metric => <li key={`${domain.domain}-${metric.code}`}>{metric.label}: <strong>{businessMetricValue(metric)}</strong></li>))}</ul> : null}{targets.length ? <ExecutiveTargetTable targets={targets} base={base} /> : null}<Link href={`${base}/performance`}>Lihat Target dan Kinerja →</Link></section>
      <section className={styles.briefSection}><h2>Proyek dan Risiko</h2>{work ? <><p>{work.counts.active_projects} proyek aktif · {work.counts.on_hold_projects} ditahan.</p><p>{work.counts.overdue_tasks} tugas lewat tenggat · {work.counts.critical_findings} temuan kritis · {work.counts.high_findings} temuan berisiko tinggi.</p><ul>{work.projects.slice(0,3).map(project => <li key={project.project_id}><Link href={`${base}/projects/${encodeURIComponent(project.project_id)}`}>{project.name}</Link></li>)}</ul></> : <p>Informasi pekerjaan pendukung belum tersedia.</p>}<Link href={`${base}/findings`}>Lihat Temuan →</Link></section>
    </div>
  </div>;
}
