import type {
  GenesisSummaryItem,
  ItCadenceItem,
  ItDashboardSnapshot,
  ItSourceReadinessItem,
  OperationStatusRow,
  ReleaseControlRow,
  SystemDeliveryRow,
} from "./types";

export const DEFAULT_IT_READINESS: readonly ItSourceReadinessItem[] = [
  { key: "GENESIS", label: "GENESIS", sourceState: "PARTIAL", sourceContext: "Permukaan kontrol frontend tersedia; integrasi Backend belum terhubung" },
  { key: "GOVERNANCE", label: "Tata Kelola", sourceState: "PARTIAL", sourceContext: "Route tata kelola tersedia; sumber operasional belum terhubung" },
  { key: "MONITORING", label: "Monitoring", sourceState: "NOT_CONNECTED", sourceContext: "Sumber telemetri Backend belum tersedia" },
  { key: "BACKUP", label: "Backup", sourceState: "NOT_CONNECTED", sourceContext: "Sumber bukti backup belum tersedia" },
  { key: "SECURITY", label: "Keamanan", sourceState: "NOT_CONNECTED", sourceContext: "Sumber telemetri keamanan belum tersedia" },
];

export const DEFAULT_SYSTEMS: readonly SystemDeliveryRow[] = [
  { id: "web_app", system: "Web App", source: "Repositori saat ini", runtime: "Tidak diketahui", telemetry: "Tanpa telemetri", context: "Source tersedia; kesehatan runtime tidak diproyeksikan" },
  { id: "backend_api", system: "Backend API", source: "Repositori tersedia", runtime: "Tidak diketahui", telemetry: "Belum terhubung", context: "Sumber runtime Backend belum terhubung" },
  { id: "contracts", system: "Contracts", source: "Repositori tersedia", runtime: "Tidak berlaku", telemetry: "Tanpa telemetri", context: "Hanya menunjukkan keberadaan source contract" },
  { id: "infrastructure", system: "Infrastruktur", source: "Repositori tersedia", runtime: "Tidak diketahui", telemetry: "Belum terhubung", context: "Sumber runtime infrastruktur belum terhubung" },
];

export const DEFAULT_OPERATIONS: readonly OperationStatusRow[] = [
  { id: "monitoring", operation: "Monitoring", state: "NOT_CONNECTED", source: "Telemetri Backend", description: "Kesehatan layanan dan sinyal belum tersedia" },
  { id: "incidents", operation: "Incidents", state: "NOT_CONNECTED", source: "Sistem incident", description: "Sumber incident belum terhubung" },
  { id: "backup", operation: "Backup", state: "NOT_CONNECTED", source: "Laporan backup", description: "Bukti backup dan restore belum tersedia" },
  { id: "security", operation: "Security", state: "NOT_CONNECTED", source: "Telemetri keamanan", description: "Status kesehatan keamanan belum dapat dinyatakan" },
];

export const DEFAULT_RELEASE_CONTROLS: readonly ReleaseControlRow[] = [
  { id: "release_requests", control: "Permintaan rilis", state: "PARTIAL", evidence: "Route kontrol tersedia", source: "Proyeksi frontend" },
  { id: "uat_evidence", control: "Bukti UAT", state: "PARTIAL", evidence: "Route tata kelola tersedia", source: "Proyeksi frontend" },
  { id: "rollback_proof", control: "Bukti rollback", state: "NOT_CONNECTED", evidence: "Belum tersedia", source: "Tanpa sumber operasional" },
  { id: "fourteen_day_monitoring", control: "Monitoring 14 hari", state: "NOT_CONNECTED", evidence: "Belum tersedia", source: "Tanpa sumber telemetri" },
];

export const DEFAULT_IT_CADENCE: readonly ItCadenceItem[] = [
  { frequency: "Harian", controlId: "IT-D-01", controlName: "Ketersediaan sistem", workEvidence: "Log monitoring", readinessStatus: "NOT_CONNECTED", targetCapability: "GENESIS Supervisor" },
  { frequency: "Harian", controlId: "IT-D-02", controlName: "Respons incident kritis", workEvidence: "Log incident", readinessStatus: "NOT_CONNECTED", targetCapability: "GENESIS Repair System" },
  { frequency: "Mingguan", controlId: "IT-W-01", controlName: "Keberhasilan backup", workEvidence: "Laporan backup", readinessStatus: "NOT_CONNECTED", targetCapability: "GENESIS Release & Rollback" },
  { frequency: "Mingguan", controlId: "IT-W-02", controlName: "Kualitas data & rekonsiliasi", workEvidence: "Rangkaian bukti", readinessStatus: "PARTIAL", targetCapability: "GN-06.1 Evidence Chain Verifier" },
  { frequency: "Bulanan", controlId: "IT-M-01/02/03", controlName: "UAT / akses / keamanan", workEvidence: "Bukti tata kelola", readinessStatus: "PARTIAL", targetCapability: "Release Manager + Governance Engine" },
  { frequency: "Bulanan", controlId: "IT-M-04", controlName: "Uji restore", workEvidence: "Bukti restore", readinessStatus: "NOT_CONNECTED", targetCapability: "GENESIS Release & Rollback" },
];

export const DEFAULT_GENESIS_SUMMARY: readonly GenesisSummaryItem[] = [
  { id: "control-plane", title: "Control Plane", description: "Operasi AI teknis dan kontrol kapabilitas", moduleKey: "control-plane", href: "/workspace/it/genesis" },
  { id: "agents", title: "Agents", description: "Registri agen dan batas eksekusi", moduleKey: "agents", href: "/workspace/it/genesis/agents" },
  { id: "research", title: "Research", description: "Tata kelola riset dan kontrol sumber", moduleKey: "research", href: "/workspace/it/genesis/research" },
  { id: "governance", title: "Tata Kelola", description: "Bukti, gate, dan keputusan operasional", moduleKey: "governance", href: "/workspace/it/governance" },
];

export function createDefaultItSnapshot(): ItDashboardSnapshot {
  return {
    readiness: DEFAULT_IT_READINESS,
    systems: DEFAULT_SYSTEMS,
    operations: DEFAULT_OPERATIONS,
    releaseControls: DEFAULT_RELEASE_CONTROLS,
    cadence: DEFAULT_IT_CADENCE,
    genesisSummary: DEFAULT_GENESIS_SUMMARY,
  };
}

export function sanitizeItClientContext<T extends Record<string, unknown>>(data: T): Partial<T> {
  const sanitized = { ...data };
  const sensitiveKeys = ["token", "secret", "apikey", "password", "credential", "privatekey", "githubtoken", "pat", "bearer"];

  for (const key of Object.keys(sanitized)) {
    if (sensitiveKeys.some((sensitiveKey) => key.toLowerCase().includes(sensitiveKey))) delete sanitized[key];
  }

  return sanitized;
}

export function checkMakerCheckerConflict(makerActorId: string, reviewerActorId: string): boolean {
  if (!makerActorId || !reviewerActorId) return false;
  return makerActorId === reviewerActorId;
}
