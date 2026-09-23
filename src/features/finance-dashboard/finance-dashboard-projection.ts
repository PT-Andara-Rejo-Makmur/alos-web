import type {
  FinanceAgentSupportItem,
  FinanceCadenceItem,
  FinanceDashboardMetric,
  FinanceDashboardSnapshot,
  FinanceSourceReadiness,
} from "./types";

/**
 * Format metric display value.
 * STRICT ZERO-FABRICATION RULE:
 * If value is null, return "—", NEVER return "0" or "Rp 0".
 */
export function formatFinanceMetricValue(metric: FinanceDashboardMetric): string {
  if (metric.value === null) {
    return "—";
  }
  const num = Number(metric.value.amount);
  if (Number.isNaN(num)) {
    return "—";
  }
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: metric.value.currency || "IDR",
    maximumFractionDigits: 0,
  }).format(num);
}

export const DEFAULT_SOURCE_READINESS: readonly FinanceSourceReadiness[] = [
  {
    key: "ledger",
    label: "Ledger",
    state: "NOT_CONNECTED",
    stateLabel: "Not connected",
    description: "Sumber transaksi buku besar belum terhubung.",
  },
  {
    key: "bank",
    label: "Bank",
    state: "NOT_CONNECTED",
    stateLabel: "Not connected",
    description: "Feed mutasi dan rekening koran belum terhubung.",
  },
  {
    key: "aging",
    label: "Aging",
    state: "NOT_CONNECTED",
    stateLabel: "Not connected",
    description: "Laporan umur piutang & utang belum terintegrasi.",
  },
  {
    key: "budget",
    label: "Budget",
    state: "NOT_CONNECTED",
    stateLabel: "Not connected",
    description: "Perbandingan anggaran operasional belum terhubung.",
  },
  {
    key: "tax",
    label: "Tax",
    state: "NOT_CONNECTED",
    stateLabel: "Not connected",
    description: "Jadwal dan bukti pelaporan pajak belum terhubung.",
  },
];

export const DEFAULT_FINANCE_METRICS: readonly FinanceDashboardMetric[] = [
  {
    key: "cash_position",
    label: "Cash Position",
    mobileLabel: "Cash",
    value: null,
    state: "NOT_CONNECTED",
    context: "Ledger/bank belum terhubung",
  },
  {
    key: "receivables",
    label: "Receivables",
    mobileLabel: "Receivables",
    value: null,
    state: "NOT_CONNECTED",
    context: "Aging belum terhubung",
  },
  {
    key: "payables",
    label: "Payables",
    mobileLabel: "Payables",
    value: null,
    state: "NOT_CONNECTED",
    context: "Aging belum terhubung",
  },
  {
    key: "budget_variance",
    label: "Budget Variance",
    mobileLabel: "Budget Var.",
    value: null,
    state: "NOT_CONNECTED",
    context: "Budget aktual belum terhubung",
  },
];

