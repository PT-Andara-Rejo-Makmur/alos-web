"use client";
import { useEffect, useState } from "react";
import { DataTable, PageHeader, Section } from "@/components/ui";
import type { BusinessTargetDetail } from "@/lib/contracts";
import { strategyApi } from "@/modules/strategy";
import { performanceLabel, periodLabel, valueForObservation } from "@/features/executive/executive-model";
import { SourceStateView, sourceFailure } from "./record-panel";
import type { SourceState } from "./resource";
import styles from "@/features/property/property.module.css";

export function StrategyPerformance({ domain }: Readonly<{ domain: string }>) {
  const [rows, setRows] = useState<readonly BusinessTargetDetail[]>([]);
  const [state, setState] = useState<SourceState>("loading");
  useEffect(() => {
    let current = true; const controller = new AbortController();
    void strategyApi.listTargetDetails(controller.signal)
      .then((data) => { if (current) { setRows(data); setState(data.length ? "CONNECTED" : "CONNECTED_EMPTY"); } })
      .catch((error: unknown) => { if (current) { setRows([]); setState(sourceFailure(error)); } });
    return () => { current = false; controller.abort(); };
  }, []);
  return <div className={styles.page}><PageHeader title="Target & Kinerja" eyebrow={domain.toUpperCase()} description={`Target, actual, forecast, verification, dan performance ${domain} berasal dari projection Strategy Backend.`} />
    <SourceStateView state={state} />
    {state === "CONNECTED" ? <Section title="Target Strategi"><DataTable caption={`Target dan Kinerja ${domain}`} rows={rows} getRowKey={(row) => `${row.target.target_id}-${row.target.version}`} columns={[
      { key: "name", header: "Target", render: (row) => row.target.name },
      { key: "period", header: "Periode", render: (row) => periodLabel(row.target.period) },
      { key: "target", header: "Nilai Target", render: (row) => valueForObservation(row.selected_observations?.target ?? null) },
      { key: "actual", header: "Aktual", render: (row) => valueForObservation(row.selected_observations?.actual ?? null) },
      { key: "forecast", header: "Perkiraan", render: (row) => valueForObservation(row.selected_observations?.forecast ?? null) },
      { key: "performance", header: "Kinerja", render: (row) => performanceLabel(row.performance_state) },
      { key: "verification", header: "Verifikasi", render: (row) => row.selected_observations?.actual?.verification_state ?? "—" },
      { key: "owner", header: "Owner", render: (row) => row.target.owner_role_ref },
      { key: "lifecycle", header: "Lifecycle", render: (row) => row.target.lifecycle_state },
      { key: "updated", header: "Pembaruan Sumber", render: (row) => row.last_updated_at ?? "Tidak diketahui" },
    ]} /></Section> : null}
  </div>;
}
