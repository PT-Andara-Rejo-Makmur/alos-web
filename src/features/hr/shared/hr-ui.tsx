"use client";

import { Fragment, type ReactNode } from "react";
import { Alert, Button, Drawer, EmptyState, LoadingState, Status } from "@/components/ui";
import type { HrSourceState } from "../hr-model";
import styles from "../hr.module.css";

export type HrSourceKey = "employees" | "organization" | "recruitment" | "attendance" | "leave" | "performance" | "payroll" | "documents" | "legal" | "identity" | "strategy" | "ga";
export type HrSourceStatusMap = Partial<Record<HrSourceKey, HrSourceState>>;
export const HR_SOURCES: readonly HrSourceKey[] = ["employees", "recruitment", "attendance", "leave", "performance", "payroll", "legal", "identity"];
export const HR_PERFORMANCE_SOURCES: readonly HrSourceKey[] = ["strategy", "employees", "performance"];
export const HR_SOURCE_LABELS: Record<HrSourceKey, string> = { employees: "Karyawan", organization: "Organisasi", recruitment: "Rekrutmen", attendance: "Kehadiran", leave: "Cuti", performance: "Pengembangan", payroll: "Penggajian", documents: "Dokumen", legal: "Legal", identity: "Akses & Identitas", strategy: "Strategi", ga: "Fasilitas" };
export const defaultHrSourceStatuses: HrSourceStatusMap = Object.fromEntries(HR_SOURCES.map((source) => [source, "unavailable" as const])) as HrSourceStatusMap;

function statusLabel(state: HrSourceState): string { return state === "loading" ? "Memuat" : state === "error" ? "Gagal Memuat" : state === "unavailable" ? "Belum Terhubung" : "Tersedia"; }
function statusVariant(state: HrSourceState): "danger" | "info" | "neutral" { return state === "error" ? "danger" : state === "loading" ? "info" : "neutral"; }

export function HrSourceStateView({ children, description, state, title }: Readonly<{ children?: ReactNode; description: string; state: HrSourceState; title?: string }>) {
  if (state === "loading") return <LoadingState label="Memuat data" variant="section" />;
  if (state === "error") return <Alert message={description || "Data belum dapat dimuat."} title="Data belum dapat dimuat" variant="danger" />;
  if (state === "connected-empty") return <div className={styles.sourceState} role="status"><EmptyState description={description} title={title ?? "Belum ada data"} /></div>;
  if (state === "connected-data") return <>{children ?? null}</>;
  return <div className={styles.sourceState} role="status"><Status label="Belum Terhubung" variant="neutral" /><EmptyState description={description} title={title ?? "Belum Terhubung"} /></div>;
}

export function HrSourceStrip({ onStatus, sources = HR_SOURCES, statuses = defaultHrSourceStatuses }: Readonly<{ onStatus?: () => void; sources?: readonly HrSourceKey[]; statuses?: HrSourceStatusMap }>) {
  return <section aria-label="Status sumber data HR" className={styles.sourceStrip}>{sources.map((source) => { const state = statuses[source] ?? "unavailable"; return <div className={styles.sourceItem} key={source}><span>{HR_SOURCE_LABELS[source]}</span><Status label={statusLabel(state)} variant={statusVariant(state)} /></div>; })}{onStatus ? <Button onClick={onStatus} size="sm" variant="secondary">Lihat Status Data</Button> : null}</section>;
}

export function HrStatusDrawer({ onClose, open, sources = HR_SOURCES, statuses = defaultHrSourceStatuses }: Readonly<{ onClose: () => void; open: boolean; sources?: readonly HrSourceKey[]; statuses?: HrSourceStatusMap }>) {
  return <Drawer description="Status sumber ditampilkan tanpa menyimpulkan kondisi karyawan atau organisasi." onClose={onClose} open={open} title="Status Data HR"><dl className={styles.detailList}>{sources.map((source) => <Fragment key={source}><dt>{HR_SOURCE_LABELS[source]}</dt><dd>{statusLabel(statuses[source] ?? "unavailable")}</dd></Fragment>)}</dl></Drawer>;
}
