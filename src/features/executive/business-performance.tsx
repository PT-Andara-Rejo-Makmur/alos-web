"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Alert, DataTable, Section } from "@/components/ui";
import { apiMessage, authenticatedApiRequest } from "@/lib/api";
import type { BusinessPerformance } from "@/lib/contracts";

export function useBusinessPerformance(workspaceKey: string) {
  const [data, setData] = useState<BusinessPerformance | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    authenticatedApiRequest<BusinessPerformance>("/api/v1/business/executive/performance", { signal: controller.signal })
      .then(result => { if (!controller.signal.aborted) setData(result); })
      .catch(failure => { if (!controller.signal.aborted) setError(apiMessage(failure)); });
    return () => controller.abort();
  }, [workspaceKey]);
  return { data, error };
}

export function BusinessPerformancePanel({ workspaceKey, data, error }: Readonly<{ workspaceKey: string; data: BusinessPerformance | null; error: string | null }>) {
  const base = `/workspace/${encodeURIComponent(workspaceKey)}/processes`;
  const rows = data?.domains.flatMap(domain => domain.metrics.map(metric => ({ ...metric, domain: domain.domain }))) ?? [];
  return <>
    {error && <Alert message={error} variant="warning" title="Kinerja operasional belum dapat dimuat" />}
    {([["Memerlukan Keputusan", data?.decisions], ["Untuk Diketahui", data?.acknowledgements]] as const).map(([label, items]) => <Section key={label} title={label}>
      {items?.length ? items.map(item => <p key={item.process_id}><Link href={`${base}/${encodeURIComponent(item.process_id)}`}>{item.next_action ?? "Periksa pengajuan"}</Link> · {item.responsible_workspace_name}</p>) : <p>{data ? "Tidak ada pengajuan yang ditugaskan kepada Anda." : "Memuat pengajuan…"}</p>}
    </Section>)}
    <Section title="Perlu Perhatian">{data?.attention.length ? <ul>{data.attention.map(item => <li key={`${item.domain}-${item.code}`}>{item.label}: {item.value}</li>)}</ul> : <p>{data ? "Tidak ada perhatian tambahan dari indikator yang tersedia." : "Memuat perhatian…"}</p>}</Section>
    <Section title="Kinerja Operasional"><DataTable rows={rows} getRowKey={row => `${row.domain}-${row.code}`} columns={[
      { key: "domain", header: "Divisi", render: row => ({ sales: "Sales & Marketing", property: "Property & Teknik", finance: "Finance & Pajak", legal: "Legal", hr: "HR & GA", it: "IT" })[row.domain] },
      { key: "label", header: "Indikator", render: row => row.label },
      { key: "value", header: "Nilai", render: row => row.available && row.value !== null ? String(row.value) : "Belum tersedia" },
    ]} /></Section>
  </>;
}
