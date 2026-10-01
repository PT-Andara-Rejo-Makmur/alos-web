"use client";

import { Fragment, type ReactNode } from "react";
import { Alert, Button, Drawer, EmptyState, LoadingState, Status } from "@/components/ui";
import type { LegalSourceState } from "../legal-model";
import styles from "../legal.module.css";

export type LegalSourceKey = "strategy" | "contracts" | "permits" | "project_assets" | "finance" | "sales" | "hr" | "documents" | "regulation";
export type LegalSourceStatusMap = Partial<Record<LegalSourceKey, LegalSourceState>>;
export const LEGAL_SOURCES: readonly LegalSourceKey[] = ["contracts", "permits", "project_assets", "finance", "sales", "hr", "documents", "regulation"];
export const LEGAL_PERFORMANCE_SOURCES: readonly LegalSourceKey[] = ["strategy", "contracts", "permits", "project_assets"];
export const LEGAL_SOURCE_LABELS: Record<LegalSourceKey, string> = { strategy: "Strategi", contracts: "Kontrak", permits: "Perizinan", project_assets: "Legalitas Proyek", finance: "Keuangan", sales: "Penjualan", hr: "SDM", documents: "Dokumen", regulation: "Sumber Regulasi" };
export const defaultLegalSourceStatuses: LegalSourceStatusMap = Object.fromEntries(LEGAL_SOURCES.map((source) => [source, "unavailable" as const])) as LegalSourceStatusMap;

export function LegalSourceStateView({ children, description, state, title }: Readonly<{ children?: ReactNode; description: string; state: LegalSourceState; title?: string }>) {
  if (state === "loading") return <LoadingState label="Memuat data" variant="section" />;
  if (state === "error") return <Alert message={description || "Data belum dapat dimuat."} title="Data belum dapat dimuat" variant="danger" />;
  if (state === "connected-empty") return <div className={styles.sourceState} role="status"><EmptyState description={description} title={title ?? "Belum ada data"} /></div>;
  if (state === "connected-data") return <>{children ?? null}</>;
  return <div className={styles.sourceState} role="status"><Status label="Belum Terhubung" variant="neutral" /><EmptyState description={description} title={title ?? "Belum Terhubung"} /></div>;
}

function sourceLabel(state: LegalSourceState): string { if (state === "loading") return "Memuat"; if (state === "error") return "Gagal Memuat"; if (state === "connected-empty" || state === "connected-data") return "Tersedia"; return "Belum Terhubung"; }
function sourceVariant(state: LegalSourceState): "danger" | "info" | "neutral" { if (state === "error") return "danger"; if (state === "loading") return "info"; return "neutral"; }

export function LegalSourceStrip({ onStatus, sources = LEGAL_SOURCES, statuses = defaultLegalSourceStatuses }: Readonly<{ onStatus?: () => void; sources?: readonly LegalSourceKey[]; statuses?: LegalSourceStatusMap }>) {
  return <section aria-label="Status sumber data Legal" className={styles.sourceStrip}>{sources.map((source) => { const state = statuses[source] ?? "unavailable"; return <div className={styles.sourceItem} key={source}><span>{LEGAL_SOURCE_LABELS[source]}</span><Status label={sourceLabel(state)} variant={sourceVariant(state)} /></div>; })}{onStatus ? <Button onClick={onStatus} size="sm" variant="secondary">Lihat Status Data</Button> : null}</section>;
}

export function LegalStatusDrawer({ onClose, open, sources = LEGAL_SOURCES, statuses = defaultLegalSourceStatuses }: Readonly<{ onClose: () => void; open: boolean; sources?: readonly LegalSourceKey[]; statuses?: LegalSourceStatusMap }>) {
  return <Drawer description="Status sumber ditampilkan tanpa menyimpulkan validitas legal." onClose={onClose} open={open} title="Status Data Legal"><dl className={styles.detailList}>{sources.map((source) => <Fragment key={source}><dt>{LEGAL_SOURCE_LABELS[source]}</dt><dd>{sourceLabel(statuses[source] ?? "unavailable")}</dd></Fragment>)}</dl></Drawer>;
}
