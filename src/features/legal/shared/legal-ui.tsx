"use client";

import { Fragment, useState, type FormEvent, type ReactNode } from "react";
import { Alert, Button, Drawer, EmptyState, FormField, LoadingState, Status } from "@/components/ui";
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

export type LegalFormField = { readonly label: string; readonly name: string; readonly type?: "date" | "number" | "text" | "textarea"; readonly required?: boolean; readonly relation?: boolean; readonly select?: boolean; readonly sourceReady?: boolean; readonly helper?: ReactNode; };

export function LegalUnavailableFormDrawer({ description, fields, onClose, open, submitLabel = "Simpan", title }: Readonly<{ description: string; fields: readonly LegalFormField[]; onClose: () => void; open: boolean; submitLabel?: string; title: string }>) {
  const [submitted, setSubmitted] = useState(false);
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setSubmitted(true); };
  return <Drawer description={description} onClose={onClose} open={open} title={title}><div className={styles.formStack}><Alert message="Penyimpanan belum tersedia. Perubahan tidak dilaporkan sebagai berhasil." title="Penyimpanan Belum Tersedia" variant="neutral" /><form className={styles.form} onSubmit={handleSubmit}><div className={styles.formGrid}>{fields.map((field) => <FormField description={field.helper ?? ((field.relation || field.select) && field.sourceReady !== true ? "Pilihan belum tersedia." : undefined)} htmlFor={`legal-form-${field.name}`} key={field.name} label={field.label} required={field.required}>{field.relation || field.select ? <select disabled={field.sourceReady !== true} id={`legal-form-${field.name}`}><option>Pilihan belum tersedia.</option></select> : field.type === "textarea" ? <textarea id={`legal-form-${field.name}`} placeholder="—" /> : <input id={`legal-form-${field.name}`} placeholder="—" type={field.type ?? "text"} />}</FormField>)}</div>{submitted ? <p className={styles.formFeedback} role="status">Perubahan belum disimpan karena penyimpanan belum tersedia.</p> : null}<div className={styles.actionBar}><Button onClick={onClose} type="button" variant="ghost">Batal</Button><Button disabled type="submit" variant="primary">{submitLabel}</Button></div></form></div></Drawer>;
}

export function LegalExtractionDrawer({ onClose, open }: Readonly<{ onClose: () => void; open: boolean }>) {
  return <Drawer description="Dokumen → Ekstraksi → Kandidat → Telaah Legal → Draf → Verifikasi → Persetujuan bila diperlukan → Aktif." onClose={onClose} open={open} title="Telaah Dokumen Legal"><div className={styles.extractionGrid}><section className={styles.extractionPanel}><h3>Dokumen Sumber</h3><LegalSourceStateView description="Dokumen dan layanan ekstraksi belum tersedia." state="unavailable" /></section><section className={styles.extractionPanel}><h3>Kolom Kandidat</h3><div className={styles.candidateUnavailable} role="status"><strong>Belum ada kandidat ekstraksi.</strong><span>Hasil pembacaan dokumen akan tampil setelah layanan tersedia.</span></div></section></div></Drawer>;
}
