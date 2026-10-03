"use client";

import { useEffect, useState } from "react";
import { DataTable, Metric, PageHeader, Section } from "@/components/ui";
import type { SalesOverview, MarketingOverview, PropertyOverview, FinanceOverview, LegalOverview, HrOverview, ItOverview } from "@/lib/contracts";
import type { SourceState } from "./resource";
import { SourceMetadata, SourceStateView, sourceFailure } from "./record-panel";
import styles from "@/features/property/property.module.css";
import { BusinessSummaryPanel } from "./business-summary";

type Overview = SalesOverview | MarketingOverview | PropertyOverview | FinanceOverview | LegalOverview | HrOverview | ItOverview;

export function DomainOverview({ title, domain, read, labels, unavailable }: Readonly<{
  domain?: "sales" | "property" | "finance" | "legal" | "hr" | "it";
  title: string; read: (signal?: AbortSignal) => Promise<Overview>; labels: Readonly<Record<string, string>>; unavailable: readonly string[];
}>) {
  const [data, setData] = useState<Overview | null>(null);
  const [state, setState] = useState<SourceState>("loading");
  useEffect(() => {
    let current = true; const controller = new AbortController();
    void read(controller.signal).then((value) => { if (current) { setData(value); setState(value.source.status); } })
      .catch((error: unknown) => { if (current) { setData(null); setState(sourceFailure(error)); } });
    return () => { current = false; controller.abort(); };
  }, [read]);
  const rows = data && ["CONNECTED", "CONNECTED_EMPTY"].includes(state) ? Object.entries(data.counts).map(([key, value]) => ({ key, label: labels[key] ?? key, value })) : [];
  return <div className={styles.page}><PageHeader title={title} description="Ringkasan rekaman authoritative dalam scope aktif. Rekaman internal tidak menyatakan keputusan final lintas domain." />
    {data ? <SourceMetadata source={data.source} /> : null}
    <SourceStateView state={state} />
    {domain ? <BusinessSummaryPanel domain={domain} /> : null}
    {rows.length ? <Section title="Rekaman Operasional"><DataTable caption={`Ringkasan ${title}`} rows={rows} getRowKey={(row) => row.key} columns={[
      { key: "label", header: "Sumber Rekaman", render: (row) => row.label },
      { key: "value", header: "Jumlah Tersimpan", render: (row) => row.value },
    ]} /></Section> : null}
    <Section title="Indikator yang Belum Tersedia"><div className={styles.metricGrid}>{unavailable.map((label) => <Metric key={label} label={label} value="—" supportingText="Belum Tersedia: definisi atau sumber authoritative belum lengkap." />)}</div></Section>
  </div>;
}
