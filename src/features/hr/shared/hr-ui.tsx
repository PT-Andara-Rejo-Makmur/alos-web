"use client";

import { Fragment, useState, type FormEvent, type ReactNode } from "react";
import { Alert, Button, Drawer, EmptyState, FormField, LoadingState, Status } from "@/components/ui";
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

export type HrFormField = { readonly label: string; readonly name: string; readonly type?: "date" | "datetime-local" | "number" | "text" | "textarea"; readonly required?: boolean; readonly relation?: boolean; readonly select?: boolean; readonly sourceReady?: boolean; readonly helper?: ReactNode };
export function HrUnavailableFormDrawer({ description, fields, onClose, open, submitLabel = "Simpan", title }: Readonly<{ description: string; fields: readonly HrFormField[]; onClose: () => void; open: boolean; submitLabel?: string; title: string }>) {
  const [submitted, setSubmitted] = useState(false);
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setSubmitted(true); };
  return <Drawer description={description} onClose={onClose} open={open} title={title}><div className={styles.formStack}><Alert message="Penyimpanan belum tersedia. Perubahan tidak dilaporkan sebagai berhasil." title="Penyimpanan Belum Tersedia" variant="neutral" /><form className={styles.form} onSubmit={handleSubmit}><div className={styles.formGrid}>{fields.map((field) => <FormField description={field.helper ?? ((field.relation || field.select) && field.sourceReady !== true ? "Pilihan belum tersedia." : undefined)} htmlFor={`hr-form-${field.name}`} key={field.name} label={field.label} required={field.required}>{field.relation || field.select ? <select disabled={field.sourceReady !== true} id={`hr-form-${field.name}`}><option>Pilihan belum tersedia.</option></select> : field.type === "textarea" ? <textarea id={`hr-form-${field.name}`} placeholder="—" /> : <input id={`hr-form-${field.name}`} placeholder="—" type={field.type ?? "text"} />}</FormField>)}</div>{submitted ? <p className={styles.formFeedback} role="status">Perubahan belum disimpan karena penyimpanan belum tersedia.</p> : null}<div><Button onClick={onClose} type="button" variant="ghost">Batal</Button><Button disabled type="submit" variant="primary">{submitLabel}</Button></div></form></div></Drawer>;
}

export function HrExtractionDrawer({ onClose, open }: Readonly<{ onClose: () => void; open: boolean }>) {
  return <Drawer description="Dokumen → Ekstraksi → Kandidat → Telaah Manusia → Draf → Verifikasi → Persetujuan bila diperlukan → Aktif." onClose={onClose} open={open} title="Telaah Dokumen SDM"><div className={styles.extractionGrid}><section className={styles.extractionPanel}><h3>Dokumen Sumber</h3><HrSourceStateView description="Dokumen dan layanan ekstraksi belum tersedia." state="unavailable" /></section><section className={styles.extractionPanel}><h3>Kandidat Informasi</h3><div className={styles.candidateUnavailable} role="status"><strong>Belum ada kandidat ekstraksi.</strong><span>Hasil pembacaan dokumen akan tampil setelah layanan ekstraksi tersedia.</span></div></section></div></Drawer>;
}
