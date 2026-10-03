"use client";

import { useState } from "react";
import styles from "./ui.module.css";

export function EntitySelect({ id, label, value, options, onChange, disabled, required, emptyLabel = "Pilih", ...accessibility }: Readonly<{
  id?: string; label: string; value: string; options: readonly { value: string; label: string }[];
  onChange: (value: string) => void; disabled?: boolean; required?: boolean; emptyLabel?: string;
  "aria-describedby"?: string; "aria-invalid"?: boolean; "aria-required"?: boolean; className?: string;
}>) {
  const [search, setSearch] = useState("");
  const visible = options.filter(option => option.value === value || option.label.toLocaleLowerCase("id-ID").includes(search.toLocaleLowerCase("id-ID")));
  return <div className={styles.entitySelect}>
    {options.length > 8 ? <input type="search" className="alos-form-control" aria-label={`Cari ${label}`} placeholder={`Cari ${label.toLocaleLowerCase("id-ID")}…`} value={search} disabled={disabled} onChange={event => setSearch(event.target.value)} /> : null}
    <select {...accessibility} id={id} className="alos-form-control" value={value} disabled={disabled} required={required} onChange={event => onChange(event.target.value)}>
      <option value="">{emptyLabel}</option>{visible.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
    </select>
    {search && visible.length === 0 ? <span role="status">Tidak ada pilihan yang sesuai.</span> : null}
  </div>;
}
