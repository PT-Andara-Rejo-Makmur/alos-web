"use client";

import { useState, type FormEvent, type ReactNode } from "react";

import {
  Alert,
  Button,
  Drawer,
  EmptyState,
  FormField,
  Status,
} from "@/components/ui";

import styles from "../sales.module.css";

export interface SalesFormField {
  readonly label: string;
  readonly name: string;
  readonly placeholder?: string;
  readonly type?: "date" | "email" | "number" | "text" | "textarea";
}

export interface SalesDetailItem {
  readonly label: string;
  readonly value: string;
}

export function SalesUnavailableState({
  description = "Sumber authoritative belum terhubung. Data tidak dibuat atau disimpulkan oleh antarmuka.",
  title = "Belum Terhubung",
}: Readonly<{ description?: string; title?: string }>) {
  return (
    <div className={styles.sourceState} role="status">
      <Status label="Belum Terhubung" variant="neutral" />
      <EmptyState description={description} title={title} />
    </div>
  );
}

export function SalesConnectedEmptyState({ description }: Readonly<{ description: string }>) {
  return <EmptyState description={description} title="Belum ada data" />;
}

export function SalesSourceNote({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className={styles.pipelineSourceNote}>
      <Status label="Belum Terhubung" variant="neutral" />
      <span>{children}</span>
    </div>
  );
}

export function SalesActionBar({ children }: Readonly<{ children: ReactNode }>) {
  return <div className={styles.salesActionBar}>{children}</div>;
}

export function SalesFilterBar({
  ariaLabel = "Filter data Sales",
  children,
  search,
}: Readonly<{ ariaLabel?: string; children: ReactNode; search?: ReactNode }>) {
  return (
    <div aria-label={ariaLabel} className={styles.salesFilterBar} role="group">
      {search ? <div className={styles.salesSearch}>{search}</div> : null}
      <div className={styles.salesFilterGrid}>{children}</div>
    </div>
  );
}

export function SalesSelect({
  label,
  name,
  onChange,
  options,
  value,
}: Readonly<{
  label: string;
  name: string;
  onChange: (value: string) => void;
  options: readonly (readonly [string, string])[];
  value: string;
}>) {
  return (
    <FormField htmlFor={`sales-${name}`} label={label}>
      <select id={`sales-${name}`} onChange={(event) => onChange(event.target.value)} value={value}>
        {options.map(([optionValue, optionLabel]) => <option key={optionValue} value={optionValue}>{optionLabel}</option>)}
      </select>
    </FormField>
  );
}

export function SalesDetailDrawer({
  children,
  description = "Detail hanya menampilkan data authoritative yang telah tersedia.",
  items,
  onClose,
  open,
  title,
}: Readonly<{
  children?: ReactNode;
  description?: string;
  items: readonly SalesDetailItem[];
  onClose: () => void;
  open: boolean;
  title: string;
}>) {
  return (
    <Drawer description={description} onClose={onClose} open={open} title={title}>
      <dl className={styles.quickViewList}>
        {items.map((item) => <SalesDetailItemView item={item} key={item.label} />)}
      </dl>
      {children ? <div className={styles.formActions}>{children}</div> : null}
    </Drawer>
  );
}

function SalesDetailItemView({ item }: Readonly<{ item: SalesDetailItem }>) {
  return <><dt>{item.label}</dt><dd>{item.value}</dd></>;
}

export function SalesUnavailableFormDrawer({
  description,
  fields,
  onClose,
  open,
  submitLabel = "Simpan",
  title,
}: Readonly<{
  description: string;
  fields: readonly SalesFormField[];
  onClose: () => void;
  open: boolean;
  submitLabel?: string;
  title: string;
}>) {
  const [submitted, setSubmitted] = useState(false);
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <Drawer description={description} onClose={onClose} open={open} title={title}>
      <div className={styles.formStack}>
        <Alert
          message="Form ini adalah struktur UX. Capability dan contract Backend belum tersedia, sehingga penyimpanan dinonaktifkan. Tidak ada success palsu."
          title="Mutation Belum Tersedia"
          variant="neutral"
        />
        <form className={styles.salesForm} onSubmit={handleSubmit}>
          <div className={styles.formGrid}>
            {fields.map((field) => (
              <FormField htmlFor={`sales-form-${field.name}`} key={field.name} label={field.label}>
                {field.type === "textarea" ? (
                  <textarea id={`sales-form-${field.name}`} placeholder={field.placeholder ?? "—"} />
                ) : (
                  <input id={`sales-form-${field.name}`} placeholder={field.placeholder ?? "—"} type={field.type ?? "text"} />
                )}
              </FormField>
            ))}
          </div>
          {submitted ? <p className={styles.formFeedback} role="status">Perubahan belum disimpan karena capability belum tersedia.</p> : null}
          <div className={styles.formActions}>
            <Button onClick={onClose} type="button" variant="ghost">Batal</Button>
            <Button disabled onClick={() => setSubmitted(false)} type="submit" variant="primary">{submitLabel}</Button>
          </div>
        </form>
      </div>
    </Drawer>
  );
}

export function SalesExtractionReviewDrawer({
  onClose,
  open,
  title = "Review Dokumen & Candidate Fields",
}: Readonly<{ onClose: () => void; open: boolean; title?: string }>) {
  return (
    <Drawer
      description="Alur dokumen mengikuti Document → Extraction → Candidate Fields → Human Review → Draft → Verification."
      onClose={onClose}
      open={open}
      title={title}
    >
      <div className={styles.extractionGrid}>
        <section className={styles.extractionPanel}>
          <h3>Source / Dokumen</h3>
          <SalesUnavailableState description="Dokumen dan extraction source belum tersedia." />
        </section>
        <section className={styles.extractionPanel}>
          <h3>Candidate Fields</h3>
          <div className={styles.candidateList}>
            {[
              ["Nama / Subjek", "—"],
              ["Kontak", "—"],
              ["Project / Unit", "—"],
              ["Tanggal", "—"],
            ].map(([label, value]) => (
              <div className={styles.candidateRow} key={label}>
                <div><strong>{label}</strong><span>{value}</span></div>
                <Status label="Perlu Diperiksa" variant="neutral" />
                <div className={styles.candidateActions}>
                  <Button disabled size="sm" variant="secondary">Terima</Button>
                  <Button disabled size="sm" variant="ghost">Edit</Button>
                  <Button disabled size="sm" variant="ghost">Abaikan</Button>
                </div>
              </div>
            ))}
          </div>
          <Button disabled variant="primary">Simpan Draft</Button>
        </section>
      </div>
    </Drawer>
  );
}
