const employmentTypes: Record<string, string> = {
  PERMANENT: "Tetap", CONTRACT: "Kontrak", INTERNSHIP: "Magang", FREELANCE: "Lepas",
};
const fields = [
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

export function ProcessPacket({ packet }: Readonly<{ packet: Record<string, unknown> }>) {
  const facts = fields.flatMap(([key, label]) => {
    const value = packet[key];
    if (typeof value !== "string" && typeof value !== "number") return [];
    if (value === "") return [];
    const display = key === "employment_type" ? employmentTypes[String(value)] ?? "Belum dikenali" : String(value);
    return [{ key, label, display }];
  });
  if (!facts.length) return null;
  return <dl aria-label="Informasi pengajuan">{facts.map(fact => <div key={fact.key}>
    <dt>{fact.label}</dt><dd>{fact.display}</dd>
  </div>)}</dl>;
}
