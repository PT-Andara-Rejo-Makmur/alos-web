"use client";

import type { ReactNode } from "react";

import { Button, Section } from "@/components/ui";

import styles from "../it.module.css";

export type ItSourceState = "loading" | "unavailable" | "error" | "connected-empty" | "connected-data";

const sourceLabels: Record<ItSourceState, string> = {
  loading: "Memuat",
  unavailable: "Belum Terhubung",
  error: "Data belum dapat dimuat",
  "connected-empty": "Belum ada data",
  "connected-data": "Tersedia",
};

export function ItSourceStateView({ children, description, state, title = "Status Data" }: Readonly<{ children?: ReactNode; description: string; state: ItSourceState; title?: string }>) {
  return <div className={styles.sourceState} role="status"><strong>{title}: {sourceLabels[state]}</strong><span>{description}</span>{children}</div>;
}

export function ItSourceStrip({ statuses }: Readonly<{ statuses?: Readonly<Record<string, ItSourceState>> }>) {
  const sources = ["Layanan", "Sistem", "Infrastruktur", "Identitas", "Keamanan", "Aset", "Dukungan"];
  return <Section title="Status Sumber Data"><div className={styles.moduleColumns}>{sources.map((source) => <span className={styles.moduleColumn} key={source}>{source}: {sourceLabels[statuses?.[source] ?? "unavailable"]}</span>)}</div></Section>;
}

export function ItReadinessSection({ children, description, title }: Readonly<{ children?: ReactNode; description: string; title: string }>) {
  return <Section title={title}><ItSourceStateView description={description} state="unavailable">{children}</ItSourceStateView></Section>;
}

export function ItUnavailableAction({ label }: Readonly<{ label: string }>) {
  return <Button disabled variant="secondary">{label} belum tersedia</Button>;
}
