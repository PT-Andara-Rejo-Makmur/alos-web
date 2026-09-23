import type {
  SalesAgentSupportItem,
  SalesCadenceItem,
  SalesChannelAttributionItem,
  SalesDailyControlItem,
  SalesDashboardSnapshot,
  SalesFunnelStage,
  SalesMetricItem,
  SalesSourceReadinessItem,
} from "./types";

/**
 * 5 primary data readiness indicators for Sales & Marketing.
 * Strictly source-honest: no mock data or false active states.
 */
export const DEFAULT_SALES_READINESS: readonly SalesSourceReadinessItem[] = [
  { key: "LEADS", label: "Leads Source", state: "NOT_CONNECTED" },
  { key: "CRM", label: "CRM Pipeline", state: "NOT_CONNECTED" },
  { key: "WHATSAPP", label: "WhatsApp Business", state: "NOT_CONNECTED" },
  { key: "BOOKING", label: "Booking Register", state: "NOT_CONNECTED" },
  { key: "ATTRIBUTION", label: "Attribution Engine", state: "NOT_CONNECTED" },
];

/**
 * 4 KPI Metrics reflecting operational CRM and growth control.
 * Absent data displays "—" with honest status context.
 */
export const DEFAULT_SALES_METRICS: readonly SalesMetricItem[] = [
  {
    id: "valid_leads",
    label: "Valid Leads (Bulan ini)",
    value: "—",
    helper: "Sumber data CRM belum terhubung",
    state: "NOT_CONNECTED",
  },
  {
    id: "response_sla",
    label: "Response SLA (< 15 menit)",
    value: "—",
    helper: "Tracking respon WA belum aktif",
    state: "NOT_CONNECTED",
  },
  {
    id: "site_visits",
    label: "Site Visits (Bulan ini)",
    value: "—",
    helper: "Log kunjungan belum terhubung",
    state: "NOT_CONNECTED",
  },
  {
    id: "booking_conv",
    label: "Booking Conversion",
    value: "—",
    helper: "Data booking belum terhubung",
    state: "NOT_CONNECTED",
  },
];

/**
 * 5-stage Lead-to-Cash funnel skeleton.
 * In accordance with WF-03, booking does NOT auto-close and requires Finance/Legal handoff.
 */
export const DEFAULT_SALES_FUNNEL: readonly SalesFunnelStage[] = [
  { stage: "lead", label: "Lead Masuk", count: null, conversionRate: null },
  { stage: "qualified", label: "Terkualifikasi", count: null, conversionRate: null },
  { stage: "visit", label: "Site Visit", count: null, conversionRate: null },
  { stage: "booking", label: "Reservasi / Booking", count: null, conversionRate: null },
  { stage: "closing", label: "Akad & Closing", count: null, conversionRate: null },
];

/**
 * Daily control metrics for Response & Follow-up.
 */
export const DEFAULT_DAILY_CONTROL: readonly SalesDailyControlItem[] = [
  { id: "new_leads", label: "Prospek Baru Hari Ini", value: "—", target: "SLA < 15 mnt", state: "NOT_CONNECTED" },
  { id: "fast_response", label: "Respon Cepat (<15m)", value: "—", target: "Target 100%", state: "NOT_CONNECTED" },
  { id: "scheduled_followup", label: "Follow-up Terjadwal", value: "—", target: "Hari ini", state: "NOT_CONNECTED" },
  { id: "stale_leads", label: "Stale Leads (>48j)", value: "—", target: "Maks 0", state: "NOT_CONNECTED" },
];

/**
 * Marketing Channel Attribution channels.
 */
export const DEFAULT_CHANNEL_ATTRIBUTION: readonly SalesChannelAttributionItem[] = [
  { channelId: "paid_ads", channelName: "Paid Ads (Meta / Google)", leadShare: null, qualityScore: null },
  { channelId: "walk_in", channelName: "Walk-in & Spanduk", leadShare: null, qualityScore: null },
  { channelId: "referral", channelName: "Referral & Broker Agent", leadShare: null, qualityScore: null },
  { channelId: "organic", channelName: "Organic & Website", leadShare: null, qualityScore: null },
];

