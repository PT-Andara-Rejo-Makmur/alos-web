import type {
  GenesisControlPlaneItem,
  ItCadenceItem,
  ItDashboardSnapshot,
  ItMetricItem,
  ItSourceReadinessItem,
  PlatformDeliveryRow,
  ReleaseChangeRow,
  SecurityAccessRow,
} from "./types";

/**
 * 5 primary data readiness indicators for IT & Technology.
 * Reflects that GENESIS & Governance exist in ALOS (PARTIAL),
 * while operational infrastructure telemetry is NOT_CONNECTED.
 */
export const DEFAULT_IT_READINESS: readonly ItSourceReadinessItem[] = [
  {
    key: "GENESIS",
    label: "GENESIS",
    state: "PARTIAL",
    context: "Control plane aktif di repository",
  },
  {
    key: "GOVERNANCE",
    label: "Governance",
    state: "PARTIAL",
    context: "Model policy & audit portal aktif",
  },
  {
    key: "MONITORING",
    label: "Monitoring",
    state: "NOT_CONNECTED",
    context: "Telemetry source belum terhubung",
  },
  {
    key: "BACKUP",
    label: "Backup",
    state: "NOT_CONNECTED",
    context: "Backup report belum terhubung",
  },
  {
    key: "SECURITY",
    label: "Security",
    state: "NOT_CONNECTED",
    context: "Security log belum terhubung",
  },
];

/**
 * 4 Operational KPI Metrics for IT Leadership.
 * Missing sources display "—" with honest status context.
 * No mock 99.9%, 0 incidents, or 100% backup.
 */
export const DEFAULT_IT_METRICS: readonly ItMetricItem[] = [
  {
    id: "system_availability",
    label: "System Availability",
    value: "—",
    helper: "Monitoring source belum terhubung",
    state: "NOT_CONNECTED",
  },
  {
    id: "critical_incidents",
    label: "Critical Incidents",
    value: "—",
    helper: "Incident source belum terhubung",
    state: "NOT_CONNECTED",
  },
  {
    id: "backup_success",
    label: "Backup Success",
    value: "—",
    helper: "Backup report belum terhubung",
    state: "NOT_CONNECTED",
  },
  {
    id: "uat_pass_rate",
    label: "UAT Pass Rate",
    value: "—",
    helper: "Release/UAT aggregate belum tersedia",
    state: "NOT_CONNECTED",
  },
];

/**
 * ALOS Platform & Delivery Panel Items.
 * Clearly separates repository existence from runtime health.
 */
export const DEFAULT_PLATFORM_DELIVERY: readonly PlatformDeliveryRow[] = [
  {
    id: "web_app",
    name: "Web App",
    repoStatus: "Current repo",
    healthBadge: "Available",
    healthState: "AVAILABLE",
  },
  {
    id: "backend_api",
    name: "Backend API",
    repoStatus: "Current repo",
    healthBadge: "Available",
    healthState: "AVAILABLE",
  },
  {
    id: "contracts",
    name: "Contracts",
    repoStatus: "Current repo",
    healthBadge: "Available",
    healthState: "AVAILABLE",
  },
  {
    id: "infrastructure",
    name: "Infrastructure",
    repoStatus: "Repository exists",
    healthBadge: "Needs telemetry",
    healthState: "NEEDS_TELEMETRY",
  },
];

/**
 * Release & Change Panel Items.
 * Connects with existing release-requests and governance workflows.
 */
export const DEFAULT_RELEASE_CHANGE: readonly ReleaseChangeRow[] = [
  {
    id: "release_requests",
    label: "Release requests",
    status: "Existing control",
    state: "PARTIAL",
  },
  {
    id: "uat_evidence",
    label: "UAT evidence",
    status: "Existing/partial",
    state: "PARTIAL",
  },
  {
    id: "rollback_proof",
    label: "Rollback proof",
    status: "Not connected",
    state: "NOT_CONNECTED",
  },
  {
    id: "fourteen_day_monitoring",
    label: "14-day monitoring",
    status: "Not connected",
    state: "NOT_CONNECTED",
  },
];

/**
 * Security & Access Control Panel Items.
 * Unknown sources render "—" without assuming zero incidents.
 */
export const DEFAULT_SECURITY_ACCESS: readonly SecurityAccessRow[] = [
  { id: "critical_incidents", label: "Critical incidents", value: "—" },
  { id: "access_review", label: "Access review", value: "—" },
  { id: "tenant_isolation", label: "Tenant isolation", value: "—" },
  { id: "permission_audit", label: "Permission audit", value: "—" },
];

