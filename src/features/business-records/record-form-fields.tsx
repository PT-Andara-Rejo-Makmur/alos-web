"use client";

import { EntitySelect, FormField, FormSection } from "@/components/ui";
import { statusLabel } from "@/lib/presentation";
import type { Field } from "./resource";

export function RecordFormFields({ fields, mode, values, options, change, busy, loading, relationErrors }: Readonly<{
  fields: readonly Field[]; mode: "create" | "update"; values: Readonly<Record<string, string>>;
  options: Readonly<Record<string, readonly { value: string; label: string }[]>>;
  change: (name: string, value: string) => void; busy: boolean; loading: boolean; relationErrors: readonly string[];
}>) {
  function group(field: Field): string {
    if (/evidence|document|source|classification|attachment/.test(field.name)) return "Informasi Pendukung";
    if (/owner|assignee|employee|workspace|department|project|customer|candidate|contractor/.test(field.name)) return "Pihak Terkait";
    if (/date|_at|amount|value|period|quantity|budget|cost|days|rate/.test(field.name)) return "Jadwal & Nilai";
    return "Data Pengajuan";
  }
  const groups = ["Data Pengajuan", "Pihak Terkait", "Jadwal & Nilai", "Informasi Pendukung"];
  return <>{groups.map(title => {
    const selected = fields.filter(field => group(field) === title);
    if (!selected.length) return null;
    return <FormSection key={title} title={title}>{selected.map(field => {
      const required = field.required || (mode === "update" && !field.nullable);
      const id = `record-${field.name}`;
      const disabled = busy || !!(field.relation && (loading || relationErrors.includes(field.name) || (field.relation.dependsOn && !values[field.relation.dependsOn])));
      const choices = field.relation ? options[field.name] ?? [] : field.options?.map(value => ({ value, label: field.optionLabels?.[value] ?? statusLabel(value) })) ?? [];
      return <FormField key={field.name} label={field.label} htmlFor={id} required={required} description={field.type === "decimal" ? "Gunakan titik untuk angka desimal, misalnya 1250000.50." : undefined}>
        {field.type === "boolean" ? <select id={id} value={values[field.name] || "false"} disabled={busy} onChange={event => change(field.name, event.target.value)}><option value="false">Tidak</option><option value="true">Ya</option></select>
          : field.relation?.multiple ? <select id={id} multiple value={JSON.parse(values[field.name] || "[]") as string[]} required={required} disabled={disabled} onChange={event => change(field.name, JSON.stringify(Array.from(event.target.selectedOptions, option => option.value).filter(Boolean)))}>{choices.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
            : field.relation || field.options ? <EntitySelect id={id} label={field.label} value={values[field.name] ?? ""} options={choices} required={required} disabled={disabled} emptyLabel={`Pilih ${field.label.toLocaleLowerCase("id-ID")}`} onChange={value => change(field.name, value)} />
              : <input id={id} type={field.type === "integer" ? "number" : field.type === "decimal" ? "text" : field.type} inputMode={field.type === "decimal" ? "decimal" : undefined} required={required} value={values[field.name] ?? ""} disabled={busy} onChange={event => change(field.name, event.target.value)} />}
      </FormField>;
    })}</FormSection>;
  })}</>;
}
