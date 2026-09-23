import type {
  ComplianceControlRow,
  ContractReviewRow,
  LegalAgentSupportItem,
  LegalCadenceItem,
  LegalDashboardSnapshot,
  LegalMetricItem,
  LegalSourceReadinessItem,
  PermitReadinessRow,
} from "./types";

/**
 * 5 primary data readiness indicators for Legal & Compliance.
 * Strictly source-honest: no mock permits, contracts, or active statuses.
 */
export const DEFAULT_LEGAL_READINESS: readonly LegalSourceReadinessItem[] = [
  { key: "PERMITS", label: "Permits", state: "NOT_CONNECTED" },
  { key: "CONTRACTS", label: "Contracts", state: "NOT_CONNECTED" },
  { key: "LAND_DOCS", label: "Land Docs", state: "NOT_CONNECTED" },
  { key: "CLAIMS", label: "Claims", state: "NOT_CONNECTED" },
  { key: "PRIVACY", label: "Privacy", state: "NOT_CONNECTED" },
];

/**
 * 4 Aggregate KPI Metrics for Legal & Compliance Operations.
 * Missing sources display "—" with honest status context. Unknown is not zero.
 */
export const DEFAULT_LEGAL_METRICS: readonly LegalMetricItem[] = [
  {
    id: "permit_coverage",
    label: "Permit Coverage",
    value: "—",
    helper: "Permit register belum terhubung",
    state: "NOT_CONNECTED",
  },
  {
    id: "expiring_soon",
    label: "Expiring Soon",
    value: "—",
    helper: "Expiry source belum terhubung",
    state: "NOT_CONNECTED",
  },
  {
    id: "contract_review",
    label: "Contract Review",
    value: "—",
    helper: "Contract register belum terhubung",
    state: "NOT_CONNECTED",
  },
  {
    id: "critical_issues",
    label: "Critical Legal Issues",
    value: "—",
    helper: "Escalation log belum terhubung",
    state: "NOT_CONNECTED",
  },
];

/**
 * Permits & Land Panel Items.
 * Neutral skeleton rows with honest "—" values.
 */
export const DEFAULT_PERMITS_LAND: readonly PermitReadinessRow[] = [
  { id: "permit_coverage", label: "Permit coverage", value: "—" },
  { id: "due_30_days", label: "Due ≤30 days", value: "—" },
  { id: "critical_expiry", label: "Critical expiry", value: "—" },
  { id: "land_readiness", label: "Land document readiness", value: "—" },
];

/**
 * Contracts Panel Items.
 * Emphasizes human-owned signature authority.
 */
export const DEFAULT_CONTRACTS: readonly ContractReviewRow[] = [
  { id: "draft_pending", label: "Draft pending", value: "—" },
  { id: "deviation_review", label: "Deviation review", value: "—" },
  { id: "consumer_disclosure", label: "Consumer disclosure", value: "—" },
  {
    id: "signature_readiness",
    label: "Signature readiness",
    value: "—",
    note: "Signature authority is human-owned.",
  },
];

/**
 * Compliance Panel Items.
 * Reflects claim reviews, privacy, access, and regulatory alerts.
 */
export const DEFAULT_COMPLIANCE: readonly ComplianceControlRow[] = [
  { id: "marketing_claims", label: "Marketing claims", value: "—" },
  { id: "privacy_review", label: "Privacy review", value: "—" },
  { id: "access_review", label: "Access review", value: "—" },
  {
    id: "regulatory_alerts",
    label: "Regulatory alerts",
    value: "—",
    note: "No regulatory score without source.",
  },
];

/**
 * Legal Control Cadence Table (6 rows covering Daily, Weekly, Material).
 * Note: LEG-W-02 (Kelengkapan dokumen) is PARTIAL because ALOS has active document center modules.
 */
