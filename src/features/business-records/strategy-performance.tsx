"use client";
import { domainLabels, readableValue, roleLabel } from "@/lib/presentation";
import { useEffect, useState } from "react";
import { DataTable, PageHeader, Section } from "@/components/ui";
import type { BusinessTargetDetail } from "@/lib/contracts";
import { strategyApi } from "@/modules/strategy";
import { lifecycleLabel, performanceLabel, periodLabel, valueForObservation, verificationLabel } from "@/features/executive/executive-model";
import { SourceStateView, sourceFailure } from "./record-panel";
import type { SourceState } from "./resource";
import styles from "@/features/property/property.module.css";
import { ClosingActual } from "./closing-actual";

export function StrategyPerformance({ domain }: Readonly<{ domain: string }>) {
  const [rows, setRows] = useState<readonly BusinessTargetDetail[]>([]);
  const [state, setState] = useState<SourceState>("loading");
  const domainName = domainLabels[domain] ?? Object.values(domainLabels).find((label) => label === domain) ?? "Kinerja Divisi";
  useEffect(() => {
    let current = true; const controller = new AbortController();
    void strategyApi.listTargetDetails(controller.signal)
      .then((data) => { if (current) { setRows(data); setState(data.length ? "CONNECTED" : "CONNECTED_EMPTY"); } })
      .catch((error: unknown) => { if (current) { setRows([]); setState(sourceFailure(error)); } });
    return () => { current = false; controller.abort(); };
  }, []);
  return <div className={styles.page}><PageHeader title="Target & Kinerja" eyebrow={domainName} description="Target, aktual, perkiraan, dan kinerja berasal dari catatan strategi perusahaan." />
    <SourceStateView state={state} />
    {domain === "sales" && state === "CONNECTED" && <ClosingActual rows={rows} onSaved={async () => setRows(await strategyApi.listTargetDetails())} />}
    {state === "CONNECTED" ? <Section title="Target Strategi"><DataTable caption={`Target dan Kinerja ${domain}`} rows={rows} getRowKey={(row) => `${row.target.target_id}-${row.target.version}`} columns={[
      { key: "name", header: "Target", render: (row) => row.target.name },
      { key: "period", header: "Periode", render: (row) => periodLabel(row.target.period) },
      { key: "target", header: "Nilai Target", render: (row) => valueForObservation(row.selected_observations?.target ?? null) },
      { key: "actual", header: "Aktual", render: (row) => valueForObservation(row.selected_observations?.actual ?? null) },
      { key: "forecast", header: "Perkiraan", render: (row) => valueForObservation(row.selected_observations?.forecast ?? null) },
      { key: "performance", header: "Kinerja", render: (row) => performanceLabel(row.performance_state) },
      { key: "verification", header: "Pemeriksaan", render: (row) => verificationLabel(row.selected_observations?.actual?.verification_state) },
      { key: "owner", header: "Penanggung Jawab", render: (row) => roleLabel(row.target.owner_role_ref) },
      { key: "lifecycle", header: "Status", render: (row) => lifecycleLabel(row.target.lifecycle_state) },
      { key: "updated", header: "Pembaruan Sumber", render: (row) => readableValue(row.last_updated_at) },
    ]} /></Section> : null}
  </div>;
}
