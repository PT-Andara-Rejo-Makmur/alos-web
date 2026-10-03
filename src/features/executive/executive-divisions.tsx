"use client";

import Link from "next/link";
import { Alert, EmptyState, LoadingState, Metric, PageHeader, Section } from "@/components/ui";
import { businessMetricValue, domainLabels } from "@/lib/presentation";
import { ExecutiveLayout } from "./executive-layout";
import { useBusinessPerformance } from "./business-performance";
import { ExecutiveDivisionOverview, ExecutiveTargetTable } from "./executive-summary";
import styles from "./executive.module.css";
import workStyles from "@/components/ui/work-surface.module.css";

export function ExecutiveDivisionsPage({ workspaceKey }: Readonly<{workspaceKey?:string}> = {}) {
  return <ExecutiveLayout workspaceKey={workspaceKey}>{(_session,key)=><DivisionsContent key={key} workspaceKey={key} />}</ExecutiveLayout>;
}
function DivisionsContent({workspaceKey}:Readonly<{workspaceKey:string}>) {
  const business=useBusinessPerformance(workspaceKey);
  return <div className={styles.page}><PageHeader title="Kondisi Divisi" description="Indikator operasional dan hal yang perlu diperhatikan di setiap divisi." />{business.error ? <Alert variant="warning" message={business.error} /> : null}<ExecutiveDivisionOverview data={business.data} base={`/workspace/${encodeURIComponent(workspaceKey)}`} /></div>;
}
export function ExecutiveDivisionDetailPage({divisionKey,workspaceKey}:Readonly<{divisionKey:string;workspaceKey?:string}>) {
  return <ExecutiveLayout workspaceKey={workspaceKey}>{(_session,key)=><DivisionContent key={`${key}-${divisionKey}`} workspaceKey={key} divisionKey={divisionKey} />}</ExecutiveLayout>;
}
function DivisionContent({divisionKey,workspaceKey}:Readonly<{divisionKey:string;workspaceKey:string}>) {
  const business=useBusinessPerformance(workspaceKey);
  const base=`/workspace/${encodeURIComponent(workspaceKey)}`;
  const summary=business.data?.domains.find(item=>item.domain===divisionKey);
  // Scope references must match; never infer division ownership from a target name.
  const targets=business.data?.target_details.filter(item=>item.target.scope.type==="DIVISION" && Boolean(item.target.scope.ref) && item.target.scope.ref===divisionKey) ?? [];
  const attention=business.data?.attention.filter(item=>item.domain===divisionKey) ?? [];
  return <div className={styles.page}><Link href={`${base}/divisions`}>← Kembali ke Divisi</Link><PageHeader title={domainLabels[divisionKey] ?? "Detail Divisi"} description="Kondisi operasional, perhatian utama, dan target divisi." />
    {!(divisionKey in domainLabels) ? <EmptyState title="Divisi tidak ditemukan" description="Pilih divisi yang tersedia pada daftar perusahaan." /> : <>
      {business.error ? <Alert variant="warning" message={business.error} /> : null}
      <Section title="Indikator Operasional">{summary ? <div className={workStyles.metricStrip}>{summary.metrics.map(metric=><Metric key={metric.code} label={metric.label} value={businessMetricValue(metric)} />)}</div> : <p>Belum tersedia</p>}</Section>
      <Section title="Perlu Perhatian">{business.data ? attention.length ? <ul>{attention.map(item=><li key={item.code}>{item.label} · <strong>{businessMetricValue(item)}</strong></li>)}</ul> : <p>Tidak ada perhatian tambahan dari indikator yang tersedia.</p> : <p>Belum tersedia</p>}<Link href={`${base}/processes`}>Lihat Pengajuan Keputusan →</Link></Section>
      <Section title="Kinerja Divisi">{business.data ? <><ExecutiveTargetTable targets={targets} base={base} />{!targets.length ? <p>Belum ada target yang dialokasikan khusus untuk divisi ini.</p> : null}</> : business.error ? <p>Kinerja belum dapat disimpulkan karena data bisnis belum tersedia.</p> : <LoadingState label={`Memuat kinerja ${domainLabels[divisionKey]}`} />}</Section>
      <Section title="Pekerjaan Divisi"><p>Rincian tugas, proyek, dan penanggung jawab divisi belum tersedia dalam ringkasan perusahaan. Gunakan pengajuan yang ditampilkan pada Perlu Tindakan.</p></Section>
    </>}
  </div>;
}
