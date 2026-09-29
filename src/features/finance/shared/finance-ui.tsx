"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { Alert, Button, Drawer, EmptyState, FormField, Status } from "@/components/ui";

import styles from "../finance.module.css";

export type FinanceFormField = {
  readonly label: string;
  readonly name: string;
  readonly placeholder?: string;
  readonly type?: "date" | "number" | "text" | "textarea";
};

export const FINANCE_SOURCES = ["Strategy", "Kas / Bank", "Penerimaan", "Pengeluaran", "Sales", "Property", "Legal", "Pajak"] as const;

export function FinanceUnavailableState({ description, title = "Belum Terhubung" }: Readonly<{ description: string; title?: string }>) {
  return <div className={styles.sourceState} role="status"><Status label="Belum Terhubung" variant="neutral" /><EmptyState description={description} title={title} /></div>;
}

export function FinanceSourceStrip({ onStatus }: Readonly<{ onStatus?: () => void }>) {
  return <section aria-label="Status sumber data Finance" className={styles.sourceStrip}>{FINANCE_SOURCES.map((source) => <div className={styles.sourceItem} key={source}><span>{source}</span><Status label="Belum Terhubung" variant="neutral" /></div>)}{onStatus ? <Button onClick={onStatus} size="sm" variant="secondary">Lihat Status Data</Button> : null}</section>;
}

export function FinanceUnavailableFormDrawer({ description, fields, onClose, open, submitLabel = "Simpan", title }: Readonly<{ description: string; fields: readonly FinanceFormField[]; onClose: () => void; open: boolean; submitLabel?: string; title: string }>) {
  const [submitted, setSubmitted] = useState(false);
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setSubmitted(true); };
  return <Drawer description={description} onClose={onClose} open={open} title={title}><div className={styles.formStack}><Alert message="Penyimpanan belum tersedia. Perubahan tidak dilaporkan sebagai berhasil." title="Penyimpanan Belum Tersedia" variant="neutral" /><form className={styles.form} onSubmit={handleSubmit}><div className={styles.formGrid}>{fields.map((field) => <FormField htmlFor={`finance-form-${field.name}`} key={field.name} label={field.label}>{field.type === "textarea" ? <textarea id={`finance-form-${field.name}`} placeholder={field.placeholder ?? "—"} /> : <input id={`finance-form-${field.name}`} placeholder={field.placeholder ?? "—"} type={field.type ?? "text"} />}</FormField>)}</div>{submitted ? <p className={styles.formFeedback} role="status">Perubahan belum disimpan karena penyimpanan belum tersedia.</p> : null}<div className={styles.actionBar}><Button onClick={onClose} type="button" variant="ghost">Batal</Button><Button disabled onClick={() => setSubmitted(false)} type="submit" variant="primary">{submitLabel}</Button></div></form></div></Drawer>;
}

export function FinanceStatusDrawer({ onClose, open }: Readonly<{ onClose: () => void; open: boolean }>) {
  return <Drawer description="Status sumber ditampilkan tanpa membuat nilai keuangan baru." onClose={onClose} open={open} title="Status Data Finance"><dl className={styles.detailList}>{FINANCE_SOURCES.map((source) => <><dt key={`${source}-label`}>{source}</dt><dd key={`${source}-value`}>Belum Terhubung</dd></>)}</dl></Drawer>;
}

export function FinanceExtractionDrawer({ onClose, open }: Readonly<{ onClose: () => void; open: boolean }>) {
  return <Drawer description="Dokumen → Ekstraksi → Kandidat → Telaah Manusia → Draf → Verifikasi → Persetujuan bila diperlukan → Aktif." onClose={onClose} open={open} title="Telaah Dokumen Finance"><div className={styles.extractionGrid}><section className={styles.extractionPanel}><h3>Sumber / Dokumen</h3><FinanceUnavailableState description="Dokumen dan layanan ekstraksi belum tersedia." /></section><section className={styles.extractionPanel}><h3>Kolom Kandidat</h3><div className={styles.candidateUnavailable} role="status"><strong>Belum ada kandidat ekstraksi.</strong><span>Hasil pembacaan dokumen akan tampil setelah layanan tersedia.</span></div></section></div></Drawer>;
}

export function FinanceSectionNote({ children }: Readonly<{ children: ReactNode }>) {
  return <div className={styles.formFeedback}>{children}</div>;
}