export const DEFAULT_CONTROL_CADENCE: readonly FinanceCadenceItem[] = [
  {
    code: "FIN-D-01",
    frequency: "HARIAN",
    frequencyLabel: "Harian",
    name: "Verifikasi transaksi",
    target: "100% sebelum akhir hari",
    evidence: "Ledger",
    supportingAgent: "ALOS-AGT-010",
    state: "NOT_CONNECTED",
    stateLabel: "Belum terhubung",
    displayValue: "—",
  },
  {
    code: "FIN-D-02",
    frequency: "HARIAN",
    frequencyLabel: "Harian",
    name: "Rekonsiliasi bank",
    target: "Harian",
    evidence: "Bank vs ledger",
    supportingAgent: "ALOS-AGT-010",
    state: "NOT_CONNECTED",
    stateLabel: "Belum terhubung",
    displayValue: "—",
  },
  {
    code: "FIN-W-01",
    frequency: "MINGGUAN",
    frequencyLabel: "Mingguan",
    name: "Arus kas 13 minggu",
    target: "100% mingguan",
    evidence: "Cashflow 13 minggu",
    supportingAgent: "ALOS-AGT-011",
    state: "NOT_CONNECTED",
    stateLabel: "Belum terhubung",
    displayValue: "—",
  },
  {
    code: "FIN-W-02",
    frequency: "MINGGUAN",
    frequencyLabel: "Mingguan",
    name: "Aging piutang & utang",
    target: "100%",
    evidence: "Aging report",
    supportingAgent: "ALOS-AGT-010",
    state: "NOT_CONNECTED",
    stateLabel: "Belum terhubung",
    displayValue: "—",
  },
  {
    code: "FIN-W-03",
    frequency: "MINGGUAN",
    frequencyLabel: "Mingguan",
    name: "Varians anggaran",
    target: "Mingguan",
    evidence: "Budget vs actual",
    supportingAgent: "ALOS-AGT-011 + GN-02.1",
    state: "NOT_CONNECTED",
    stateLabel: "Belum terhubung",
    displayValue: "—",
  },
  {
    code: "FIN-M-01",
    frequency: "BULANAN",
    frequencyLabel: "Bulanan",
    name: "Pajak & tutup buku",
    target: "100% tepat waktu",
    evidence: "Bukti lapor / P&L",
    supportingAgent: "ALOS-AGT-012",
    state: "NOT_CONNECTED",
    stateLabel: "Belum terhubung",
    displayValue: "—",
  },
  {
    code: "FIN-M-02",
    frequency: "BULANAN",
    frequencyLabel: "Bulanan",
    name: "Tutup buku laba rugi",
    target: "Bulanan",
    evidence: "Penutupan laba rugi",
    supportingAgent: "ALOS-AGT-011",
    state: "NOT_CONNECTED",
    stateLabel: "Belum terhubung",
    displayValue: "—",
  },
  {
    code: "FIN-M-03",
    frequency: "BULANAN",
    frequencyLabel: "Bulanan",
    name: "Penggajian & jaminan sosial",
    target: "100%",
    evidence: "Laporan penggajian",
    supportingAgent: "ALOS-AGT-012 + HR",
    state: "NOT_CONNECTED",
    stateLabel: "Belum terhubung",
    displayValue: "—",
  },
  {
    code: "FIN-M-04",
    frequency: "BULANAN",
    frequencyLabel: "Bulanan",
    name: "Sertifikat pembayaran",
    target: "100%",
    evidence: "Sertifikat & SPK",
    supportingAgent: "ALOS-AGT-006",
    state: "NOT_CONNECTED",
    stateLabel: "Belum terhubung",
    displayValue: "—",
  },
];

export const DEFAULT_AGENT_SUPPORT: readonly FinanceAgentSupportItem[] = [
  {
    code: "ALOS-AGT-010",
    name: "Reconciliation",
    role: "Pencocokan mutasi bank dengan entri buku besar dan deteksi selisih.",
    status: "Target capability",
  },
  {
    code: "ALOS-AGT-011",
    name: "Budget & Cashflow",
    role: "Penyusunan proyeksi arus kas 13 minggu dan analisis deviasi anggaran.",
    status: "Target capability",
  },
  {
    code: "ALOS-AGT-012",
    name: "Tax & Invoice",
    role: "Verifikasi dokumen faktur pajak dan kesiapan bukti lapor SPT.",
    status: "Target capability",
  },
  {
    code: "ALOS-AGT-006",
    name: "Approval & RACI",
    role: "Penyusunan paket verifikasi persetujuan pengeluaran material.",
    status: "Target capability",
  },
];

export const DEFAULT_FINANCE_SNAPSHOT: FinanceDashboardSnapshot = {
  generated_at: "2026-09-22T08:00:00.000Z",
  workspace_id: "ws_finance_holding",
  workspace_name: "Finance Workspace",
  source_readiness: DEFAULT_SOURCE_READINESS,
  metrics: DEFAULT_FINANCE_METRICS,
  control_cadence: DEFAULT_CONTROL_CADENCE,
  agent_support: DEFAULT_AGENT_SUPPORT,
};
