"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Alert, EmptyState, LoadingState, Metric, Section, Status } from "@/components/ui";
import { apiMessage, authenticatedApiRequest } from "@/lib/api";
import { isBusinessPerformance } from "@/lib/business-projection";
import type { BusinessPerformance } from "@/lib/contracts";
import { businessMetricValue, domainLabels } from "@/lib/presentation";
import { processTitle } from "@/features/shared-work/processes/process-presentation";
import styles from "@/components/ui/work-surface.module.css";

export function useBusinessPerformance(workspaceKey: string) {
  const [data, setData] = useState<BusinessPerformance | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    authenticatedApiRequest<unknown>("/api/v1/business/executive/performance", { signal: controller.signal })
      .then(result => {
        if (controller.signal.aborted) return;
        if (!isBusinessPerformance(result)) throw new Error("Sumber kinerja bisnis belum memberikan data yang sesuai.");
        setError(null);
        setData(result);
      })
      .catch(failure => { if (!controller.signal.aborted) setError(apiMessage(failure)); });
    return () => controller.abort();
  }, [workspaceKey]);
  return { data, error };
}

export function BusinessPerformancePanel({ workspaceKey, data, error }: Readonly<{ workspaceKey: string; data: BusinessPerformance | null; error: string | null }>) {
  const base = `/workspace/${encodeURIComponent(workspaceKey)}/processes`;
  return <>
    {error && <Alert message={error} variant="warning" title="Kinerja operasional belum dapat dimuat" />}
    <Section title="Perlu Keputusan" actions={<Link href={base}>Buka Perlu Tindakan →</Link>}>
      {!data ? error ? <p>Daftar keputusan belum tersedia.</p> : <LoadingState label="Memuat pengajuan…" /> : data.decisions.length ? <ul className={styles.workList}>{data.decisions.map(item => <li className={styles.workRow} key={item.process_id}><div><h3>{processTitle(item)}</h3><p>{item.next_action ?? "Periksa pengajuan sebelum memberi keputusan."}</p><small>{item.responsible_workspace_name}</small><ul>{item.steps.filter(step => step.status === "COMPLETED" || step.status === "SKIPPED").map(step => <li key={step.step_id}>{step.workspace_name} · {step.status === "COMPLETED" ? "Sudah diperiksa" : "Tidak diperlukan"}</li>)}</ul></div><Link href={`${base}/${encodeURIComponent(item.process_id)}`}>Lihat Pengajuan →</Link></li>)}</ul> : <EmptyState title="Tidak ada pengajuan keputusan saat ini" description="Pengajuan akan tampil setelah pemeriksaan yang diperlukan selesai." />}
    </Section>
    <Section title="Perlu Perhatian">{data?.attention.length ? <ul className={styles.workList}>{data.attention.map(item => <li className={styles.workRow} key={`${item.domain}-${item.code}`}><div><h3>{item.label}</h3><p>{domainLabels[item.domain]}</p></div><Status label={businessMetricValue(item)} variant="warning" /></li>)}</ul> : <p>{data ? "Tidak ada perhatian tambahan dari indikator yang tersedia." : error ? "Belum tersedia" : "Memuat perhatian…"}</p>}</Section>
    <Section title="Untuk Diketahui">{data?.acknowledgements.length ? <ul className={styles.workList}>{data.acknowledgements.map(item => <li className={styles.workRow} key={item.process_id}><div><h3>{processTitle(item)}</h3><p>{item.next_action}</p></div><Link href={`${base}/${encodeURIComponent(item.process_id)}`}>Lihat Pengajuan</Link></li>)}</ul> : <p>{data ? "Tidak ada pemberitahuan yang perlu Anda tangani." : error ? "Belum tersedia" : "Memuat pemberitahuan…"}</p>}</Section>
    <Section title="Kinerja Utama"><div className={styles.metricStrip}>{data?.domains.flatMap(domain => domain.metrics.filter(metric => ["recorded_sales_value", "closings", "receivables", "payables", "active_headcount", "open_ncr"].includes(metric.code)).map(metric => <Metric key={`${domain.domain}-${metric.code}`} label={metric.label} value={businessMetricValue(metric)} supportingText={domainLabels[domain.domain]} />))}</div></Section>
  </>;
}
