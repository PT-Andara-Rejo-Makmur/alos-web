import type {
  WorkspaceNavAvailability,
  WorkspaceNavBlockReason,
} from "./types";

export interface ModuleReadinessDescriptor {
  readonly availability: WorkspaceNavAvailability;
  readonly blockReason?: WorkspaceNavBlockReason;
}

/**
 * Centralized UI/Integration Readiness Matrix.
 * Indicates whether a route has minimal working frontend + backend integration.
 * BLOCKED modules remain visible in navigation for roadmap transparency, but are non-navigable and labeled "Belum tersedia".
 */
export const MODULE_READINESS_MATRIX: Record<string, ModuleReadinessDescriptor> = {
  // Shared modules
  projects: { availability: "BLOCKED", blockReason: "BACKEND_NOT_CONNECTED" },
  tasks: { availability: "BLOCKED", blockReason: "BACKEND_NOT_CONNECTED" },
  approvals: { availability: "BLOCKED", blockReason: "BACKEND_NOT_CONNECTED" },
  documents: { availability: "BLOCKED", blockReason: "BACKEND_NOT_CONNECTED" },
  reports: { availability: "BLOCKED", blockReason: "BACKEND_NOT_CONNECTED" },
  findings: { availability: "BLOCKED", blockReason: "BACKEND_NOT_CONNECTED" },
  ara: { availability: "BLOCKED", blockReason: "BACKEND_NOT_CONNECTED" },
  agents: { availability: "BLOCKED", blockReason: "BACKEND_NOT_CONNECTED" },
  overview: { availability: "BLOCKED", blockReason: "BACKEND_NOT_CONNECTED" },
  brief: { availability: "BLOCKED", blockReason: "BACKEND_NOT_CONNECTED" },
  divisions: { availability: "BLOCKED", blockReason: "BACKEND_NOT_CONNECTED" },
  governance: { availability: "BLOCKED", blockReason: "BACKEND_NOT_CONNECTED" },

  // Property Domain Modules
  milestones: { availability: "BLOCKED", blockReason: "MODULE_NOT_IMPLEMENTED" },
  construction: { availability: "BLOCKED", blockReason: "BACKEND_NOT_CONNECTED" },
  quality: { availability: "BLOCKED", blockReason: "CONTRACT_PENDING" },
  k3: { availability: "BLOCKED", blockReason: "CONTRACT_PENDING" },
  "change-orders": { availability: "BLOCKED", blockReason: "MODULE_NOT_IMPLEMENTED" },
  "payment-certs": { availability: "BLOCKED", blockReason: "MODULE_NOT_IMPLEMENTED" },
  handover: { availability: "BLOCKED", blockReason: "MODULE_NOT_IMPLEMENTED" },
  "land-pipeline": { availability: "BLOCKED", blockReason: "BACKEND_NOT_CONNECTED" },

  // Finance Domain Modules
  cash: { availability: "BLOCKED", blockReason: "BACKEND_NOT_CONNECTED" },
  receivables: { availability: "BLOCKED", blockReason: "BACKEND_NOT_CONNECTED" },
  payables: { availability: "BLOCKED", blockReason: "BACKEND_NOT_CONNECTED" },
  budget: { availability: "BLOCKED", blockReason: "BACKEND_NOT_CONNECTED" },
  reconciliation: { availability: "BLOCKED", blockReason: "BACKEND_NOT_CONNECTED" },
  tax: { availability: "BLOCKED", blockReason: "CONTRACT_PENDING" },
  close: { availability: "BLOCKED", blockReason: "CONTRACT_PENDING" },

  // HR Domain Modules
  employees: { availability: "BLOCKED", blockReason: "BACKEND_NOT_CONNECTED" },
  attendance: { availability: "BLOCKED", blockReason: "BACKEND_NOT_CONNECTED" },
  leave: { availability: "BLOCKED", blockReason: "BACKEND_NOT_CONNECTED" },
  recruitment: { availability: "BLOCKED", blockReason: "BACKEND_NOT_CONNECTED" },
  onboarding: { availability: "BLOCKED", blockReason: "BACKEND_NOT_CONNECTED" },
  performance: { availability: "BLOCKED", blockReason: "CONTRACT_PENDING" },
  training: { availability: "BLOCKED", blockReason: "MODULE_NOT_IMPLEMENTED" },
  succession: { availability: "BLOCKED", blockReason: "MODULE_NOT_IMPLEMENTED" },
  grievances: { availability: "BLOCKED", blockReason: "CONTRACT_PENDING" },
  contracts: { availability: "BLOCKED", blockReason: "CONTRACT_PENDING" },
  "personnel-files": { availability: "BLOCKED", blockReason: "CONTRACT_PENDING" },

  // Legal Domain Modules
  permits: { availability: "BLOCKED", blockReason: "BACKEND_NOT_CONNECTED" },
  litigation: { availability: "BLOCKED", blockReason: "BACKEND_NOT_CONNECTED" },
  corporate: { availability: "BLOCKED", blockReason: "BACKEND_NOT_CONNECTED" },
  "land-documents": { availability: "BLOCKED", blockReason: "BACKEND_NOT_CONNECTED" },
  "due-diligence": { availability: "BLOCKED", blockReason: "MODULE_NOT_IMPLEMENTED" },
  cases: { availability: "BLOCKED", blockReason: "BACKEND_NOT_CONNECTED" },
  expiry: { availability: "BLOCKED", blockReason: "MODULE_NOT_IMPLEMENTED" },
  claims: { availability: "BLOCKED", blockReason: "CONTRACT_PENDING" },
  privacy: { availability: "BLOCKED", blockReason: "CONTRACT_PENDING" },
  risk: { availability: "BLOCKED", blockReason: "CONTRACT_PENDING" },
  compliance: { availability: "BLOCKED", blockReason: "CONTRACT_PENDING" },

  // Sales Domain Modules
  leads: { availability: "BLOCKED", blockReason: "BACKEND_NOT_CONNECTED" },
  pipeline: { availability: "BLOCKED", blockReason: "BACKEND_NOT_CONNECTED" },
  visits: { availability: "BLOCKED", blockReason: "BACKEND_NOT_CONNECTED" },
  bookings: { availability: "BLOCKED", blockReason: "CONTRACT_PENDING" },
  closings: { availability: "BLOCKED", blockReason: "CONTRACT_PENDING" },
  campaigns: { availability: "BLOCKED", blockReason: "MODULE_NOT_IMPLEMENTED" },
  channels: { availability: "BLOCKED", blockReason: "MODULE_NOT_IMPLEMENTED" },
  attribution: { availability: "BLOCKED", blockReason: "MODULE_NOT_IMPLEMENTED" },
  content: { availability: "BLOCKED", blockReason: "MODULE_NOT_IMPLEMENTED" },
  "follow-up": { availability: "BLOCKED", blockReason: "MODULE_NOT_IMPLEMENTED" },
  complaints: { availability: "BLOCKED", blockReason: "MODULE_NOT_IMPLEMENTED" },
  crm: { availability: "BLOCKED", blockReason: "BACKEND_NOT_CONNECTED" },
  inventory: { availability: "BLOCKED", blockReason: "BACKEND_NOT_CONNECTED" },
  pricing: { availability: "BLOCKED", blockReason: "CONTRACT_PENDING" },
  collateral: { availability: "BLOCKED", blockReason: "MODULE_NOT_IMPLEMENTED" },

  // IT Domain Modules
  systems: { availability: "BLOCKED", blockReason: "BACKEND_NOT_CONNECTED" },
  integrations: { availability: "BLOCKED", blockReason: "BACKEND_NOT_CONNECTED" },
  database: { availability: "BLOCKED", blockReason: "BACKEND_NOT_CONNECTED" },
  environments: { availability: "BLOCKED", blockReason: "BACKEND_NOT_CONNECTED" },
  repositories: { availability: "BLOCKED", blockReason: "BACKEND_NOT_CONNECTED" },
  cicd: { availability: "BLOCKED", blockReason: "BACKEND_NOT_CONNECTED" },
  releases: { availability: "BLOCKED", blockReason: "MODULE_NOT_IMPLEMENTED" },
  "tech-debt": { availability: "BLOCKED", blockReason: "MODULE_NOT_IMPLEMENTED" },
  monitoring: { availability: "BLOCKED", blockReason: "BACKEND_NOT_CONNECTED" },
  infrastructure: { availability: "BLOCKED", blockReason: "BACKEND_NOT_CONNECTED" },
  security: { availability: "BLOCKED", blockReason: "BACKEND_NOT_CONNECTED" },
  backup: { availability: "BLOCKED", blockReason: "BACKEND_NOT_CONNECTED" },
  backups: { availability: "BLOCKED", blockReason: "BACKEND_NOT_CONNECTED" },
  incidents: { availability: "BLOCKED", blockReason: "BACKEND_NOT_CONNECTED" },
  "audit-trail": { availability: "BLOCKED", blockReason: "BACKEND_NOT_CONNECTED" },
  "disaster-recovery": { availability: "BLOCKED", blockReason: "BACKEND_NOT_CONNECTED" },
  credentials: { availability: "BLOCKED", blockReason: "BACKEND_NOT_CONNECTED" },
  skills: { availability: "BLOCKED", blockReason: "MODULE_NOT_IMPLEMENTED" },
  models: { availability: "BLOCKED", blockReason: "MODULE_NOT_IMPLEMENTED" },
  uat: { availability: "BLOCKED", blockReason: "MODULE_NOT_IMPLEMENTED" },
  research: { availability: "BLOCKED", blockReason: "BACKEND_NOT_CONNECTED" },
  evidence: { availability: "BLOCKED", blockReason: "BACKEND_NOT_CONNECTED" },
  decisions: { availability: "BLOCKED", blockReason: "BACKEND_NOT_CONNECTED" },
  "control-plane": { availability: "BLOCKED", blockReason: "BACKEND_NOT_CONNECTED" },
};

/**
 * Returns the readiness descriptor for a module key.
 * Default is BLOCKED if unknown.
 */
export function getModuleReadiness(moduleKey: string): ModuleReadinessDescriptor {
  return MODULE_READINESS_MATRIX[moduleKey] ?? {
    availability: "BLOCKED",
    blockReason: "MODULE_NOT_IMPLEMENTED",
  };
}
