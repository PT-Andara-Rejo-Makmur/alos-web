"use client";

import { useState, type FormEvent, type ReactNode } from "react";

import { Alert, Button, Drawer, EmptyState, FormField, Status } from "@/components/ui";

import styles from "../property.module.css";

export interface PropertyFormField {
  readonly label: string;
  readonly name: string;
  readonly placeholder?: string;
  readonly type?: "date" | "number" | "text" | "textarea";
}

export interface PropertyDetailItem {
  readonly label: string;
  readonly value: string;
}

export function PropertySourceNote({ children }: Readonly<{ children: ReactNode }>) {
  return <div className={styles.sourceNote}><Status label="Belum Terhubung" variant="neutral" /><span>{children}</span></div>;
}

export function PropertyUnavailableState({ description, title = "Belum Terhubung" }: Readonly<{ description: string; title?: string }>) {
  return <div className={styles.sourceState} role="status"><Status label="Belum Terhubung" variant="neutral" /><EmptyState description={description} title={title} /></div>;
}

export function PropertyFilterBar({ ariaLabel = "Filter data Property", children, search }: Readonly<{ ariaLabel?: string; children: ReactNode; search?: ReactNode }>) {
  return <div aria-label={ariaLabel} className={styles.filterBar} role="group">{search ? <div className={styles.search}>{search}</div> : null}<div className={styles.filterGrid}>{children}</div></div>;
}

export function PropertySelect({ label, name, onChange, options, value }: Readonly<{ label: string; name: string; onChange: (value: string) => void; options: readonly (readonly [string, string])[]; value: string }>) {
  return <FormField htmlFor={`property-${name}`} label={label}><select id={`property-${name}`} onChange={(event) => onChange(event.target.value)} value={value}>{options.map(([optionValue, optionLabel]) => <option key={optionValue} value={optionValue}>{optionLabel}</option>)}</select></FormField>;
}

export function PropertyDetailDrawer({ children, description = "Detail hanya menampilkan projection authoritative yang tersedia.", items, onClose, open, title }: Readonly<{ children?: ReactNode; description?: string; items: readonly PropertyDetailItem[]; onClose: () => void; open: boolean; title: string }>) {
  return <Drawer description={description} onClose={onClose} open={open} title={title}><dl className={styles.detailList}>{items.map((item) => <><dt key={`${item.label}-term`}>{item.label}</dt><dd key={`${item.label}-value`}>{item.value}</dd></>)}</dl>{children ? <div className={styles.actionBar}>{children}</div> : null}</Drawer>;
}

export function PropertyUnavailableFormDrawer({ description, fields, onClose, open, submitLabel = "Simpan", title }: Readonly<{ description: string; fields: readonly PropertyFormField[]; onClose: () => void; open: boolean; submitLabel?: string; title: string }>) {
  const [submitted, setSubmitted] = useState(false);
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setSubmitted(true); };
  return <Drawer description={description} onClose={onClose} open={open} title={title}><div className={styles.formStack}><Alert message="Capability dan contract Backend belum tersedia, sehingga penyimpanan dinonaktifkan. Tidak ada success palsu." title="Mutation Belum Tersedia" variant="neutral" /><form className={styles.form} onSubmit={handleSubmit}><div className={styles.formGrid}>{fields.map((field) => <FormField htmlFor={`property-form-${field.name}`} key={field.name} label={field.label}>{field.type === "textarea" ? <textarea id={`property-form-${field.name}`} placeholder={field.placeholder ?? "—"} /> : <input id={`property-form-${field.name}`} placeholder={field.placeholder ?? "—"} type={field.type ?? "text"} />}</FormField>)}</div>{submitted ? <p className={styles.formFeedback} role="status">Perubahan belum disimpan karena capability belum tersedia.</p> : null}<div className={styles.actionBar}><Button onClick={onClose} type="button" variant="ghost">Batal</Button><Button disabled onClick={() => setSubmitted(false)} type="submit" variant="primary">{submitLabel}</Button></div></form></div></Drawer>;
}

export function PropertyExtractionReviewDrawer({ onClose, open, title = "Review Dokumen Property" }: Readonly<{ onClose: () => void; open: boolean; title?: string }>) {
  return <Drawer description="Dokumen → Ekstraksi → Kandidat → Telaah Manusia → Draft → Verifikasi → Persetujuan bila material → Aktif." onClose={onClose} open={open} title={title}><div className={styles.extractionGrid}><section className={styles.extractionPanel}><h3>Source / Dokumen</h3><PropertyUnavailableState description="Dokumen dan layanan ekstraksi belum tersedia." /></section><section className={styles.extractionPanel}><h3>Kolom Kandidat</h3><div className={styles.candidateUnavailable} role="status"><strong>Belum ada kandidat ekstraksi.</strong><span>Hasil pembacaan dokumen akan tampil setelah layanan ekstraksi tersedia.</span></div></section></div></Drawer>;
}
