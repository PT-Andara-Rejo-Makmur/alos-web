import type {
  HrAgentSupportItem,
  HrAttendanceCapacityItem,
  HrCadenceItem,
  HrDashboardSnapshot,
  HrDevelopmentItem,
  HrEmployeeRelationsItem,
  HrMetricItem,
  HrSourceReadinessItem,
} from "./types";

/**
 * 5 primary data readiness indicators for HR & People.
 * Strictly source-honest: no fake employee records or active states.
 */
export const DEFAULT_HR_READINESS: readonly HrSourceReadinessItem[] = [
  { key: "EMPLOYEES", label: "Employees", state: "NOT_CONNECTED" },
  { key: "ATTENDANCE", label: "Attendance", state: "NOT_CONNECTED" },
  { key: "TRAINING", label: "Training", state: "NOT_CONNECTED" },
  { key: "CONTRACTS", label: "Contracts", state: "NOT_CONNECTED" },
  { key: "PERFORMANCE", label: "Performance", state: "NOT_CONNECTED" },
];

/**
 * 4 Aggregate KPI Metrics for HR & People Operations.
 * Absent data displays "—" with honest status context.
 */
export const DEFAULT_HR_METRICS: readonly HrMetricItem[] = [
  {
    id: "employees",
    label: "Employees",
    value: "—",
    helper: "Employee master belum terhubung",
    state: "NOT_CONNECTED",
  },
  {
    id: "attendance_today",
    label: "Attendance Today",
    value: "—",
    helper: "Attendance belum terhubung",
    state: "NOT_CONNECTED",
  },
  {
    id: "training_due",
    label: "Training Due",
    value: "—",
    helper: "Training source belum terhubung",
    state: "NOT_CONNECTED",
  },
  {
    id: "contracts_bpjs",
    label: "Contract / BPJS",
    value: "—",
    helper: "Personnel file belum terhubung",
    state: "NOT_CONNECTED",
  },
];

/**
 * People Operations panel items (Attendance, Leave, Capacity).
 */
export const DEFAULT_ATTENDANCE_CAPACITY: readonly HrAttendanceCapacityItem[] = [
  { id: "present", label: "Present", value: "—" },
  { id: "leave", label: "Leave", value: "—" },
  { id: "missing", label: "Missing attendance", value: "—" },
  { id: "critical_backup", label: "Critical role backup", value: "—" },
];

/**
 * Development panel items (Performance, Training, Improvement).
 */
export const DEFAULT_DEVELOPMENT: readonly HrDevelopmentItem[] = [
  { id: "performance_reviews", label: "Performance reviews", value: "—" },
  { id: "training_participation", label: "Training participation", value: "—" },
  { id: "roleplay_participation", label: "Role-play participation", value: "—" },
  { id: "improvement_actions", label: "Improvement actions", value: "—" },
];

/**
 * Employee Relations panel items (Grievance, Expiry, Access requests).
 * Confidential data remains aggregate-first; no grievance texts exposed on home.
 */
export const DEFAULT_EMPLOYEE_RELATIONS: readonly HrEmployeeRelationsItem[] = [
  { id: "grievances", label: "Grievances", value: "—" },
  { id: "expiring_files", label: "Expiring files", value: "—" },
  { id: "access_requests", label: "Access requests", value: "—" },
  { id: "confidential_scope", label: "Confidential HR data remains scoped.", value: "—" },
];

/**
 * Operational Control Cadence table (6 rows across Daily, Weekly, Monthly).
 * Note: HR-D-02 (Penutupan tugas) is PARTIAL because ALOS has active task tracking.
 */
export const DEFAULT_HR_CADENCE: readonly HrCadenceItem[] = [
  {
    frequency: "Harian",
    controlId: "HR-D-01",
    controlName: "Kehadiran",
    workEvidence: "Attendance data",
    readinessStatus: "NOT_CONNECTED",
  },
  {
    frequency: "Harian",
    controlId: "HR-D-02",
    controlName: "Penutupan tugas",
    workEvidence: "Task log",
    readinessStatus: "PARTIAL",
  },
  {
    frequency: "Mingguan",
    controlId: "HR-W-01",
    controlName: "Pelatihan & role-play",
    workEvidence: "Training attendance",
    readinessStatus: "NOT_CONNECTED",
  },
  {
    frequency: "Mingguan",
    controlId: "HR-W-02",
    controlName: "Penerimaan pengaduan",
    workEvidence: "Grievance register",
    readinessStatus: "NOT_CONNECTED",
  },
  {
    frequency: "Bulanan",
    controlId: "HR-M-01",
    controlName: "Kontrak & jaminan sosial",
    workEvidence: "Personnel file",
    readinessStatus: "NOT_CONNECTED",
  },
  {
    frequency: "Bulanan",
    controlId: "HR-M-02/03",
    controlName: "Review kinerja / backup role",
    workEvidence: "Review + backup register",
    readinessStatus: "NOT_CONNECTED",
  },
];

/**
 * AI Agents supporting HR & People Operations.
 * Strictly labeled "Target capability" until canonical agent runtime is connected.
 */
export const DEFAULT_HR_AGENTS: readonly HrAgentSupportItem[] = [
  {
    agentId: "ALOS-AGT-013",
    roleName: "Recruitment & Attendance",
    taskDescription: "Rekrutmen, onboarding, absensi, reminder training",
    status: "Target capability",
  },
  {
    agentId: "ALOS-AGT-014",
    roleName: "Personnel File",
    taskDescription: "Berkas personalia, masa berlaku berkas, izin akses, kontrol PII",
    status: "Target capability",
  },
  {
    agentId: "ALOS-AGT-005",
    roleName: "KPI & Performance",
    taskDescription: "Monitoring KPI kepegawaian & kelengkapan review berkala",
    status: "Target capability",
  },
  {
    agentId: "GN-01.1",
    roleName: "Capacity / Span of Control",
    taskDescription: "Analisis beban kerja & optimasi span-of-control tim",
    status: "Target capability",
  },
];

/**
 * Creates default zero-fabrication HR Dashboard snapshot.
 */
export function createDefaultHrSnapshot(): HrDashboardSnapshot {
  return {
    readiness: DEFAULT_HR_READINESS,
    metrics: DEFAULT_HR_METRICS,
    attendanceCapacity: DEFAULT_ATTENDANCE_CAPACITY,
    development: DEFAULT_DEVELOPMENT,
    employeeRelations: DEFAULT_EMPLOYEE_RELATIONS,
    cadence: DEFAULT_HR_CADENCE,
    agents: DEFAULT_HR_AGENTS,
  };
}

/**
 * UU PDP Privacy Helper: Masks employee identifiers (NIK, Phone, Email)
 * to prevent leaking PII on screen or in exports.
 */
export function maskEmployeeIdentifier(identifier: string): string {
  if (!identifier) return "—";
  if (identifier.includes("@")) {
    const [local, domain] = identifier.split("@");
    if (!local || !domain) return "***";
    const maskedLocal = local.length > 2 ? `${local.slice(0, 2)}***` : "***";
    return `${maskedLocal}@${domain}`;
  }
  // Phone or NIK masking (16 digits for NIK or 10-13 for phone)
  if (identifier.length > 6) {
    return `${identifier.slice(0, 3)}****${identifier.slice(-3)}`;
  }
  return "***";
}
