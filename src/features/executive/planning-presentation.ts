import { statusLabel } from "@/lib/presentation";

export function materialityLabel(val: string): string {
  return statusLabel(val);
}

export function assumptionCategoryLabel(cat: string): string {
  const map: Record<string, string> = {
    AVERAGE_SELLING_PRICE: "Harga Jual Rata-rata",
    CONVERSION_RATIO: "Rasio Konversi",
    EXPECTED_CPL: "Perkiraan CPL",
    AVAILABLE_INVENTORY: "Inventaris Tersedia",
    MARKETING_BUDGET: "Anggaran Pemasaran",
    TEAM_CAPACITY: "Kapasitas Tim",
    CUSTOM: "Khusus",
  };
  return map[cat] ?? statusLabel(cat);
}

export function formatDate(value: string | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}