/**
 * IT Control Cadence Table (6 rows covering Daily, Weekly, Monthly).
 * IT-W-02 and IT-M-01/02/03 are PARTIAL because ALOS has active evidence & model governance.
 */
export const DEFAULT_IT_CADENCE: readonly ItCadenceItem[] = [
  {
    frequency: "Harian",
    controlId: "IT-D-01",
    controlName: "System availability",
    workEvidence: "Monitoring log",
    readinessStatus: "NOT_CONNECTED",
    targetCapability: "GENESIS Supervisor",
  },
  {
    frequency: "Harian",
    controlId: "IT-D-02",
    controlName: "Critical incident response",
    workEvidence: "Incident log",
    readinessStatus: "NOT_CONNECTED",
    targetCapability: "GENESIS Repair System",
  },
  {
    frequency: "Mingguan",
    controlId: "IT-W-01",
    controlName: "Backup success",
    workEvidence: "Backup report",
    readinessStatus: "NOT_CONNECTED",
    targetCapability: "GENESIS Release & Rollback",
  },
  {
    frequency: "Mingguan",
    controlId: "IT-W-02",
    controlName: "Data quality & reconciliation",
    workEvidence: "Evidence chain",
    readinessStatus: "PARTIAL",
    targetCapability: "GN-06.1 Evidence Chain Verifier",
  },
  {
    frequency: "Bulanan",
    controlId: "IT-M-01/02/03",
    controlName: "UAT / access / security",
    workEvidence: "Governance evidence",
    readinessStatus: "PARTIAL",
    targetCapability: "GENESIS Release Manager + Governance Engine",
  },
  {
    frequency: "Bulanan",
    controlId: "IT-M-04",
    controlName: "Restore drill",
    workEvidence: "Restore evidence",
    readinessStatus: "NOT_CONNECTED",
    targetCapability: "GENESIS Release & Rollback",
  },
];

/**
 * GENESIS Control Plane summary modules linking to canonical existing pages.
 * Reuses existing /genesis, /governance, /agents routes without duplicating code.
 */
export const DEFAULT_GENESIS_OPERATIONS: readonly GenesisControlPlaneItem[] = [
  {
    id: "agent_registry",
    title: "Agent Registry",
    badge: "Existing module",
    href: "/workspace/it/genesis/agents",
  },
  {
    id: "release_requests",
    title: "Release Requests",
    badge: "Existing module",
    href: "/workspace/it/genesis",
  },
  {
    id: "workspace_sources",
    title: "Workspace Sources",
    badge: "Existing module",
    href: "/workspace/it/genesis",
  },
  {
    id: "governance_audit",
    title: "Governance & Audit",
    badge: "Existing portal",
    href: "/workspace/it/governance",
  },
];

/**
 * Creates default zero-fabrication IT Dashboard snapshot.
 */
export function createDefaultItSnapshot(): ItDashboardSnapshot {
  return {
    readiness: DEFAULT_IT_READINESS,
    metrics: DEFAULT_IT_METRICS,
    platformDelivery: DEFAULT_PLATFORM_DELIVERY,
    releaseChange: DEFAULT_RELEASE_CHANGE,
    securityAccess: DEFAULT_SECURITY_ACCESS,
    cadence: DEFAULT_IT_CADENCE,
    genesisOperations: DEFAULT_GENESIS_OPERATIONS,
  };
}

/**
 * Security & Credential Protection Helper:
 * Ensures infrastructure tokens, secrets, or API keys are never stored
 * in browser storage or logged in console.
 */
export function sanitizeItClientContext<T extends Record<string, unknown>>(data: T): Partial<T> {
  const sanitized = { ...data };
  const sensitiveKeys = [
    "token",
    "secret",
    "apikey",
    "password",
    "credential",
    "privatekey",
    "githubtoken",
    "pat",
    "bearer",
  ];

  for (const key of Object.keys(sanitized)) {
    if (sensitiveKeys.some((sKey) => key.toLowerCase().includes(sKey.toLowerCase()))) {
      delete sanitized[key];
    }
  }

  return sanitized;
}

/**
 * Maker-Checker Identity Validation:
 * Prevents the same human actor from approving their own material configuration/release.
 */
export function checkMakerCheckerConflict(makerActorId: string, reviewerActorId: string): boolean {
  if (!makerActorId || !reviewerActorId) return false;
  return makerActorId === reviewerActorId;
}
