"use client";

import { Fragment, useState, type FormEvent, type ReactNode } from "react";
import { Alert, Button, Drawer, EmptyState, FormField, LoadingState, Status } from "@/components/ui";
import type { FinanceSourceState } from "../finance-model";

import styles from "../finance.module.css";

export type FinanceFormField = {
  readonly label: string;
  readonly name: string;
  readonly placeholder?: string;
  readonly helper?: ReactNode;
  readonly relation?: boolean;
  readonly required?: boolean;
  readonly sourceReady?: boolean;
  readonly type?: "date" | "number" | "text" | "textarea";
};

export const FINANCE_SOURCES = ["strategy", "cash_bank", "receipts", "payments", "sales", "property", "legal", "tax"] as const;
export type FinanceSourceKey = (typeof FINANCE_SOURCES)[number];
export type FinanceSourceStatusMap = Partial<Record<FinanceSourceKey, FinanceSourceState>>;
export const FINANCE_SOURCE_LABELS: Record<FinanceSourceKey, string> = { strategy: "Strategi", cash_bank: "Kas / Bank", receipts: "Penerimaan", payments: "Pengeluaran", sales: "Penjualan", property: "Property & Teknik", legal: "Legal", tax: "Pajak" };
export const defaultFinanceSourceStatuses: FinanceSourceStatusMap = Object.fromEntries(FINANCE_SOURCES.map((source) => [source, "unavailable" as const])) as FinanceSourceStatusMap;

export function FinanceUnavailableState({ description, title = "Belum Terhubung" }: Readonly<{ description: string; title?: string }>) {
  return <FinanceSourceStateView description={description} state="unavailable" title={title} />;
}

export function FinanceSourceStateView({ description, state, title }: Readonly<{ description: string; state: FinanceSourceState; title?: string }>) {
  if (state === "loading") return <LoadingState label="Memuat data" variant="section" />;
  if (state === "error") return <Alert message={description || "Data belum dapat dimuat."} title="Data belum dapat dimuat" variant="danger" />;
  if (state === "connected-empty") return <div className={styles.sourceState} role="status"><EmptyState description={description} title={title ?? "Belum ada data"} /></div>;
  if (state === "connected-data") return null;
  return <div className={styles.sourceState} role="status"><Status label="Belum Terhubung" variant="neutral" /><EmptyState description={description} title={title ?? "Belum Terhubung"} /></div>;
}

function sourceStateLabel(state: FinanceSourceState): string { if (state === "loading") return "Memuat"; if (state === "error") return "Gagal Memuat"; if (state === "connected-empty" || state === "connected-data") return "Tersedia"; return "Belum Terhubung"; }
function sourceStateVariant(state: FinanceSourceState): "danger" | "info" | "neutral" { if (state === "error") return "danger"; if (state === "loading") return "info"; return "neutral"; }

export function FinanceSourceStrip({ onStatus, statuses = defaultFinanceSourceStatuses }: Readonly<{ onStatus?: () => void; statuses?: FinanceSourceStatusMap }>) {
  return <section aria-label="Status sumber data Finance" className={styles.sourceStrip}>{FINANCE_SOURCES.map((source) => { const state = statuses[source] ?? "unavailable"; return <div className={styles.sourceItem} key={source}><span>{FINANCE_SOURCE_LABELS[source]}</span><Status label={sourceStateLabel(state)} variant={sourceStateVariant(state)} /></div>; })}{onStatus ? <Button onClick={onStatus} size="sm" variant="secondary">Lihat Status Data</Button> : null}</section>;
}

export function FinanceUnavailableFormDrawer({ description, fields, onClose, open, submitLabel = "Simpan", title }: Readonly<{ description: string; fields: readonly FinanceFormField[]; onClose: () => void; open: boolean; submitLabel?: string; title: string }>) {
  const [submitted, setSubmitted] = useState(false);
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setSubmitted(true); };
  return <Drawer description={description} onClose={onClose} open={open} title={title}><div className={styles.formStack}><Alert message="Penyimpanan belum tersedia. Perubahan tidak dilaporkan sebagai berhasil." title="Penyimpanan Belum Tersedia" variant="neutral" /><form className={styles.form} onSubmit={handleSubmit}><div className={styles.formGrid}>{fields.map((field) => <FormField description={field.helper ?? (field.relation && field.sourceReady !== true ? "Pilihan belum tersedia." : undefined)} htmlFor={`finance-form-${field.name}`} key={field.name} label={field.label} required={field.required}>{field.relation ? <select disabled={field.sourceReady !== true} id={`finance-form-${field.name}`}><option>{field.sourceReady === true ? "Pilih" : "Pilihan belum tersedia."}</option></select> : field.type === "textarea" ? <textarea id={`finance-form-${field.name}`} placeholder={field.placeholder ?? "—"} /> : <input id={`finance-form-${field.name}`} placeholder={field.placeholder ?? "—"} type={field.type ?? "text"} />}</FormField>)}</div>{submitted ? <p className={styles.formFeedback} role="status">Perubahan belum disimpan karena penyimpanan belum tersedia.</p> : null}<div className={styles.actionBar}><Button onClick={onClose} type="button" variant="ghost">Batal</Button><Button disabled onClick={() => setSubmitted(false)} type="submit" variant="primary">{submitLabel}</Button></div></form></div></Drawer>;
}

export function FinanceStatusDrawer({ onClose, open, statuses = defaultFinanceSourceStatuses }: Readonly<{ onClose: () => void; open: boolean; statuses?: FinanceSourceStatusMap }>) {
  return <Drawer description="Status sumber ditampilkan tanpa membuat nilai keuangan baru." onClose={onClose} open={open} title="Status Data Finance"><dl className={styles.detailList}>{FINANCE_SOURCES.map((source) => { const state = statuses[source] ?? "unavailable"; return <Fragment key={source}><dt>{FINANCE_SOURCE_LABELS[source]}</dt><dd>{sourceStateLabel(state)}</dd></Fragment>; })}</dl></Drawer>;
}

export function FinanceExtractionDrawer({ onClose, open }: Readonly<{ onClose: () => void; open: boolean }>) {
  return <Drawer description="Dokumen → Ekstraksi → Kandidat → Telaah Manusia → Draf → Verifikasi → Persetujuan bila diperlukan → Aktif." onClose={onClose} open={open} title="Telaah Dokumen Finance"><div className={styles.extractionGrid}><section className={styles.extractionPanel}><h3>Sumber / Dokumen</h3><FinanceUnavailableState description="Dokumen dan layanan ekstraksi belum tersedia." /></section><section className={styles.extractionPanel}><h3>Kolom Kandidat</h3><div className={styles.candidateUnavailable} role="status"><strong>Belum ada kandidat ekstraksi.</strong><span>Hasil pembacaan dokumen akan tampil setelah layanan tersedia.</span></div></section></div></Drawer>;
}

export function FinanceSectionNote({ children }: Readonly<{ children: ReactNode }>) {
  return <div className={styles.formFeedback}>{children}</div>;
}
