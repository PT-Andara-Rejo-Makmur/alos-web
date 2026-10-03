"use client";

import { useEffect, useState } from "react";
import { DataTable, Section } from "@/components/ui";
import { apiMessage, authenticatedApiRequest } from "@/lib/api";
import type { BusinessMetric, BusinessSummary } from "@/lib/contracts";

function isMetric(value: unknown): value is BusinessMetric {
  if (!value || typeof value !== "object") return false;
  const metric = value as Record<string, unknown>;
  return typeof metric.code === "string" && typeof metric.label === "string"
    && typeof metric.available === "boolean" && ["COUNT", "AMOUNT", "PERCENT"].includes(String(metric.unit))
    && (metric.value === null || typeof metric.value === "string" || typeof metric.value === "number")
    && (metric.source === null || typeof metric.source === "string");
}

function isSummary(value: unknown, domain: BusinessSummary["domain"]): value is BusinessSummary {
  if (!value || typeof value !== "object") return false;
  const summary = value as Record<string, unknown>;
  return summary.domain === domain && typeof summary.generated_at === "string"
    && Array.isArray(summary.metrics) && summary.metrics.every(isMetric);
}

export function BusinessSummaryPanel({ domain }: Readonly<{ domain: BusinessSummary["domain"] }>) {
  const [summary, setSummary] = useState<BusinessSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    void authenticatedApiRequest<unknown>(`/api/v1/business/${domain}/summary`, { signal: controller.signal })
      .then(value => {
        if (controller.signal.aborted) return;
        if (!isSummary(value, domain)) throw new Error("Sumber kinerja bisnis belum memberikan data yang sesuai.");
        setSummary(value);
      }).catch(caught => { if (!controller.signal.aborted) setError(apiMessage(caught)); });
    return () => controller.abort();
  }, [domain]);
  return <Section title="Kinerja Bisnis">{summary ? <DataTable rows={summary.metrics} getRowKey={row => row.code}
    columns={[{ key: "label", header: "Indikator", render: row => row.label },
      { key: "value", header: "Nilai", render: row => row.available && row.value !== null ? String(row.value) : "Belum tersedia" }]} /> : <p role={error ? "alert" : "status"}>{error ?? "Memuat kinerja bisnis…"}</p>}</Section>;
}