/**
 * Operational Control Cadence table (6 rows across Daily, Weekly, Monthly).
 */
export const DEFAULT_SALES_CADENCE: readonly SalesCadenceItem[] = [
  {
    frequency: "Harian",
    controlId: "SM-D-01",
    controlName: "Response time <15 menit WA",
    workEvidence: "Log interaksi CRM / WA",
    readinessStatus: "NOT_CONNECTED",
  },
  {
    frequency: "Harian",
    controlId: "SM-D-02",
    controlName: "Follow-up prospek stale >48j",
    workEvidence: "Antrean reminder & eskalasi",
    readinessStatus: "NOT_CONNECTED",
  },
  {
    frequency: "Harian",
    controlId: "SM-D-03",
    controlName: "Log site visit harian",
    workEvidence: "Foto geolokasi & notulen visit",
    readinessStatus: "NOT_CONNECTED",
  },
  {
    frequency: "Mingguan",
    controlId: "SM-W-01",
    controlName: "Funnel conversion review",
    workEvidence: "Laporan pipeline mingguan",
    readinessStatus: "NOT_CONNECTED",
  },
  {
    frequency: "Mingguan",
    controlId: "SM-W-02",
    controlName: "Channel spend vs lead quality",
    workEvidence: "Rekonsiliasi ad-spend & valid leads",
    readinessStatus: "NOT_CONNECTED",
  },
  {
    frequency: "Bulanan",
    controlId: "SM-M-01",
    controlName: "Booking to closing audit & handover",
    workEvidence: "Berita acara booking & verifikasi Finance/Legal",
    readinessStatus: "NOT_CONNECTED",
  },
];

/**
 * AI Agents supporting Sales & Marketing.
 * Strictly labeled "Target capability" until canonical agent runtime is connected.
 */
export const DEFAULT_SALES_AGENTS: readonly SalesAgentSupportItem[] = [
  {
    agentId: "ALOS-AGT-007",
    roleName: "Sales Lead Engine",
    taskDescription: "Kualifikasi, scoring, dedup, dan routing prospek otomatis",
    status: "Target capability",
  },
  {
    agentId: "ALOS-AGT-008",
    roleName: "Marketing Content Engine",
    taskDescription: "Draft materi kampanye & kepatuhan klaim properti",
    status: "Target capability",
  },
  {
    agentId: "ALOS-AGT-009",
    roleName: "CRM & Follow-up Orchestrator",
    taskDescription: "Prioritas antrean kontak & eskalasi stale leads",
    status: "Target capability",
  },
  {
    agentId: "ALOS-AGT-005",
    roleName: "KPI & Attribution Monitor",
    taskDescription: "Analisis ROI kanal & monitoring integritas funnel",
    status: "Target capability",
  },
];

/**
 * Creates default zero-fabrication Sales Dashboard snapshot.
 */
export function createDefaultSalesSnapshot(): SalesDashboardSnapshot {
  return {
    readiness: DEFAULT_SALES_READINESS,
    metrics: DEFAULT_SALES_METRICS,
    funnel: DEFAULT_SALES_FUNNEL,
    dailyControl: DEFAULT_DAILY_CONTROL,
    channelAttribution: DEFAULT_CHANNEL_ATTRIBUTION,
    cadence: DEFAULT_SALES_CADENCE,
    agents: DEFAULT_SALES_AGENTS,
  };
}

/**
 * UU PDP Privacy Helper: Masks customer identifiers (e.g. phone or email)
 * to prevent leaking PII on screen or in exports.
 */
export function maskCustomerIdentifier(identifier: string): string {
  if (!identifier) return "—";
  if (identifier.includes("@")) {
    const [local, domain] = identifier.split("@");
    if (!local || !domain) return "***";
    const maskedLocal = local.length > 2 ? `${local.slice(0, 2)}***` : "***";
    return `${maskedLocal}@${domain}`;
  }
  // Phone or NIK masking
  if (identifier.length > 6) {
    return `${identifier.slice(0, 3)}****${identifier.slice(-3)}`;
  }
  return "***";
}
