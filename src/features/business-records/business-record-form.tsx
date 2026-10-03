"use client";
import type { ComponentProps, FormEvent } from "react";
import { Button, FormJourney } from "@/components/ui";
import { readableValue } from "@/lib/presentation";
import { RecordFormFields } from "./record-form-fields";
import type { Resource } from "./resource";
import styles from "@/components/ui/work-surface.module.css";

const journeys: Readonly<Record<string, readonly [string,RegExp][]>> = {
  "sales/financing_contexts": [["Booking dan Pembayaran", /booking|payment/], ["Bank dan Dokumen", /bank|document/], ["SP3K dan Akad", /./]],
  "sales/bookings": [["Pelanggan dan Unit", /customer|opportunity|unit|project/], ["Rencana Booking", /date|amount|deposit|payment/], ["Informasi Pendukung", /./]],
  "property/change_orders": [["Perubahan Pekerjaan", /code|title|description|reason/], ["Proyek dan Kontrak", /project|contract|package/], ["Dampak dan Bukti", /./]],
  "property/payment_certificates": [["Pekerjaan yang Diperiksa", /project|package|contract|code|number/], ["Periode dan Nilai", /period|progress|amount|value|date/], ["Dokumen Pendukung", /./]],
  "finance/payables": [["Penerima dan Asal Utang", /supplier|vendor|party|origin|source|contract|certificate|project/], ["Nilai dan Jadwal Pembayaran", /./]],
  "finance/payable_payments": [["Utang yang Dibayar", /payable|bank|account|reference/], ["Pembayaran", /./]],
  "legal/contracts": [["Perjanjian", /number|code|title|name|type|description/], ["Pihak dan Masa Berlaku", /party|project|start|end|date|amount|value/], ["Dokumen dan Pemeriksaan", /./]],
  "hr/recruitments": [["Kebutuhan Tenaga Kerja", /position|headcount|reason|description/], ["Divisi dan Waktu", /workspace|department|opened|closed|date/], ["Pemeriksaan Pendukung", /./]],
  "hr/candidates": [["Pelamar", /full_name|email|phone|name/], ["Posisi yang Dilamar", /recruitment|position/], ["Catatan Seleksi", /./]],
  "hr/onboardings": [["Karyawan dan Rencana", /employee|start|target|date/], ["Kesiapan Kerja", /./]],
  "hr/employment_contracts": [["Karyawan dan Perjanjian", /employee|contract_number|contract_type/], ["Masa Berlaku", /date|start|end/], ["Dokumen dan Pemeriksaan", /./]],
  "it/releases": [["Versi dan Lingkungan", /version|repository|environment|name|title/], ["CI dan Pemeriksaan", /ci_|review|test/], ["Deployment dan Pemulihan", /./]],
};
type FieldsProps = ComponentProps<typeof RecordFormFields>;
export function BusinessRecordForm({ resource, onSubmit, onCancel, disabled, feedback, ...props }: FieldsProps & Readonly<{resource:Resource;onSubmit:(event:FormEvent<HTMLFormElement>)=>void;onCancel:()=>void;disabled:boolean;feedback:React.ReactNode}>) {
  const journey=journeys[`${resource.domain}/${resource.key}`];
  if (!journey) return <form className={styles.stack} onSubmit={onSubmit}><RecordFormFields {...props} />{feedback}<div className={styles.actions}><Button type="button" variant="ghost" disabled={props.busy} onClick={onCancel}>Batal</Button><Button type="submit" disabled={disabled} loading={props.busy}>Simpan</Button></div></form>;
  const grouped=journey.map(([title,pattern],index)=>({title,fields:props.fields.filter(field=>pattern.test(field.name)&&!journey.slice(0,index).some(([,prior])=>prior.test(field.name)))})).filter(item=>item.fields.length);
  return <FormJourney busy={props.busy} disabled={disabled} onSubmit={onSubmit} onCancel={onCancel} feedback={feedback} steps={[
    ...grouped.map(item=>({title:item.title,content:<RecordFormFields {...props} fields={item.fields} />})),
    {title:"Tinjau",content:<dl className={styles.facts}>{props.fields.filter(field=>props.values[field.name]).map(field=><div key={field.name}><dt>{field.label}</dt><dd>{field.relation ? (props.options[field.name]??[]).filter(item=>field.relation?.multiple ? (JSON.parse(props.values[field.name]||"[]") as string[]).includes(item.value) : item.value===props.values[field.name]).map(item=>item.label).join(", ")||"Belum dipilih" : readableValue(props.values[field.name])}</dd></div>)}</dl>},
  ]} />;
}
