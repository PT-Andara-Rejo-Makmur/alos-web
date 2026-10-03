import Link from "next/link";
import { Status } from "@/components/ui";
import { businessMetricValue, readableValue, statusLabel } from "@/lib/presentation";
import styles from "@/components/ui/work-surface.module.css";
const fields = [
  ["certificate_number", "Nomor Sertifikat Pembayaran"], ["change_number", "Nomor Perubahan Pekerjaan"], ["contract_number", "Nomor Kontrak"],
  ["position_title", "Posisi yang dibutuhkan"], ["department_code", "Divisi"],
  ["employment_type", "Jenis hubungan kerja"], ["headcount", "Jumlah tenaga kerja"],
  ["reason", "Dasar kebutuhan"], ["description", "Uraian pengajuan"],
  ["amount_delta", "Perubahan nilai"], ["schedule_impact_days", "Perubahan jadwal (hari)"],
  ["amount", "Nilai pengajuan"], ["period", "Periode"], ["booking_date", "Tanggal booking"],
  ["full_name", "Nama karyawan"], ["employee_number", "Nomor karyawan"],
  ["start_date", "Tanggal mulai"], ["end_date", "Tanggal berakhir"],
  ["target_completion_date", "Target selesai"], ["need", "Kebutuhan bisnis"],
  ["goal", "Tujuan"], ["business_context", "Konteks bisnis"],
] as const;

export function ProcessPacket({ packet, workspaceKey }: Readonly<{ packet: Record<string, unknown>; workspaceKey?: string }>) {
  const document=packet.document && typeof packet.document==="object" ? packet.document as Record<string,unknown> : null;
  const employee=packet.employee && typeof packet.employee==="object" ? packet.employee as Record<string,unknown> : null;
  const facts = fields.flatMap(([key, label]) => {
    const value = packet[key] ?? employee?.[key];
    if (typeof value !== "string" && typeof value !== "number") return [];
    if (value === "") return [];
    const display = key === "employment_type" ? statusLabel(String(value)) : ["amount","amount_delta"].includes(key) ? businessMetricValue({value,unit:"AMOUNT",available:true,source:null,code:key,label}) : readableValue(value);
    return [{ key, label, display }];
  });
  if (!facts.length && !document) return null;
  return <><dl className={styles.facts} aria-label="Informasi pengajuan">{facts.map(fact => <div key={fact.key}>
    <dt>{fact.label}</dt><dd>{fact.display}</dd>
  </div>)}</dl>{document ? <section><h3>Dokumen Pendukung</h3><p>Versi {readableValue(document.current_version)} · <Status label={String(document.status ?? "")} /></p><p>Diperbarui {readableValue(document.updated_at)}</p>{workspaceKey && typeof document.document_id==="string" ? <Link href={`/workspace/${encodeURIComponent(workspaceKey)}/documents/${encodeURIComponent(document.document_id)}`}>Buka Dokumen →</Link> : null}</section> : null}</>;
}
