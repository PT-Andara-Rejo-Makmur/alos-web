"use client";
import { useEffect, useState } from "react";
import { Alert, LoadingState, Section, Status } from "@/components/ui";
import { apiMessage, authenticatedApiRequest } from "@/lib/api";
import type { BusinessRelationshipOverview } from "@/lib/contracts";
import { readableValue, statusLabel } from "@/lib/presentation";
import type { Resource } from "./resource";
import styles from "@/components/ui/work-surface.module.css";

const relationshipTypes: Readonly<Record<string,string>> = {
  "property/payment_certificates": "PROPERTY_PAYMENT_CERTIFICATE", "property/change_orders": "PROPERTY_CHANGE_ORDER",
  "finance/payables": "FINANCE_PAYABLE", "finance/payable_payments": "FINANCE_PAYABLE_PAYMENT", "finance/bank_transactions": "FINANCE_BANK_TRANSACTION",
  "legal/contracts": "LEGAL_CONTRACT", "sales/bookings": "SALES_BOOKING", "sales/closings": "SALES_CLOSING",
  "hr/employees": "HR_EMPLOYEE", "hr/onboardings": "HR_ONBOARDING", "hr/employment_contracts": "HR_EMPLOYMENT_CONTRACT",
};
const relationshipNames: Readonly<Record<string,string>> = {
  PROPERTY_PAYMENT_CERTIFICATE: "Sertifikat Pembayaran", PROPERTY_CHANGE_ORDER: "Perubahan Pekerjaan",
  FINANCE_PAYABLE: "Utang", FINANCE_PAYABLE_PAYMENT: "Pembayaran Utang", FINANCE_BANK_TRANSACTION: "Transaksi Bank",
  LEGAL_CONTRACT: "Kontrak", SALES_BOOKING: "Booking", SALES_CLOSING: "Closing", HR_EMPLOYEE: "Karyawan",
  HR_ONBOARDING: "Persiapan Karyawan Baru", HR_EMPLOYMENT_CONTRACT: "Perjanjian Kerja",
};

/** Relationship projection provides lineage, never permission to read a foreign record. */
export function BusinessRecordContext({ resource, identity, record }: Readonly<{resource: Resource; identity: string; record: Readonly<Record<string,unknown>>}>) {
  const type = relationshipTypes[`${resource.domain}/${resource.key}`];
  const [links, setLinks] = useState<BusinessRelationshipOverview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [names, setNames] = useState<readonly {label:string; name:string}[]>([]);
  useEffect(() => {
    const controller = new AbortController();
    if (type) void authenticatedApiRequest<BusinessRelationshipOverview>(`/api/v1/business/relationships/${type}/${encodeURIComponent(identity)}`, {signal:controller.signal})
      .then(result => {if (!controller.signal.aborted) {if(!Array.isArray(result?.items)) throw new Error("Hubungan pekerjaan belum dapat dibaca."); setLinks(result);}})
      .catch(caught => {if(!controller.signal.aborted) setError(apiMessage(caught));});
    const fields = [...resource.columns, ...resource.createFields].filter((field,index,all) => field.relation && !field.relation.multiple && record[field.name] && all.findIndex(item => item.name === field.name) === index).slice(0,8);
    void Promise.all(fields.map(async field => {
      const relation=field.relation!;
      if (relation.dependsOn || relation.identifier === "version") return {label:field.label,name:"Lihat sumber dokumen untuk rincian versi"};
      try {
        const result=await authenticatedApiRequest<Record<string,unknown>>(`${relation.path}/${encodeURIComponent(String(record[field.name]))}`,{signal:controller.signal});
        const name=String(result.name ?? result.title ?? result.unit_code ?? result.employee_number ?? result[relation.label] ?? "");
        return {label:field.label,name:name && name !== String(record[field.name]) ? readableValue(name) : "Nama belum tersedia"};
      } catch {return {label:field.label,name:"Rincian belum dapat dibaca dalam ruang kerja ini"};}
    })).then(result => {if(!controller.signal.aborted) setNames(result);});
    return () => controller.abort();
  }, [resource, identity, type, record]);
  const financing = resource.key === "financing_contexts";
  const nextAction=typeof record.next_action==="string" ? record.next_action : null;
  return <>
    {names.length ? <Section title="Pihak dan Pekerjaan Terkait"><dl className={styles.facts}>{names.map(item => <div key={item.label}><dt>{item.label}</dt><dd>{item.name}</dd></div>)}</dl></Section> : null}
    {financing ? <Section title="Perjalanan KPR dan Akad"><ol className={styles.timeline}>
      <li><strong>Skema Pembayaran</strong><p>{statusLabel(String(record.payment_method ?? ""))}</p></li>
      <li><strong>Dokumen Pendukung</strong><p>{typeof record.required_document_notes === "string" ? record.required_document_notes : "Kebutuhan dokumen belum dicatat."}</p></li>
      <li><strong>SP3K</strong><p>{record.sp3k_reference ? readableValue(record.sp3k_reference) : "Belum tercatat"}{record.sp3k_on ? ` · ${readableValue(record.sp3k_on)}` : ""}</p></li>
      <li><strong>Akad</strong><p>{record.akad_on ? readableValue(record.akad_on) : "Tanggal pelaksanaan belum tercatat"}</p></li>
    </ol>{nextAction ? <p><strong>Tindakan Berikutnya</strong> · {nextAction}</p> : null}</Section> : null}
    {["candidates","recruitments","onboardings","employees"].includes(resource.key) ? <Section title="Tindak Lanjut Karyawan"><Status label={String(record.status ?? "")} /><p>{nextAction ?? "Gunakan pemeriksaan dan tindakan yang tersedia pada pengajuan ini."}</p></Section> : null}
    {type ? <Section title="Asal dan Tindak Lanjut">{error ? <Alert variant="warning" message={error} /> : !links ? <LoadingState label="Memuat hubungan pekerjaan…" /> : links.items.length ? <ul className={styles.workList}>{links.items.map(link => { const other=link.source_type===type&&link.source_id===identity?link.target_type:link.source_type;return <li className={styles.workRow} key={link.link_id}><div><h3>{relationshipNames[other] ?? "Catatan perusahaan terkait"}</h3><p>Tercatat {new Date(link.created_at).toLocaleDateString("id-ID")}</p></div></li>;})}</ul> : <p>Belum ada hubungan pekerjaan yang tercatat.</p>}</Section> : null}
  </>;
}
