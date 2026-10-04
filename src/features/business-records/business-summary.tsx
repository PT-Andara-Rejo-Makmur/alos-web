"use client";

import { useEffect, useState } from "react";
import { Alert, LoadingState, Metric, Section } from "@/components/ui";
import { businessMetricValue } from "@/lib/presentation";
import { isBusinessSummary } from "@/lib/business-projection";
import styles from "@/components/ui/work-surface.module.css";
import { apiMessage, authenticatedApiRequest } from "@/lib/api";
import type { BusinessSummary } from "@/lib/contracts";

export function BusinessSummaryPanel({ domain }: Readonly<{ domain: BusinessSummary["domain"] }>) {
  const [summary, setSummary] = useState<BusinessSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    void authenticatedApiRequest<unknown>(`/api/v1/business/${domain}/summary`, { signal: controller.signal })
      .then(value => {
        if (controller.signal.aborted) return;
        if (!isBusinessSummary(value, domain)) throw new Error("Sumber kinerja bisnis belum memberikan data yang sesuai.");
        setSummary(value);
      }).catch(caught => { if (!controller.signal.aborted) setError(apiMessage(caught)); });
    return () => controller.abort();
  }, [domain]);
  return <Section title="Kinerja Bisnis">{summary ? <><div className={styles.metricStrip}>{summary.metrics.map(metric => <Metric key={metric.code} unavailable={!metric.available || metric.value === null} label={metric.label} value={businessMetricValue(metric)} supportingText={metric.available && metric.value !== null ? "Dari catatan perusahaan" : "Data pengukuran belum tersedia"} />)}</div><p className={styles.sourceNote}>{summary.metrics.filter(metric => metric.available && metric.value !== null).length} dari {summary.metrics.length} indikator tersedia · Diperbarui {new Date(summary.generated_at).toLocaleString("id-ID")}</p></> : error ? <Alert variant="danger" message={error} /> : <LoadingState label="Memuat kinerja bisnis…" variant="section" />}</Section>;
}