export const DEFAULT_LEGAL_CADENCE: readonly LegalCadenceItem[] = [
  {
    frequency: "Harian",
    controlId: "LEG-D-01",
    controlName: "Cakupan register izin",
    workEvidence: "Permit register",
    readinessStatus: "NOT_CONNECTED",
    targetCapability: "ALOS-AGT-015 Legal Permit",
  },
  {
    frequency: "Harian",
    controlId: "LEG-D-02",
    controlName: "Respons isu hukum kritis",
    workEvidence: "Escalation log",
    readinessStatus: "NOT_CONNECTED",
    targetCapability: "ALOS-AGT-015 + GN-04.1",
  },
  {
    frequency: "Mingguan",
    controlId: "LEG-W-01",
    controlName: "Peringatan jatuh tempo",
    workEvidence: "Reminder register",
    readinessStatus: "NOT_CONNECTED",
    targetCapability: "ALOS-AGT-015",
  },
  {
    frequency: "Mingguan",
    controlId: "LEG-W-02",
    controlName: "Kelengkapan dokumen",
    workEvidence: "Legal documents",
    readinessStatus: "PARTIAL",
    targetCapability: "ALOS-AGT-002 Document Intelligence",
  },
  {
    frequency: "Material",
    controlId: "LEG-M-01/03",
    controlName: "Persetujuan klaim / kontrak",
    workEvidence: "Claim + contract register",
    readinessStatus: "NOT_CONNECTED",
    targetCapability: "GN-09.1 + ALOS-AGT-016",
  },
  {
    frequency: "Material",
    controlId: "LEG-M-04",
    controlName: "Privasi & kendali akses",
    workEvidence: "Access review",
    readinessStatus: "NOT_CONNECTED",
    targetCapability: "GP-17.5 Data Privacy Compliance",
  },
];

/**
 * AI Agents supporting Legal & Compliance Operations.
 * Strictly labeled "Target capability" until canonical agent runtime is verified.
 */
export const DEFAULT_LEGAL_AGENTS: readonly LegalAgentSupportItem[] = [
  {
    agentId: "ALOS-AGT-015",
    roleName: "Legal Permit",
    taskDescription: "Monitor perizinan, hak tanah, checklist, dan status hold/continue.",
    status: "Target capability",
    authorityNote: "Legal authoritative owner",
  },
  {
    agentId: "ALOS-AGT-016",
    roleName: "Contract & Legal Document",
    taskDescription: "Penyusunan draft template resmi & deteksi deviasi klausul.",
    status: "Target capability",
    authorityNote: "Legal reviews & signs",
  },
  {
    agentId: "GN-04.1",
    roleName: "Regulatory Horizon",
    taskDescription: "Pemantauan regulasi baru, dampak kepatuhan, & usulan mitigasi.",
    status: "Target capability",
    authorityNote: "Analisis rekomendasi, bukan putusan hukum",
  },
  {
    agentId: "GN-09.1",
    roleName: "Claim Substantiation",
    taskDescription: "Verifikasi pembuktian klaim pemasaran properti sebelum publikasi.",
    status: "Target capability",
    authorityNote: "Gatekeeper pra-terbit klaim",
  },
];

/**
 * Creates default zero-fabrication Legal Dashboard snapshot.
 */
export function createDefaultLegalSnapshot(): LegalDashboardSnapshot {
  return {
    readiness: DEFAULT_LEGAL_READINESS,
    metrics: DEFAULT_LEGAL_METRICS,
    permitsLand: DEFAULT_PERMITS_LAND,
    contracts: DEFAULT_CONTRACTS,
    compliance: DEFAULT_COMPLIANCE,
    cadence: DEFAULT_LEGAL_CADENCE,
    agents: DEFAULT_LEGAL_AGENTS,
  };
}

/**
 * Confidentiality & Privilege Protection Helper:
 * Ensures sensitive legal opinions, litigation narratives, or customer PII
 * are never stored in client-side storage (localStorage, sessionStorage).
 */
export function sanitizeLegalClientContext<T extends Record<string, unknown>>(data: T): Partial<T> {
  const sanitized = { ...data };
  const sensitiveKeys = [
    "opinion",
    "legalOpinion",
    "litigation",
    "caseNarrative",
    "negotiationPosition",
    "confidentialClauses",
    "pii",
    "nik",
    "customerName",
    "phoneNumber",
    "privilegedCommunication",
  ];

  for (const key of Object.keys(sanitized)) {
    if (sensitiveKeys.some((sKey) => key.toLowerCase().includes(sKey.toLowerCase()))) {
      delete sanitized[key];
    }
  }

  return sanitized;
}
