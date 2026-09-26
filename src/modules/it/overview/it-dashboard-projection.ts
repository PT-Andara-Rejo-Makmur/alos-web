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
  { key: "GENESIS", label: "GENESIS", state: "PARTIAL", context: "Frontend control surfaces present; backend integration not connected" },
  { key: "GOVERNANCE", label: "Governance", state: "PARTIAL", context: "Governance routes present; operational sources not connected" },
  { key: "MONITORING", label: "Monitoring", state: "NOT_CONNECTED", context: "Backend telemetry source unavailable" },
  { key: "BACKUP", label: "Backup", state: "NOT_CONNECTED", context: "Backup evidence source unavailable" },
  { key: "SECURITY", label: "Security", state: "NOT_CONNECTED", context: "Security telemetry source unavailable" },
];

export const DEFAULT_SYSTEMS: readonly SystemDeliveryRow[] = [
  { id: "web_app", system: "Web App", source: "Current repository", runtime: "Unknown", telemetry: "No telemetry", context: "Source is present; runtime health is not projected" },
  { id: "backend_api", system: "Backend API", source: "Repository exists", runtime: "Unknown", telemetry: "Not connected", context: "No backend runtime source connected" },
  { id: "contracts", system: "Contracts", source: "Repository exists", runtime: "Not applicable", telemetry: "No telemetry", context: "Source contract presence only" },
  { id: "infrastructure", system: "Infrastructure", source: "Repository exists", runtime: "Unknown", telemetry: "Not connected", context: "No infrastructure runtime source connected" },
];

export const DEFAULT_OPERATIONS: readonly OperationStatusRow[] = [
  { id: "monitoring", operation: "Monitoring", state: "NOT_CONNECTED", source: "Backend telemetry", description: "Service health and signals are unavailable" },
  { id: "incidents", operation: "Incidents", state: "NOT_CONNECTED", source: "Incident system", description: "No incident source is connected" },
  { id: "backup", operation: "Backup", state: "NOT_CONNECTED", source: "Backup reports", description: "Backup and restore evidence are unavailable" },
  { id: "security", operation: "Security", state: "NOT_CONNECTED", source: "Security telemetry", description: "No security health claim can be made" },
];

export const DEFAULT_RELEASE_CONTROLS: readonly ReleaseControlRow[] = [
  { id: "release_requests", control: "Release requests", state: "PARTIAL", evidence: "Control route present", source: "Frontend projection" },
  { id: "uat_evidence", control: "UAT evidence", state: "PARTIAL", evidence: "Governance route present", source: "Frontend projection" },
  { id: "rollback_proof", control: "Rollback proof", state: "NOT_CONNECTED", evidence: "Unavailable", source: "No operational source" },
  { id: "fourteen_day_monitoring", control: "14-day monitoring", state: "NOT_CONNECTED", evidence: "Unavailable", source: "No telemetry source" },
];

export const DEFAULT_IT_CADENCE: readonly ItCadenceItem[] = [
  { frequency: "Daily", controlId: "IT-D-01", controlName: "System availability", workEvidence: "Monitoring log", readinessStatus: "NOT_CONNECTED", targetCapability: "GENESIS Supervisor" },
  { frequency: "Daily", controlId: "IT-D-02", controlName: "Critical incident response", workEvidence: "Incident log", readinessStatus: "NOT_CONNECTED", targetCapability: "GENESIS Repair System" },
  { frequency: "Weekly", controlId: "IT-W-01", controlName: "Backup success", workEvidence: "Backup report", readinessStatus: "NOT_CONNECTED", targetCapability: "GENESIS Release & Rollback" },
  { frequency: "Weekly", controlId: "IT-W-02", controlName: "Data quality & reconciliation", workEvidence: "Evidence chain", readinessStatus: "PARTIAL", targetCapability: "GN-06.1 Evidence Chain Verifier" },
  { frequency: "Monthly", controlId: "IT-M-01/02/03", controlName: "UAT / access / security", workEvidence: "Governance evidence", readinessStatus: "PARTIAL", targetCapability: "Release Manager + Governance Engine" },
  { frequency: "Monthly", controlId: "IT-M-04", controlName: "Restore drill", workEvidence: "Restore evidence", readinessStatus: "NOT_CONNECTED", targetCapability: "GENESIS Release & Rollback" },
];

export const DEFAULT_GENESIS_SUMMARY: readonly GenesisSummaryItem[] = [
  { id: "control-plane", title: "Control Plane", description: "Technical AI operations and capability controls", moduleKey: "control-plane", href: "/workspace/it/genesis" },
  { id: "agents", title: "Agents", description: "Agent registry and execution boundaries", moduleKey: "agents", href: "/workspace/it/genesis/agents" },
  { id: "research", title: "Research", description: "Research governance and source controls", moduleKey: "research", href: "/workspace/it/genesis/research" },
  { id: "governance", title: "Governance", description: "Evidence, gates, and operational decisions", moduleKey: "governance", href: "/workspace/it/governance" },
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
