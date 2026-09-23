// Dedicated governance data model and records for Governance & Agent Control
import type { ReleaseState } from "./release-governance";

export type GovernanceMetricCard = {
  key: string;
  label: string;
  value: number;
  trend: string;
  trendDir: "up" | "down";
  trendType: "good" | "bad";
  iconName: string;
};

export type LifecycleDistributionItem = {
  key: string;
  label: string;
  count: number;
  percent: number;
  color: string;
};

export type GovernanceActivity = {
  id: string;
  title: string;
  subtitle: string;
  timeAgo: string;
  iconType: "approved" | "alert" | "review" | "blocked" | "policy";
};

export type PendingHumanAction = {
  id: string;
  agentName: string;
  type: string;
  requestedBy: string;
  waitingSince: string;
  priority: "Tinggi" | "Sedang" | "Rendah";
};

export type RiskBlockerItem = {
  id: string;
  title: string;
  description: string;
  count: number;
  color: "red" | "amber" | "orange" | "yellow";
};

export type ReleaseRequestItem = {
  id: string;
  agentKey: string;
  agentName: string;
  iconName: "clock" | "users" | "settings" | "file";
  iconColor: string;
  iconBg: string;
  version: string;
  requester: string;
  status: ReleaseState;
  submitted: string;
  updated: string;
  actionLabel: "View" | "Continue" | "Release" | "Activate";
};

export type AgentDirectoryItem = {
  id: string;
  agentKey: string;
  agentName: string;
  purpose: string;
  iconName: "search_file" | "file" | "clock" | "users" | "chart";
  version: string;
  scope: string;
  risk: "LOW" | "MEDIUM" | "HIGH";
  status: "ACTIVE" | "IN_REVIEW" | "DRAFT" | "SUSPENDED";
  lastRun: string;
  updated: string;
};

export type TestEvidenceItem = {
  id: string;
  agentName: string;
  agentKey: string;
  category: "POSITIVE" | "NEGATIVE" | "REGRESSION" | "SECURITY" | "RECOVERY";
  testKey: string;
  expected: "SUCCESS" | "BLOCKED" | "ERROR" | "DETECTED";
  actual: "SUCCESS" | "BLOCKED" | "FAILED" | "NOT RUN" | "DETECTED" | "PENDING";
  status: "PASSED" | "FAILED" | "BLOCKED" | "NOT RUN" | "PENDING";
  lastRun: string;
};

export type AgentPermissionItem = {
  id: string;
  agentName: string;
  agentKey: string;
  permission: string;
  capability: string;
  accessMode: "Read" | "Create" | "Write" | "Admin";
  status: "APPROVED" | "PENDING" | "REJECTED";
  approvedBy: string;
  actionLabel: "View" | "Review";
};

export type RuntimeMonitoringItem = {
  id: string;
  runId: string;
  agentName: string;
  agentKey: string;
  version: string;
  status: "SUCCESS" | "FAILED" | "BLOCKED";
  tokens: string;
  costUsd: string;
  latency: string;
  time: string;
};

export type BudgetOverviewData = {
  percentage: number;
  usedAmount: string;
  totalAmount: string;
  dailyLimits: {
    requestLimit: { used: string; max: string; percent: number };
    outputTokenLimit: { used: string; max: string; percent: number };
    costLimit: { used: string; max: string; percent: number };
  };
  alerts: {
    id: string;
    type: "info" | "warning";
    title: string;
    subtitle: string;
    timeAgo: string;
  }[];
};

export type KillSwitchAgent = {
  agentKey: string;
  agentName: string;
  changeRequestId?: string;
  scope: string;
  status: "OPERATIONAL" | "HALTED" | "DEGRADED";
  currentVersion: string;
  previousStableVersion: string;
  availableVersions: string[];
  rollbackTargets?: string[];
  circuitState: "CLOSED" | "OPEN" | "HALF_OPEN";
  killSwitchActive?: boolean;
  isSuspended?: boolean;
  lastHaltedAt?: string;
  haltReason?: string;
  latencyAnomaly?: string;
};

export type RollbackLogItem = {
  id: string;
  agentKey: string;
  agentName: string;
  fromVersion: string;
  toVersion: string;
  reason: string;
  executedBy: string;
  executedAt: string;
  status: "SUCCESS" | "VERIFIED" | "FAILED";
};

export type KillSwitchSystemState = {
  globalHalted: boolean;
  globalHaltReason: string;
  globalHaltedAt?: string;
  globalHaltedBy?: string;
  activeAgentsCount: number;
  haltedAgentsCount: number;
  openAnomaliesCount: number;
  mttrMinutes: number;
  agents: KillSwitchAgent[];
  rollbackHistory: RollbackLogItem[];
};

export type AuditTrailRecord = {
  id: string;
  hash: string;
  action: string;
  actionTitle: string;
  severity: "CRITICAL" | "WARNING" | "INFO" | "SUCCESS";
  actor: {
    name: string;
    role: string;
    kind: "HUMAN" | "SYSTEM";
    avatar: string;
  };
  entityType: string;
  entityId: string;
  reason: string;
  occurredAt: string;
  rawOccurredAt?: string;
  metadata: {
    ipAddress?: string;
    correlationId?: string;
    prevValue?: string;
    newValue?: string;
    signature?: string;
    details?: string;
    [key: string]: unknown;
  };
};
