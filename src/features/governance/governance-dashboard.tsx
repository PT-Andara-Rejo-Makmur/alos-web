"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ApiError, authenticatedApiRequest as api } from "@/lib/api";
import { GovernanceFeedback } from "@/features/governance/control-ui";
import { normalizeGovernanceError, type GovernanceUiError } from "@/features/governance/errors";
import {
  type ReleaseRequest,
  type ReleaseRequestDetail,
  releaseStates,
  releaseTestCategories,
  defaultTestForm,
  testCasePayload,
  latestRunByTestCase,
  formatReleaseState,
  canApproveRelease,
  canCheckRelease,
  canMakeRelease,
  canOperateKillSwitch,
  canReviewBusinessGate,
  canReviewTechnicalGate,
  releaseTestReadiness,
} from "@/features/governance/release-governance";
import {
  type AgentRecord,
  canEditAgentRegistry,
  formFromAgent,
  draftPayloadFromForm,
  type AgentDraftForm,
} from "@/features/agents/registry";
import {
  type AuditEvent,
  type Budget,
  canApprovePermission,
  canRegisterPermission,
  canChangeBudget,
  formatCurrency,
  formatDateTime,
  formatInteger,
  type ModelPolicy,
  type Run,
  type Usage,
} from "@/features/governance/core";
import {
  loadAccessibleWorkspaces,
  loadSessionActor,
  type SessionActor,
  type Workspace,
} from "@/features/session";
import {
  mapRuntimeStatus,
  killAgent,
  clearKillSwitch,
  suspendAgent,
  rollbackAgent,
  updateAgentDraft,
  deleteAgentDraft,
  retireAgent,
  approvePermission,
} from "@/features/governance/actions";
import { SourcesView } from "@/features/governance/components/sources-view";
import { ReadinessDecisionsPanel } from "@/features/governance/components/readiness/readiness-decisions-panel";
import {
  resolveActiveAgentVersion,
  resolveRollbackTargets,
} from "@/features/governance/release-governance";
import {
  type KillSwitchAgent,
  type KillSwitchSystemState,
  type RollbackLogItem,
  type AuditTrailRecord,
  type GovernanceMetricCard,
  type LifecycleDistributionItem,
  type GovernanceActivity,
  type PendingHumanAction,
  type RiskBlockerItem,
  type ReleaseRequestItem,
  type BudgetOverviewData,
} from "@/features/governance/data";

type DashboardData = {
  actor: SessionActor;
  workspaces: Workspace[];
  policy: ModelPolicy;
  budget: Budget | null;
  usage: Usage;
  runs: Run[];
  audit: AuditEvent[];
  auditRestricted: boolean;
  releases: ReleaseRequest[];
  agents: AgentRecord[];
  permissions: PermissionPolicy[];
  tools: ToolRecord[];
};

type PermissionPolicy = {
  permission_policy_id: string;
  agent_version_id: string;
  permission_key: string;
  effect: string;
  capability_key: string | null;
  tool_key: string | null;
  access_mode: string;
  resource_type: string;
  division_scope: string | null;
  lifecycle_status: string;
  created_by_user_id?: string | null;
  approved_by_user_id: string | null;
  agent_key?: string | null;
  agent_name?: string | null;
  semantic_version?: string | null;
};

type ToolRecord = {
  tool_definition_id: string;
  tool_key: string;
  name: string;
  risk_level: string;
  lifecycle_status: string;
  manifest: Record<string, unknown>;
};

type AgentTestItem = {
  testName: string;
  category: string;
  result: string;
  score: string;
  date: string;
};

type AgentRecentRunItem = {
  runId: string;
  status: string;
  tokens: number;
  latencyMs: number;
  timestamp: string;
};

type AgentAuditHistoryItem = {
  version: string;
  event: string;
  actor: string;
  date: string;
  hash: string;
};

type Foundation = Pick<DashboardData, "actor" | "workspaces" | "policy">;

type NavView = "overview" | "agents" | "permissions" | "runtime" | "budget" | "safety" | "audit" | "sources";

const KNOWN_SYSTEM_USERS: Record<string, { name: string; role: string; avatar: string }> = {
  "0565dabd-8063-4626-ae58-a72a013ea0b0": { name: "Direktur Utama", role: "Executive Director", avatar: "DU" },
  "ca537b1f-e0cd-4718-9270-6769ca26c577": { name: "IT Lead", role: "IT Lead (Andara)", avatar: "IT" },
  "a91527f4-a293-474f-b436-d6d6cb4f3871": { name: "QA & Security", role: "QA Security", avatar: "QA" },
  "14d56b70-9e21-4886-85e6-d98daa97ba9f": { name: "Business Reviewer", role: "Business Reviewer", avatar: "BR" },
  "563b8375-3844-4c98-90ec-121dd00386d7": { name: "Technical Reviewer", role: "Technical Reviewer", avatar: "TR" },
};

function matchesDateFilter(isoTimestamp?: string | null, filter: "ALL" | "TODAY" | "7D" | "30D" = "ALL"): boolean {
  if (filter === "ALL" || !isoTimestamp) return true;
  const itemDate = new Date(isoTimestamp);
  if (isNaN(itemDate.getTime())) return true;
  const now = new Date();
  if (filter === "TODAY") {
    return itemDate.toDateString() === now.toDateString();
  }
  const diffDays = (now.getTime() - itemDate.getTime()) / (1000 * 60 * 60 * 24);
  if (filter === "7D") return diffDays <= 7;
  if (filter === "30D") return diffDays <= 30;
  return true;
}

export function GovernanceDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedView = searchParams.get("view");
  const requestedSub = searchParams.get("sub");

  const [data, setData] = useState<DashboardData | null>(null);
  const [workspaceId, setWorkspaceId] = useState("");
  const [error, setError] = useState<GovernanceUiError | null>(null);
  const [notice, setNotice] = useState("");
  const [view, setView] = useState<NavView>(() => {
    if (requestedView && ["overview", "agents", "permissions", "runtime", "budget", "safety", "audit", "sources"].includes(requestedView)) {
      return requestedView as NavView;
    }
    return "overview";
  });
  const [, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("7 Hari Terakhir");
  const [agentSubTab, setAgentSubTab] = useState<"overview" | "contract" | "tools" | "tests" | "runtime" | "history">("overview");
  const [selectedAgentKey, setSelectedAgentKey] = useState<string>("EVIDENCE_CHECKER");
  const [showAgentPicker, setShowAgentPicker] = useState<boolean>(false);
  const [viewingAgentDetail, setViewingAgentDetail] = useState<boolean>(false);
  const [agentSearch, setAgentSearch] = useState<string>("");
  const [agentFilterScope, setAgentFilterScope] = useState<string>("ALL");
  const [agentFilterRisk, setAgentFilterRisk] = useState<string>("ALL");
  const [agentFilterStatus, setAgentFilterStatus] = useState<string>("ALL");
  const [testFilterAgent, setTestFilterAgent] = useState<string>("ALL");
  const [testFilterCategory, setTestFilterCategory] = useState<string>("ALL");
  const [testFilterStatus, setTestFilterStatus] = useState<string>("ALL");
  const [dateFilterRange, setDateFilterRange] = useState<"ALL" | "TODAY" | "7D" | "30D">("ALL");
  const [budgetSubTab, setBudgetSubTab] = useState<"budget" | "killswitch" | "audit">("budget");
  const [runtimeFilterAgent, setRuntimeFilterAgent] = useState<string>("ALL");
  const [runtimeFilterStatus, setRuntimeFilterStatus] = useState<string>("ALL");
  const [permSearch, setPermSearch] = useState<string>("");
  const [permFilterAgent, setPermFilterAgent] = useState<string>("ALL");
  const [permFilterStatus, setPermFilterStatus] = useState<string>("ALL");
  const [agentSubView, setAgentSubView] = useState<"agents" | "releases" | "tests" | "reviews">(() => {
    if (requestedSub && ["agents", "releases", "tests", "reviews"].includes(requestedSub)) {
      return requestedSub as "agents" | "releases" | "tests" | "reviews";
    }
    return "agents";
  });
  const [releaseFilterStatus, setReleaseFilterStatus] = useState<string>("ALL");
  const [releaseFilterAgent, setReleaseFilterAgent] = useState<string>("ALL");
  const [releaseSearch, setReleaseSearch] = useState<string>("");

  // Interactive Kill Switch & Audit Trail state
  const [killSwitchSystem, setKillSwitchSystem] = useState<KillSwitchSystemState>({
    globalHalted: false,
    globalHaltReason: "",
    activeAgentsCount: 0,
    haltedAgentsCount: 0,
    openAnomaliesCount: 0,
    mttrMinutes: 0,
    agents: [],
    rollbackHistory: [],
  });
  const [safetyModal, setSafetyModal] = useState<
    | "GLOBAL_KILL"
    | "AGENT_KILL"
    | "AGENT_ROLLBACK"
    | "SUSPEND_AGENT"
    | "EDIT_AGENT_DRAFT"
    | "AUDIT_INSPECT"
    | "REQUEST_NEW_AGENT"
    | "NEW_RELEASE"
    | "NEW_PERMISSION"
    | "UPDATE_BUDGET"
    | "BUDGET_DETAIL"
    | "RUN_AGENT"
    | "RELEASE_INSPECT"
    | null
  >(null);
  const [actionTargetAgent, setActionTargetAgent] = useState<KillSwitchAgent | null>(null);
  const [rollbackTargetVersion, setRollbackTargetVersion] = useState<string>("");
  const [modalReasonInput, setModalReasonInput] = useState<string>("");
  const [submittingSafetyAction, setSubmittingSafetyAction] = useState(false);
  const [inspectAuditItem, setInspectAuditItem] = useState<AuditTrailRecord | null>(null);

  // Agent draft edit state
  const [editingAgentDraft, setEditingAgentDraft] = useState<AgentRecord | null>(null);
  const [agentDraftForm, setAgentDraftForm] = useState<AgentDraftForm | null>(null);

  // Form states for New Interactive Modals
  const [newAgentName, setNewAgentName] = useState("");
  const [newAgentKey, setNewAgentKey] = useState("");
  const [newAgentRequirement, setNewAgentRequirement] = useState("");
  const [submittingAgent, setSubmittingAgent] = useState(false);

  const [newReleaseAgentKey, setNewReleaseAgentKey] = useState("");
  const [newReleaseRequirement, setNewReleaseRequirement] = useState("");
  const [submittingRelease, setSubmittingRelease] = useState(false);

  const [newPermAgentKey, setNewPermAgentKey] = useState("");
  const [newPermVersion, setNewPermVersion] = useState("");
  const [newPermKey, setNewPermKey] = useState("");
  const [newPermCapability, setNewPermCapability] = useState("");
  const [newPermAccessMode, setNewPermAccessMode] = useState<
    "READ" | "CREATE_DRAFT" | "UPDATE_SCOPED" | "REQUEST_APPROVAL" | "EXECUTE_APPROVED_ACTION"
  >("READ");
  const [newPermResourceType, setNewPermResourceType] = useState("DATA");
  const [newPermClassification, setNewPermClassification] = useState<"INTERNAL" | "CONFIDENTIAL" | "RESTRICTED">("INTERNAL");
  const [submittingPerm, setSubmittingPerm] = useState(false);

  const [budgetReqLimit, setBudgetReqLimit] = useState("");
  const [budgetTokenLimit, setBudgetTokenLimit] = useState("");
  const [budgetCostCap, setBudgetCostCap] = useState("");
  const [submittingBudget, setSubmittingBudget] = useState(false);

  const [targetRunAgentKey, setTargetRunAgentKey] = useState("");
  const [targetRunAgentName, setTargetRunAgentName] = useState("");
  const [runInputText, setRunInputText] = useState('{\n  "query": "Jalankan analisis evaluasi kepatuhan operasional."\n}');
  const [runIsTesting, setRunIsTesting] = useState(true);
  const [runningAgent, setRunningAgent] = useState(false);
  const [runResult, setRunResult] = useState<Record<string, unknown> | null>(null);

  const [inspectReleaseItem, setInspectReleaseItem] = useState<ReleaseRequestItem | null>(null);
  const [releaseDetail, setReleaseDetail] = useState<ReleaseRequestDetail | null>(null);
  const [loadingReleaseDetail, setLoadingReleaseDetail] = useState(false);
  const [releaseDetailsMap, setReleaseDetailsMap] = useState<Record<string, ReleaseRequestDetail>>({});
  const [executingTestKey, setExecutingTestKey] = useState<string | null>(null);
  const [batchRunningTests, setBatchRunningTests] = useState(false);
  const [businessReviewNotes, setBusinessReviewNotes] = useState("Kesesuaian logika bisnis, kepatuhan proses operasional, dan parameter risiko telah diverifikasi.");
  const [technicalReviewNotes, setTechnicalReviewNotes] = useState("Arsitektur agen, batas latensi SLA, guardrail deterministik, dan isolasi sandbox telah diverifikasi.");
  const [submittingReviewGate, setSubmittingReviewGate] = useState<"BUSINESS" | "TECHNICAL" | null>(null);
  const [inspectSubTab, setInspectSubTab] = useState<"pipeline" | "tests" | "reviews" | "audit">("pipeline");
  const [pipelineWorking, setPipelineWorking] = useState(false);

  // Audit Logs State
  const [auditLogsList, setAuditLogsList] = useState<AuditTrailRecord[]>([]);

  // Filters for Audit Trail
  const [auditSearch, setAuditSearch] = useState<string>("");
  const [auditFilterSeverity, setAuditFilterSeverity] = useState<string>("ALL");
  const [auditFilterActor, setAuditFilterActor] = useState<string>("ALL");
  const [auditFilterEntity, setAuditFilterEntity] = useState<string>("ALL");

  const [prevRequestedView, setPrevRequestedView] = useState(requestedView);
  if (requestedView !== prevRequestedView) {
    setPrevRequestedView(requestedView);
    if (requestedView && ["overview", "agents", "permissions", "runtime", "budget", "safety", "audit"].includes(requestedView)) {
      setView(requestedView as NavView);
    }
  }

  const [prevRequestedSub, setPrevRequestedSub] = useState(requestedSub);
  if (requestedSub !== prevRequestedSub) {
    setPrevRequestedSub(requestedSub);
    if (requestedSub && ["agents", "releases", "tests", "reviews"].includes(requestedSub)) {
      setAgentSubView(requestedSub as "agents" | "releases" | "tests" | "reviews");
    }
  }

  const loadWorkspace = useCallback(async (selectedWorkspaceId: string, base?: Foundation) => {
    const foundation = base ?? (await loadFoundation());
    const [budget, usage, runs, auditResult, releases, agents, permissions, tools] = await Promise.all([
      api<Budget>(`/api/v1/workspaces/${selectedWorkspaceId}/budget`).catch((err: unknown) => {
        if (err instanceof ApiError && (err.status === 400 || err.status === 404)) {
          return null;
        }
        throw err;
      }),
      api<Usage>(`/api/v1/workspaces/${selectedWorkspaceId}/usage/daily`),
      api<Run[]>(`/api/v1/workspaces/${selectedWorkspaceId}/runs?limit=12`),
      loadAudit(selectedWorkspaceId),
      api<ReleaseRequest[]>(`/api/v1/release-requests?workspace_id=${encodeURIComponent(selectedWorkspaceId)}`),
      api<AgentRecord[]>(`/api/v1/agents?workspace_id=${encodeURIComponent(selectedWorkspaceId)}`),
      api<PermissionPolicy[]>(`/api/v1/permission-policies?workspace_id=${encodeURIComponent(selectedWorkspaceId)}`),
      api<ToolRecord[]>("/api/v1/tools"),
    ]);
    if (!budget) {
      setError(
        normalizeGovernanceError(
          new ApiError(400, "an active workspace cost limit was not found", null)
        )
      );
    }
    setData({
      ...foundation,
      budget,
      usage,
      runs,
      releases,
      agents,
      permissions: permissions.filter((p) => Boolean(p.agent_version_id || p.agent_key)),
      tools,
      ...auditResult,
    });

    const detailsList = await Promise.all(
      releases.map((r) =>
        api<ReleaseRequestDetail>(`/api/v1/release-requests/${r.change_request_id}`).catch(() => null)
      )
    );
    const validDetailsMap: Record<string, ReleaseRequestDetail> = {};
    for (const item of detailsList) {
      if (item) validDetailsMap[item.change_request_id] = item;
    }
    setReleaseDetailsMap(validDetailsMap);

    const mappedAudit: AuditTrailRecord[] = auditResult.audit.map((ev) => {
      const knownUser = ev.actor_user_id ? KNOWN_SYSTEM_USERS[ev.actor_user_id] : null;

      const actorName = knownUser?.name ?? (ev.actor_user_id ? `User (${ev.actor_user_id.slice(0, 8)})` : ev.system_actor ?? "System");
      const actorRole = knownUser?.role ?? (ev.actor_kind === "HUMAN" ? "Human Operator" : "SYSTEM");
      const actorAvatar = knownUser?.avatar ?? (ev.actor_kind === "HUMAN" ? "HU" : "SY");

      const isCritical = ev.action.includes("KILL") || ev.action.includes("BLOCK") || ev.action.includes("FAIL");
      const isWarning = ev.action.includes("ALERT") || ev.action.includes("SUSPEND") || ev.action.includes("WARN") || ev.action.includes("RETURNED");
      const isSuccess = ev.action.includes("SUCCESS") || ev.action.includes("SUCCEEDED") || ev.action.includes("APPROVED") || ev.action.includes("RELEASED");

      const severity = isCritical ? "CRITICAL" : isWarning ? "WARNING" : isSuccess ? "SUCCESS" : "INFO";

      return {
        id: ev.audit_event_id,
        hash: ev.correlation_id ?? ev.audit_event_id,
        action: ev.action,
        actionTitle: ev.action.replace(/_/g, " "),
        severity,
        actor: {
          name: actorName,
          role: actorRole,
          kind: (ev.actor_kind === "HUMAN" ? "HUMAN" : "SYSTEM") as "HUMAN" | "SYSTEM",
          avatar: actorAvatar,
        },
        entityType: ev.entity_type || "WORKSPACE",
        entityId: ev.entity_id ? (ev.entity_id.length > 20 ? `${ev.entity_id.slice(0, 8)}...${ev.entity_id.slice(-4)}` : ev.entity_id) : "—",
        reason: ev.reason,
        occurredAt: formatDateTime(ev.occurred_at),
        rawOccurredAt: ev.occurred_at,
        metadata: {
          ...(ev.metadata ?? {}),
          correlationId: ev.correlation_id,
          rawEntityId: ev.entity_id,
          actorUserId: ev.actor_user_id,
        },
      };
    });
    setAuditLogsList(mappedAudit);

    const currentWs = foundation.workspaces.find((w) => w.workspace_id === selectedWorkspaceId);
    const wsScope = currentWs?.division_code ? `Divisi ${currentWs.division_code}` : (currentWs?.name ?? "Workspace");

    const mappedKsAgents: KillSwitchAgent[] = agents.map((ag) => {
      const activeVersion = resolveActiveAgentVersion(ag);
      const matchingRelease =
        (activeVersion?.agent_version_id
          ? releases.find((r) => r.agent_key === ag.agent_key && r.agent_version_id === activeVersion.agent_version_id)
          : undefined)
        ?? releases.find((r) => r.agent_key === ag.agent_key && (r.state === "ACTIVE" || r.state === "RELEASED" || r.state === "SUSPENDED"))
        ?? releases.find((r) => r.agent_key === ag.agent_key);
      const relDetail = matchingRelease ? validDetailsMap[matchingRelease.change_request_id] : undefined;
      const isKillSwitchActive = Boolean(relDetail?.kill_switch_active || matchingRelease?.kill_switch_active);
      const isSuspended = !isKillSwitchActive && (activeVersion?.lifecycle_status === "SUSPENDED" || matchingRelease?.state === "SUSPENDED");
      const isHalted = isKillSwitchActive || isSuspended;
      const haltReason = isKillSwitchActive
        ? "Sirkuit runtime diputus oleh Kill Switch darurat"
        : isSuspended
        ? "Suspensi administratif rilis oleh Direktur"
        : undefined;

      const rollbackTargets = resolveRollbackTargets(
        activeVersion?.agent_version_id,
        ag.versions,
        relDetail?.rollback_targets
      );

      const previousStableVersion =
        rollbackTargets[0] ??
        ag.versions.find((v) => v.agent_version_id !== activeVersion?.agent_version_id)?.semantic_version ??
        activeVersion?.semantic_version ??
        "v1.0.0";

      return {
        agentKey: ag.agent_key,
        agentName: ag.name,
        scope: wsScope,
        status: (isHalted ? "HALTED" : "OPERATIONAL") as "OPERATIONAL" | "HALTED",
        circuitState: (isKillSwitchActive ? "OPEN" : "CLOSED") as "CLOSED" | "OPEN",
        currentVersion: activeVersion?.semantic_version ?? "v1.0.0",
        previousStableVersion,
        availableVersions: ag.versions.map((v) => v.semantic_version),
        changeRequestId: matchingRelease?.change_request_id,
        rollbackTargets,
        killSwitchActive: isKillSwitchActive,
        isSuspended,
        haltReason,
      };
    });

    const rollbackHistory: RollbackLogItem[] = auditResult.audit
      .filter((ev) => ev.action === "AGENT_ROLLED_BACK")
      .map((ev) => {
        const matchingAgent = agents.find(
          (ag) =>
            ag.agent_contract_id === ev.entity_id ||
            ag.agent_key === (ev.metadata?.agent_key as string | undefined)
        );
        const knownUser = ev.actor_user_id ? KNOWN_SYSTEM_USERS[ev.actor_user_id] : null;
        const actorName =
          knownUser?.name ??
          (ev.actor_user_id ? `User (${ev.actor_user_id.slice(0, 8)})` : ev.system_actor ?? "Director");
        const toVersion =
          (ev.metadata?.to_semantic_version as string | undefined) ??
          (ev.metadata?.target_semantic_version as string | undefined) ??
          "v1.0.0";
        const fromVersion =
          (ev.metadata?.from_semantic_version as string | undefined) ??
          matchingAgent?.versions.find((v) => v.semantic_version !== toVersion)?.semantic_version ??
          "v1.1.0";
        return {
          id: ev.audit_event_id,
          agentKey: matchingAgent?.agent_key ?? (ev.metadata?.agent_key as string | undefined) ?? "UNKNOWN",
          agentName: matchingAgent?.name ?? (ev.metadata?.agent_key as string | undefined) ?? "Agent",
          fromVersion,
          toVersion,
          reason: ev.reason || "Rollback operasional",
          executedBy: actorName,
          executedAt: formatDateTime(ev.occurred_at),
          status: "VERIFIED",
        };
      });

    setKillSwitchSystem((prev) => ({
      ...prev,
      activeAgentsCount: mappedKsAgents.filter((a) => a.status === "OPERATIONAL").length,
      haltedAgentsCount: mappedKsAgents.filter((a) => a.status === "HALTED").length,
      agents: mappedKsAgents,
      rollbackHistory,
    }));
  }, []);

  useEffect(() => {
    async function initialize() {
      try {
        const foundation = await loadFoundation();
        if (foundation.workspaces.length === 0) {
          setError({
            title: "Workspace belum tersedia",
            reason: "Akun ini belum memiliki workspace aktif.",
            nextAction: "Minta Administrator memberi akses workspace.",
            severity: "warning",
            status: null,
            correlationId: null,
          });
          return;
        }
        const firstWorkspaceId = foundation.workspaces[0].workspace_id;
        setWorkspaceId(firstWorkspaceId);
        await loadWorkspace(firstWorkspaceId, foundation);
      } catch (loadError: unknown) {
        if (loadError instanceof ApiError && loadError.status === 401) {
          router.replace("/");
          return;
        }
        setError(normalizeGovernanceError(loadError));
      } finally {
        setLoading(false);
      }
    }
    void initialize();
  }, [loadWorkspace, router]);

  function changeView(nextView: NavView) {
    setView(nextView);
    window.history.replaceState(null, "", `/genesis?view=${nextView}`);
  }

  async function selectWorkspace(nextWorkspaceId: string) {
    setWorkspaceId(nextWorkspaceId);
    setLoading(true);
    setError(null);
    try {
      await loadWorkspace(nextWorkspaceId, data ? foundationOf(data) : undefined);
    } catch (loadError: unknown) {
      if (loadError instanceof ApiError && loadError.status === 401) {
        router.replace("/");
      } else {
        setError(normalizeGovernanceError(loadError));
      }
    } finally {
      setLoading(false);
    }
  }

  void selectWorkspace;

  // Live metrics and records derived directly from backend database
  const realAgents = data?.agents ?? [];
  const realReleases = data?.releases ?? [];
  const realPermissions = data?.permissions ?? [];
  const realRuns = data?.runs ?? [];
  const realAudit = data?.audit ?? [];
  const realBudget = data?.budget;
  const realUsage = data?.usage;
  const realTools = data?.tools ?? [];
  const actorRoles = data?.actor?.roles ?? [];

  const userKnown = data?.actor?.user_id ? KNOWN_SYSTEM_USERS[data.actor.user_id] : null;
  const currentActiveRoleTitle = data?.actor?.roles?.includes("EXECUTIVE")
    ? "Direktur Utama"
    : data?.actor?.roles?.includes("IT_ADMIN")
    ? "IT Lead"
    : data?.actor?.roles?.includes("QA_ASSURANCE")
    ? "QA & Security"
    : data?.actor?.roles?.includes("BUSINESS_REVIEWER")
    ? "Business Reviewer"
    : data?.actor?.roles?.includes("TECHNICAL_REVIEWER")
    ? "Technical Reviewer"
    : (data?.actor?.roles?.[0] ?? "User");
  const currentActiveUserName = userKnown?.name ?? (data?.actor?.roles?.includes("EXECUTIVE") ? "Direktur Utama" : currentActiveRoleTitle);
  const currentActiveUserAvatar = userKnown?.avatar ?? (data?.actor?.roles?.includes("EXECUTIVE") ? "DU" : data?.actor?.roles?.includes("IT_ADMIN") ? "IT" : "AL");

  const currentWorkspace = data?.workspaces.find((w) => w.workspace_id === workspaceId);
  const currentDivisionScope = currentWorkspace?.division_code ? `Divisi ${currentWorkspace.division_code}` : (currentWorkspace?.name ?? "Workspace");

  const pendingReviewCount = realReleases.filter((r) => r.state === "IN_REVIEW").length;
  const blockedViolationCount = realRuns.filter((r) => mapRuntimeStatus(r.status) === "FAILED" || mapRuntimeStatus(r.status) === "BLOCKED").length;
  const activeTokensStr = realUsage ? `${(realUsage.output_tokens / 1000).toFixed(0)}k` : "0k";

  const metrics: GovernanceMetricCard[] = [
    {
      key: "total_agents",
      label: "Total Agent Terdaftar",
      value: realAgents.length,
      trend: realAgents.length > 0 ? `+${realAgents.length}` : "0 terdaftar",
      trendDir: "up",
      trendType: "good",
      iconName: "bot",
    },
    {
      key: "pending_review",
      label: "Release Pending Review",
      value: pendingReviewCount,
      trend: pendingReviewCount > 0 ? `${pendingReviewCount} perlu review` : "0 pending",
      trendDir: "up",
      trendType: pendingReviewCount > 0 ? "bad" : "good",
      iconName: "clock",
    },
    {
      key: "blocked_runs",
      label: "Pelanggaran / Blocked",
      value: blockedViolationCount,
      trend: blockedViolationCount > 0 ? "Perlu mitigasi" : "0 pelanggaran",
      trendDir: "down",
      trendType: blockedViolationCount > 0 ? "bad" : "good",
      iconName: "alert",
    },
    {
      key: "tokens_used",
      label: "Token Output Hari Ini",
      value: realUsage?.output_tokens ?? 0,
      trend: `${activeTokensStr} tokens`,
      trendDir: "up",
      trendType: "good",
      iconName: "cpu",
    },
  ];

  const draftCount = realAgents.filter((a) => a.versions[0]?.lifecycle_status === "DRAFT").length;
  const inReviewCount = realAgents.filter((a) => ["TESTED", "IN_REVIEW"].includes(a.versions[0]?.lifecycle_status ?? "")).length;
  const approvedCount = realAgents.filter((a) => a.versions[0]?.lifecycle_status === "APPROVED").length;
  const releasedCount = realAgents.filter((a) => ["RELEASED", "ACTIVE"].includes(a.versions[0]?.lifecycle_status ?? "")).length;
  const totalDist = realAgents.length || 1;

  const distribution: LifecycleDistributionItem[] = [
    { key: "draft", label: "Draft", count: draftCount, percent: realAgents.length ? Math.round((draftCount / totalDist) * 100) : 0, color: "#64748b" },
    { key: "review", label: "In Review", count: inReviewCount, percent: realAgents.length ? Math.round((inReviewCount / totalDist) * 100) : 0, color: "#f59e0b" },
    { key: "approved", label: "Approved", count: approvedCount, percent: realAgents.length ? Math.round((approvedCount / totalDist) * 100) : 0, color: "#3b82f6" },
    { key: "released", label: "Released / Active", count: releasedCount, percent: realAgents.length ? Math.round((releasedCount / totalDist) * 100) : 0, color: "#10b981" },
  ];

  const activities: GovernanceActivity[] = realAudit.slice(0, 6).map((event) => {
    const known = event.actor_user_id ? KNOWN_SYSTEM_USERS[event.actor_user_id] : null;
    const actorLabel = known?.name ?? (event.actor_user_id ? `User (${event.actor_user_id.slice(0, 8)})` : "Sistem");
    return {
      id: event.audit_event_id,
      title: event.action.replace(/_/g, " "),
      subtitle: event.reason || `Oleh ${actorLabel}`,
      timeAgo: formatDateTime(event.occurred_at),
      iconType: event.action.includes("APPROVED")
        ? "approved"
        : event.action.includes("KILL") || event.action.includes("BLOCK")
        ? "blocked"
        : event.action.includes("ALERT")
        ? "alert"
        : event.action.includes("REVIEW")
        ? "review"
        : "policy",
    };
  });

  const pendingActions: PendingHumanAction[] = realReleases
    .filter((r) => ["DRAFT", "TESTED", "IN_REVIEW"].includes(r.state))
    .map((r) => ({
      id: r.change_request_id,
      agentName: realAgents.find((a) => a.agent_key === r.agent_key)?.name ?? r.agent_key,
      type: r.state === "IN_REVIEW" ? "Director Approval" : "Test Verification",
      requestedBy: r.requested_by_user_id ? r.requested_by_user_id.slice(0, 8) : "System",
      waitingSince: "Hari ini",
      priority: r.state === "IN_REVIEW" ? "Tinggi" : "Sedang",
    }));

  const riskBlockers: RiskBlockerItem[] = realRuns
    .filter((r) => mapRuntimeStatus(r.status) === "FAILED" || mapRuntimeStatus(r.status) === "BLOCKED")
    .map((r) => ({
      id: r.agent_run_id,
      title: `Run Blocked: ${r.agent_key}`,
      description: r.block_reason || r.error_code || "Eksekusi runtime diblokir oleh guardrail governance.",
      count: 1,
      color: "red",
    }));

  const agentControlList = realAgents.map((ag) => {
    const latestVersion = resolveActiveAgentVersion(ag);
    const snapshot = latestVersion?.contract_snapshot;
    const agentReleases = realReleases.filter((r) => r.agent_key === ag.agent_key);
    const agentDetails = agentReleases.map((r) => releaseDetailsMap[r.change_request_id]).filter(Boolean) as ReleaseRequestDetail[];

    const agentTests: AgentTestItem[] = [];
    for (const detail of agentDetails) {
      for (const tr of detail.test_runs) {
        const matchingTc = detail.test_cases.find((tc) => tc.test_case_id === tr.test_case_id);
        agentTests.push({
          testName: matchingTc ? `${matchingTc.category}: ${matchingTc.test_key}` : tr.test_case_id.slice(0, 8),
          category: matchingTc?.category ?? "POSITIVE",
          result: tr.status === "PASSED" ? "PASSED" : tr.status === "BLOCKED" ? "BLOCKED" : "FAILED",
          score: tr.status === "PASSED" ? "100%" : "0%",
          date: formatDateTime(tr.completed_at ?? ""),
        });
      }
    }

    const agentRuns = realRuns.filter((r) => r.agent_key === ag.agent_key);
    const totalRuns = agentRuns.length;
    const totalTokens = agentRuns.reduce((sum, r) => sum + (r.output_tokens || 0), 0);
    const failedOrBlocked = agentRuns.filter((r) => mapRuntimeStatus(r.status) !== "SUCCESS").length;
    const errorRate = totalRuns > 0 ? `${((failedOrBlocked / totalRuns) * 100).toFixed(1)}%` : "0.0%";
    const avgLatency = totalRuns > 0 ? Math.round(agentRuns.reduce((sum, r) => sum + (r.latency_milliseconds || 0), 0) / totalRuns) : 0;
    const lastRunAt = agentRuns[0]?.created_at ? formatDateTime(agentRuns[0].created_at) : "—";
    const recentRuns: AgentRecentRunItem[] = agentRuns.slice(0, 10).map((r) => ({
      runId: r.agent_run_id.length > 12 ? `${r.agent_run_id.slice(0, 8)}...` : r.agent_run_id,
      status: mapRuntimeStatus(r.status),
      tokens: r.output_tokens || 0,
      latencyMs: r.latency_milliseconds || 0,
      timestamp: r.created_at ? formatDateTime(r.created_at) : "—",
    }));

    const agentAuditHistory: AgentAuditHistoryItem[] = realAudit
      .filter((ev) =>
        ev.entity_id === ag.agent_key ||
        ev.metadata?.agent_key === ag.agent_key ||
        ag.agent_contract_id === ev.entity_id ||
        ag.versions.some((v) => v.agent_version_id === ev.entity_id) ||
        ev.action.includes(ag.agent_key)
      )
      .slice(0, 10)
      .map((ev) => {
        const knownUser = ev.actor_user_id ? KNOWN_SYSTEM_USERS[ev.actor_user_id] : null;
        const actorName = knownUser?.name ?? (ev.actor_user_id ? `User (${ev.actor_user_id.slice(0, 8)})` : ev.system_actor ?? "System");
        return {
          version: latestVersion?.semantic_version ?? "v1.0.0",
          event: ev.action.replace(/_/g, " "),
          actor: actorName,
          date: formatDateTime(ev.occurred_at),
          hash: ev.correlation_id ? ev.correlation_id.slice(0, 12) : ev.audit_event_id.slice(0, 12),
        };
      });

    const agentTools = (snapshot?.tool_keys ?? []).map((tk) => {
      const toolDef = realTools.find((t) => t.tool_key === tk);
      const isReadOnly = toolDef?.manifest?.read_only === true || (typeof toolDef?.manifest?.access_mode === "string" && toolDef.manifest.access_mode === "READ");
      return {
        key: tk,
        toolKey: tk,
        name: toolDef?.name ?? tk,
        permission: tk,
        description: (toolDef?.manifest?.description as string) ?? (toolDef ? "Registered deterministic tool" : "Tool not registered in workspace registry"),
        risk: toolDef?.risk_level ?? "UNKNOWN",
        status: toolDef?.lifecycle_status ?? "NOT_REGISTERED",
        accessMode: isReadOnly ? "READ" : "EXECUTE",
        timeout: `${snapshot?.timeout_seconds ?? 30}s`,
      };
    });

    const contractValid = Boolean(snapshot?.input_schema && snapshot?.output_schema);
    const requiredToolKeys = snapshot?.tool_keys ?? [];
    const toolsConfigured = requiredToolKeys.length === 0 ? true : requiredToolKeys.every((tk) => realTools.some((t) => t.tool_key === tk && t.lifecycle_status === "APPROVED"));
    const requiredPermissionKeys = snapshot?.permission_keys ?? [];
    const permsApproved = requiredPermissionKeys.length === 0 ? true : requiredPermissionKeys.every((pk) => realPermissions.some((p) => (p.agent_version_id === latestVersion?.agent_version_id || ag.versions.some((v) => v.agent_version_id === p.agent_version_id)) && p.permission_key === pk && p.lifecycle_status === "APPROVED"));
    const latestDetail = agentDetails[0];
    const testsPassed = Boolean(latestDetail && releaseTestReadiness(latestDetail));
    const businessApproved = Boolean(
      latestDetail &&
      latestDetail.reviews.some((rv) => rv.review_gate === "BUSINESS" && rv.decision === "APPROVED")
    );
    const techApproved = Boolean(
      latestDetail &&
      latestDetail.reviews.some((rv) => rv.review_gate === "TECHNICAL" && rv.decision === "APPROVED")
    );
    const isReadyState = contractValid && toolsConfigured && permsApproved && testsPassed && businessApproved && techApproved;

    return {
      agentKey: ag.agent_key,
      name: ag.name,
      version: latestVersion?.semantic_version ?? "v1.0.0",
      lifecycleStatus: latestVersion?.lifecycle_status ?? "DRAFT",
      purpose: snapshot?.purpose ?? "Agen operasional terdaftar",
      scope: currentDivisionScope,
      riskLevel: ag.risk_level ?? "LOW",
      owner: snapshot?.owner_user_id ? snapshot.owner_user_id.slice(0, 8) : "System",
      createdAt: ag.created_at ? formatDateTime(ag.created_at) : "—",
      lastUpdatedAt: ag.updated_at ? formatDateTime(ag.updated_at) : "—",
      capabilities: snapshot?.permission_keys ?? [],
      readinessChecklist: [
        { label: "Contract Valid", status: contractValid ? "Valid" : "Pending", passed: contractValid },
        { label: "Tools Configured", status: toolsConfigured ? "Completed" : "Pending", passed: toolsConfigured },
        { label: "Permissions Approved", status: permsApproved ? "Approved" : "Pending", passed: permsApproved },
        { label: "All Tests Passed", status: testsPassed ? "Passed" : "Pending", passed: testsPassed },
        { label: "Business Review Approved", status: businessApproved ? "Approved" : "Pending", passed: businessApproved },
        { label: "Technical Review Approved", status: techApproved ? "Approved" : "Pending", passed: techApproved },
      ],
      isReady: isReadyState,
      readyMessageTitle: isReadyState ? "Agent siap digunakan" : "Menunggu review & release",
      readyMessageSubtitle: isReadyState ? "Semua persyaratan governance terpenuhi." : "Lengkapi pengujian dan persetujuan release.",
      contract: {
        inputSchema: snapshot?.input_schema ? JSON.stringify(snapshot.input_schema, null, 2) : "{}",
        outputSchema: snapshot?.output_schema ? JSON.stringify(snapshot.output_schema, null, 2) : "{}",
        invariants: snapshot?.forbidden_actions?.length ? snapshot.forbidden_actions : ["Strict deterministic logic"],
        slaLatencyMs: (snapshot?.timeout_seconds ?? 30) * 1000,
        maxOutputTokens: typeof snapshot?.model_policy?.max_output_tokens === "number" ? snapshot.model_policy.max_output_tokens : 2048,
        modelBinding: snapshot?.model_policy && typeof snapshot.model_policy === "object" ? String((snapshot.model_policy as Record<string, unknown>).provider ?? "Standard Gateway") : "Standard Gateway",
        riskClassification: ag.risk_level ?? "LOW",
        maker: snapshot?.owner_user_id ? snapshot.owner_user_id.slice(0, 8) : "System",
        contractHash: latestVersion?.digest ? latestVersion.digest.slice(0, 16) : "—",
      },
      tools: agentTools,
      tests: agentTests,
      runtime: {
        totalRuns,
        totalInvocations: totalTokens,
        errorRate,
        avgLatencyMs: avgLatency,
        lastRunAt,
        recentRuns,
      },
      auditHistory: agentAuditHistory,
    };
  });
  const currentAgent = agentControlList.find((a) => a.agentKey === selectedAgentKey) || agentControlList[0] || null;

  const releaseRequestsList: ReleaseRequestItem[] = realReleases.map((r) => ({
    id: r.change_request_id,
    agentKey: r.agent_key,
    agentName: realAgents.find((a) => a.agent_key === r.agent_key)?.name ?? r.agent_key,
    iconName: "file",
    iconColor: "#10b981",
    iconBg: "rgba(16, 185, 129, 0.12)",
    version: r.semantic_version,
    requester: r.requested_by_user_id ? r.requested_by_user_id.slice(0, 8) : "System",
    status: r.state,
    submitted: "—",
    updated: "—",
    actionLabel: r.state === "IN_REVIEW" ? "Release" : "View",
  }));
  const filteredReleases = releaseRequestsList.filter((item) => {
    if (releaseFilterStatus !== "ALL" && item.status !== releaseFilterStatus) return false;
    if (releaseFilterAgent !== "ALL" && item.agentKey !== releaseFilterAgent) return false;
    if (
      releaseSearch &&
      !item.agentName.toLowerCase().includes(releaseSearch.toLowerCase()) &&
      !item.requester.toLowerCase().includes(releaseSearch.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const agentDirectoryList = realAgents.map((ag) => {
    const latest = resolveActiveAgentVersion(ag);
    const snap = latest?.contract_snapshot;
    return {
      id: ag.agent_contract_id,
      agentKey: ag.agent_key,
      agentName: ag.name,
      iconName: "bot",
      purpose: snap?.purpose ?? "Agen operasional terdaftar",
      scope: currentDivisionScope,
      version: latest?.semantic_version ?? "v1.0.0",
      risk: ag.risk_level ?? "LOW",
      status: latest?.lifecycle_status ?? "DRAFT",
      toolsCount: snap?.tool_keys?.length ?? 0,
      permsCount: snap?.permission_keys?.length ?? 0,
      lastRun: "—",
      updated: ag.updated_at ? formatDateTime(ag.updated_at) : "—",
    };
  });
  const filteredAgentDirectory = agentDirectoryList.filter((item) => {
    if (agentFilterScope !== "ALL" && item.scope !== agentFilterScope) return false;
    if (agentFilterRisk !== "ALL" && item.risk !== agentFilterRisk) return false;
    if (agentFilterStatus !== "ALL" && item.status !== agentFilterStatus) return false;
    if (
      agentSearch &&
      !item.agentName.toLowerCase().includes(agentSearch.toLowerCase()) &&
      !item.purpose.toLowerCase().includes(agentSearch.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const testEvidenceList: {
    id: string;
    changeRequestId: string;
    agentKey: string;
    agentName: string;
    category: string;
    testKey: string;
    expected: string;
    actual: string;
    status: string;
    lastRun: string;
    rawLastRun?: string | null;
  }[] = Object.values(releaseDetailsMap).flatMap((detail) => {
    const latest = latestRunByTestCase(detail.test_runs);
    return detail.test_cases.map((tc) => {
      const run = latest.get(tc.test_case_id);
      const ag = realAgents.find((a) => a.agent_key === detail.agent_key);
      const expStatus = String((tc.expected_assertions as Record<string, unknown>)?.status ?? "SUCCEEDED");
      return {
        id: tc.test_case_id,
        changeRequestId: detail.change_request_id,
        agentKey: detail.agent_key,
        agentName: ag?.name ?? detail.agent_key,
        category: tc.category,
        testKey: tc.test_key,
        expected: expStatus,
        actual: run?.actual_status ?? (run?.status === "PASSED" ? expStatus : "PENDING"),
        status: run?.status ?? "NOT RUN",
        lastRun: run?.completed_at ? formatDateTime(run.completed_at) : "Belum diuji",
        rawLastRun: run?.completed_at ?? null,
      };
    });
  });
  const filteredTestEvidence = testEvidenceList.filter((item) => {
    if (testFilterAgent !== "ALL" && item.agentKey !== testFilterAgent) return false;
    if (testFilterCategory !== "ALL" && item.category !== testFilterCategory) return false;
    if (testFilterStatus !== "ALL" && item.status !== testFilterStatus) return false;
    if (dateFilterRange !== "ALL" && !matchesDateFilter(item.rawLastRun, dateFilterRange)) return false;
    return true;
  });

  const permissionsList = realPermissions.map((pm) => {
    const ag = realAgents.find(
      (a) =>
        (pm.agent_key && a.agent_key === pm.agent_key) ||
        a.versions.some((v) => v.agent_version_id === pm.agent_version_id)
    );
    const agVersion = ag?.versions.find((v) => v.agent_version_id === pm.agent_version_id);
    const resolvedAgentKey = pm.agent_key ?? ag?.agent_key ?? "UNKNOWN";
    const resolvedAgentName = pm.agent_name ?? ag?.name ?? (resolvedAgentKey !== "UNKNOWN" ? resolvedAgentKey : "Agent");
    const resolvedVersion =
      pm.semantic_version ??
      agVersion?.semantic_version ??
      (ag ? (resolveActiveAgentVersion(ag)?.semantic_version || ag.versions[0]?.semantic_version) : "1.0.0");

    return {
      id: pm.permission_policy_id,
      agentKey: resolvedAgentKey,
      agentName: resolvedAgentName,
      version: resolvedVersion,
      permission: pm.permission_key,
      capability: pm.capability_key ?? "—",
      accessMode: pm.access_mode,
      status: pm.lifecycle_status,
      createdBy: pm.created_by_user_id,
      approvedBy: pm.approved_by_user_id ? pm.approved_by_user_id.slice(0, 8) : "Belum disetujui",
      actionLabel: pm.lifecycle_status === "APPROVED" ? "Approved" : "Approve",
    };
  });

  const filterPermAgentOptions = (() => {
    const map = new Map<string, { key: string; name: string }>();
    for (const ag of realAgents) {
      map.set(ag.agent_key, { key: ag.agent_key, name: ag.name });
    }
    for (const pm of permissionsList) {
      if (pm.agentKey && pm.agentKey !== "UNKNOWN" && !map.has(pm.agentKey)) {
        map.set(pm.agentKey, { key: pm.agentKey, name: pm.agentName });
      }
    }
    return Array.from(map.values());
  })();

  const filteredPermissions = permissionsList.filter((item) => {
    if (
      permFilterAgent !== "ALL" &&
      item.agentKey !== permFilterAgent &&
      item.agentName !== permFilterAgent
    ) {
      return false;
    }
    if (permFilterStatus !== "ALL" && item.status !== permFilterStatus) return false;
    if (
      permSearch &&
      !item.permission.toLowerCase().includes(permSearch.toLowerCase()) &&
      !item.capability.toLowerCase().includes(permSearch.toLowerCase()) &&
      !item.agentName.toLowerCase().includes(permSearch.toLowerCase()) &&
      !item.agentKey.toLowerCase().includes(permSearch.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const runtimeMonitoringList = realRuns.map((rn) => {
    const ag = realAgents.find((a) => a.agent_key === rn.agent_key);
    return {
      id: rn.agent_run_id,
      runId: rn.agent_run_id.slice(0, 8),
      agentKey: rn.agent_key,
      agentName: ag?.name ?? rn.agent_key,
      version: rn.semantic_version,
      status: mapRuntimeStatus(rn.status),
      tokens: formatInteger(rn.output_tokens ?? 0),
      costUsd: rn.estimated_cost_usd ? formatCurrency(rn.estimated_cost_usd) : "$0.00",
      latency: rn.latency_milliseconds ? `${rn.latency_milliseconds}ms` : "—",
      time: formatDateTime(rn.created_at),
      rawTime: rn.created_at,
    };
  });
  const filteredRuntimeMonitoring = runtimeMonitoringList.filter((item) => {
    if (runtimeFilterAgent !== "ALL" && item.agentName !== runtimeFilterAgent && item.agentKey !== runtimeFilterAgent) return false;
    if (runtimeFilterStatus !== "ALL" && item.status !== runtimeFilterStatus) return false;
    if (dateFilterRange !== "ALL" && !matchesDateFilter(item.rawTime, dateFilterRange)) return false;
    return true;
  });

  const costLimitNum = Number(realBudget?.daily_cost_cap_usd || "50.00");
  const costUsedNum = Number(realUsage?.estimated_cost_usd || "0.00");
  const costPercent = costLimitNum > 0 ? Math.min(100, Math.round((costUsedNum / costLimitNum) * 100)) : 0;

  const reqLimitNum = realBudget?.daily_request_limit || 1000;
  const reqUsedNum = realUsage?.request_count || 0;
  const reqPercent = reqLimitNum > 0 ? Math.min(100, Math.round((reqUsedNum / reqLimitNum) * 100)) : 0;

  const tokenLimitNum = realBudget?.daily_output_token_limit || 2500000;
  const tokenUsedNum = realUsage?.output_tokens || 0;
  const tokenPercent = tokenLimitNum > 0 ? Math.min(100, Math.round((tokenUsedNum / tokenLimitNum) * 100)) : 0;

  const budgetOverview: BudgetOverviewData = {
    percentage: costPercent,
    usedAmount: `$${costUsedNum.toFixed(2)}`,
    totalAmount: `$${costLimitNum.toFixed(2)}`,
    dailyLimits: {
      requestLimit: {
        used: formatInteger(reqUsedNum),
        max: formatInteger(reqLimitNum),
        percent: reqPercent,
      },
      outputTokenLimit: {
        used: formatInteger(tokenUsedNum),
        max: formatInteger(tokenLimitNum),
        percent: tokenPercent,
      },
      costLimit: {
        used: `$${costUsedNum.toFixed(2)}`,
        max: `$${costLimitNum.toFixed(2)}`,
        percent: costPercent,
      },
    },
    alerts: (costPercent >= 80
      ? [
          {
            id: "balert-1",
            type: "warning" as const,
            title: "Penggunaan Biaya Mendekati Batas",
            subtitle: `Penggunaan saat ini telah mencapai ${costPercent}% dari batas harian.`,
            timeAgo: "Baru saja",
          },
        ]
      : []) as BudgetOverviewData["alerts"],
  };



  const filteredAuditLogs = auditLogsList.filter((item) => {
    if (auditFilterSeverity !== "ALL" && item.severity !== auditFilterSeverity) return false;
    if (auditFilterActor !== "ALL" && item.actor.name !== auditFilterActor) return false;
    if (auditFilterEntity !== "ALL" && item.entityType !== auditFilterEntity) return false;
    if (dateFilterRange !== "ALL" && !matchesDateFilter(item.rawOccurredAt, dateFilterRange)) return false;
    if (auditSearch) {
      const q = auditSearch.toLowerCase();
      if (
        !item.hash.toLowerCase().includes(q) &&
        !item.action.toLowerCase().includes(q) &&
        !item.actionTitle.toLowerCase().includes(q) &&
        !item.reason.toLowerCase().includes(q) &&
        !item.entityId.toLowerCase().includes(q) &&
        !item.actor.name.toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    return true;
  });

  function handleConfirmGlobalKillSwitch() {
    setError({
      title: "Fitur Belum Tersedia",
      reason: "Global Kill Switch belum tersedia pada MVP 0.1 backend.",
      nextAction: "Silakan gunakan Per-Agent Kill Switch pada tabel di bawah.",
      severity: "warning",
      status: null,
      correlationId: null,
    });
    setSafetyModal(null);
    setModalReasonInput("");
  }

  async function handleConfirmAgentHalt() {
    if (!actionTargetAgent) return;
    const changeRequestId = actionTargetAgent.changeRequestId;
    if (!changeRequestId) {
      setError({
        title: "Change Request Tidak Ditemukan",
        reason: `Tidak ditemukan Change Request ID untuk agen ${actionTargetAgent.agentName}.`,
        nextAction: "Pastikan agen memiliki rilis aktif atau tersuspensi.",
        severity: "warning",
        status: null,
        correlationId: null,
      });
      setSafetyModal(null);
      return;
    }
    const isCurrentlyHalted = actionTargetAgent.status === "HALTED" || actionTargetAgent.killSwitchActive;
    const reason =
      modalReasonInput.trim() ||
      (isCurrentlyHalted
        ? `Pemulihan sirkuit operasional agen oleh ${currentActiveUserName}`
        : `Penghentian darurat / isolasi agen oleh ${currentActiveUserName}`);

    setSubmittingSafetyAction(true);
    setError(null);
    try {
      if (isCurrentlyHalted) {
        await clearKillSwitch(changeRequestId, reason);
        setNotice(`Kill switch untuk agen ${actionTargetAgent.agentName} berhasil dinonaktifkan.`);
      } else {
        await killAgent(changeRequestId, reason);
        setNotice(`Kill switch untuk agen ${actionTargetAgent.agentName} berhasil diaktifkan.`);
      }
      setSafetyModal(null);
      setActionTargetAgent(null);
      setModalReasonInput("");
      if (workspaceId) {
        await loadWorkspace(workspaceId);
      }
    } catch (err) {
      setError(normalizeGovernanceError(err));
    } finally {
      setSubmittingSafetyAction(false);
    }
  }

  async function handleConfirmRollback() {
    if (!actionTargetAgent) return;
    const targetVersion = (
      rollbackTargetVersion ||
      actionTargetAgent.rollbackTargets?.[0] ||
      actionTargetAgent.previousStableVersion
    )?.trim();
    if (!targetVersion) return;
    const changeRequestId = actionTargetAgent.changeRequestId;
    if (!changeRequestId) {
      setError({
        title: "Change Request Tidak Ditemukan",
        reason: `Tidak ditemukan Change Request ID untuk agen ${actionTargetAgent.agentName}.`,
        nextAction: "Rollback hanya dapat dilakukan pada release yang valid.",
        severity: "warning",
        status: null,
        correlationId: null,
      });
      setSafetyModal(null);
      return;
    }
    const reason =
      modalReasonInput.trim() ||
      `Rollback versi dari ${actionTargetAgent.currentVersion} ke ${targetVersion}`;

    setSubmittingSafetyAction(true);
    setError(null);
    try {
      await rollbackAgent(changeRequestId, targetVersion, reason);
      setNotice(`Rollback agen ${actionTargetAgent.agentName} ke versi ${targetVersion} berhasil.`);
      setSafetyModal(null);
      setActionTargetAgent(null);
      setRollbackTargetVersion("");
      setModalReasonInput("");
      if (workspaceId) {
        await loadWorkspace(workspaceId);
      }
    } catch (err) {
      setError(normalizeGovernanceError(err));
    } finally {
      setSubmittingSafetyAction(false);
    }
  }

  function handleSuspendAgent(agentKey: string) {
    const ksAgent = killSwitchSystem.agents.find((a) => a.agentKey === agentKey);
    const changeRequestId = ksAgent?.changeRequestId;
    if (!changeRequestId) {
      setError({
        title: "Change Request Tidak Ditemukan",
        reason: `Tidak ditemukan Change Request aktif untuk agen '${agentKey}'.`,
        nextAction: "Penangguhan agen memerlukan Change Request release yang valid.",
        severity: "warning",
        status: null,
        correlationId: null,
      });
      return;
    }
    setActionTargetAgent(ksAgent);
    setSafetyModal("SUSPEND_AGENT");
    setModalReasonInput("");
  }

  async function handleConfirmSuspend() {
    if (!actionTargetAgent) return;
    const changeRequestId = actionTargetAgent.changeRequestId;
    if (!changeRequestId) return;
    const reason = modalReasonInput.trim();
    if (!reason) {
      setError({
        title: "Alasan Penangguhan Wajib Diisi",
        reason: "Penangguhan agen memerlukan alasan audit yang jelas dari Direktur.",
        nextAction: "Masukkan alasan penangguhan pada formulir.",
        severity: "warning",
        status: null,
        correlationId: null,
      });
      return;
    }

    setSubmittingSafetyAction(true);
    setError(null);
    try {
      await suspendAgent(changeRequestId, reason);
      setNotice(`Agen ${actionTargetAgent.agentName} berhasil ditangguhkan oleh Direktur.`);
      setSafetyModal(null);
      setActionTargetAgent(null);
      setModalReasonInput("");
      if (workspaceId) {
        await loadWorkspace(workspaceId);
      }
    } catch (err) {
      setError(normalizeGovernanceError(err));
    } finally {
      setSubmittingSafetyAction(false);
    }
  }

  function handleOpenEditAgentDraft(agentKey: string) {
    const ag = realAgents.find((a) => a.agent_key === agentKey);
    if (!ag) return;
    setEditingAgentDraft(ag);
    setAgentDraftForm(formFromAgent(ag));
    setSafetyModal("EDIT_AGENT_DRAFT");
  }

  async function handleSaveEditAgentDraft() {
    if (!editingAgentDraft || !agentDraftForm || !workspaceId) return;
    setSubmittingSafetyAction(true);
    setError(null);
    try {
      const payload = draftPayloadFromForm(agentDraftForm, workspaceId);
      await updateAgentDraft(editingAgentDraft.agent_key, payload);
      setNotice(`Draft agen '${editingAgentDraft.name}' berhasil diperbarui.`);
      setSafetyModal(null);
      setEditingAgentDraft(null);
      setAgentDraftForm(null);
      await loadWorkspace(workspaceId);
    } catch (err) {
      setError(normalizeGovernanceError(err));
    } finally {
      setSubmittingSafetyAction(false);
    }
  }

  async function handleDeleteAgentDraft(agentKey: string) {
    if (!confirm(`Hapus draft agent '${agentKey}'? Tindakan ini tidak dapat dibatalkan.`)) return;
    setError(null);
    try {
      await deleteAgentDraft(agentKey);
      setNotice(`Draft agen '${agentKey}' berhasil dihapus.`);
      if (workspaceId) {
        await loadWorkspace(workspaceId);
      }
    } catch (err) {
      setError(normalizeGovernanceError(err));
    }
  }

  async function handleRetireAgent(agentKey: string) {
    if (!confirm(`Pensiunkan agent '${agentKey}'? Agent tidak akan lagi melayani permintaan runtime.`)) return;
    setError(null);
    try {
      await retireAgent(agentKey);
      setNotice(`Agent '${agentKey}' berhasil dipensiunkan.`);
      if (workspaceId) {
        await loadWorkspace(workspaceId);
      }
    } catch (err) {
      setError(normalizeGovernanceError(err));
    }
  }

  function handleExportAudit(format: "csv" | "json") {
    triggerAuditDownload(filteredAuditLogs, format);
  }

  async function handleCreateAgentDraft() {
    if (!newAgentRequirement.trim() || newAgentRequirement.trim().length < 20) {
      setError({
        title: "Requirement belum memenuhi syarat",
        reason: "Deskripsi requirement minimal 20 karakter.",
        nextAction: "Lengkapi penjelasan outcome dan batasan operasional agen.",
        severity: "warning",
        status: null,
        correlationId: null,
      });
      return;
    }
    setSubmittingAgent(true);
    setError(null);
    try {
      const generatedKey =
        newAgentKey.trim().toUpperCase() ||
        newAgentName.trim().toUpperCase().replace(/[^A-Z0-9]+/g, "_").slice(0, 30) ||
        "GENESIS_AGENT";
      await api("/api/v1/designer/agent-drafts", {
        method: "POST",
        body: JSON.stringify({
          workspace_id: workspaceId,
          agent_key: generatedKey,
          name: newAgentName.trim() || "Genesis Operational Agent",
          requirement: newAgentRequirement.trim(),
        }),
      });
      setNotice(`Draft agent baru '${newAgentName || generatedKey}' berhasil dibuat.`);
      setSafetyModal(null);
      setNewAgentName("");
      setNewAgentKey("");
      setNewAgentRequirement("");
      await loadWorkspace(workspaceId);
    } catch (err: unknown) {
      setError(normalizeGovernanceError(err));
    } finally {
      setSubmittingAgent(false);
    }
  }

  async function handleCreateReleaseRequest() {
    if (!newReleaseAgentKey || !newReleaseRequirement.trim()) return;
    const ag = realAgents.find((a) => a.agent_key === newReleaseAgentKey);
    const version = ag?.versions[0]?.semantic_version || "1.0.0";
    setSubmittingRelease(true);
    setError(null);
    try {
      await api(`/api/v1/agents/${encodeURIComponent(newReleaseAgentKey)}/release-requests`, {
        method: "POST",
        body: JSON.stringify({
          workspace_id: workspaceId,
          requirement: newReleaseRequirement.trim(),
        }),
      });
      setNotice(`Release request untuk '${newReleaseAgentKey}' (${version}) berhasil dibuat.`);
      setSafetyModal(null);
      setNewReleaseRequirement("");
      await loadWorkspace(workspaceId);
    } catch (err: unknown) {
      setError(normalizeGovernanceError(err));
    } finally {
      setSubmittingRelease(false);
    }
  }

  async function handleCreatePermissionPolicy() {
    if (!canRegisterPermission(actorRoles)) {
      setError({
        title: "Akses Ditolak",
        reason: "Pembuatan permission policy memerlukan peran IT_ADMIN, EXECUTIVE, atau QA_ASSURANCE.",
        nextAction: "Gunakan akun dengan peran yang berwenang untuk mendaftarkan permission policy.",
        severity: "warning",
        status: null,
        correlationId: null,
      });
      return;
    }
    if (!newPermAgentKey || !newPermKey.trim()) return;
    const ag = realAgents.find((a) => a.agent_key === newPermAgentKey);
    const version =
      newPermVersion.trim() ||
      resolveActiveAgentVersion(ag)?.semantic_version ||
      ag?.versions[0]?.semantic_version ||
      "1.0.0";
    setSubmittingPerm(true);
    setError(null);
    try {
      await api("/api/v1/permission-policies", {
        method: "POST",
        body: JSON.stringify({
          workspace_id: workspaceId,
          agent_key: newPermAgentKey,
          semantic_version: version,
          permission_key: newPermKey.trim(),
          capability_key: newPermCapability.trim() || null,
          access_mode: newPermAccessMode,
          resource_type: newPermResourceType,
          classification: newPermClassification,
          effect: "ALLOW",
        }),
      });
      setNotice(`Permission policy '${newPermKey}' berhasil didaftarkan untuk '${newPermAgentKey}' (${version}).`);
      setSafetyModal(null);
      setNewPermKey("");
      setNewPermCapability("");
      setNewPermVersion("");
      await loadWorkspace(workspaceId);
    } catch (err: unknown) {
      setError(normalizeGovernanceError(err));
    } finally {
      setSubmittingPerm(false);
    }
  }

  async function handleApprovePermission(permissionPolicyId: string, permKey: string) {
    setError(null);
    setSubmittingPerm(true);
    try {
      await approvePermission(permissionPolicyId);
      setNotice(`Permission '${permKey}' berhasil disetujui.`);
      await loadWorkspace(workspaceId);
    } catch (err: unknown) {
      setError(normalizeGovernanceError(err));
    } finally {
      setSubmittingPerm(false);
    }
  }

  async function handleUpdateBudget() {
    if (!canChangeBudget(actorRoles)) {
      setError({
        title: "Akses Ditolak",
        reason: "Pengubahan budget memerlukan peran IT_ADMIN atau EXECUTIVE.",
        nextAction: "Minta IT Lead atau Direktur untuk memperbarui alokasi budget workspace.",
        severity: "warning",
        status: null,
        correlationId: null,
      });
      return;
    }
    setSubmittingBudget(true);
    setError(null);
    try {
      await api(`/api/v1/workspaces/${encodeURIComponent(workspaceId)}/budget`, {
        method: "PUT",
        body: JSON.stringify({
          daily_request_limit: Number(budgetReqLimit) || 1000,
          daily_output_token_limit: Number(budgetTokenLimit) || 2500000,
          daily_cost_cap_usd: String(Number(budgetCostCap) || 50.0),
        }),
      });
      setNotice("Limit anggaran harian berhasil diperbarui dan dicatat pada audit trail.");
      setSafetyModal(null);
      await loadWorkspace(workspaceId);
    } catch (err: unknown) {
      setError(normalizeGovernanceError(err));
    } finally {
      setSubmittingBudget(false);
    }
  }

  async function handleExecuteRunAgent() {
    if (!targetRunAgentKey) return;
    setRunningAgent(true);
    setRunResult(null);
    setError(null);
    try {
      let parsedInput: Record<string, unknown> = {};
      try {
        parsedInput = JSON.parse(runInputText);
      } catch {
        parsedInput = { query: runInputText.trim() };
      }
      const res = await api<Record<string, unknown>>(`/api/v1/agents/${encodeURIComponent(targetRunAgentKey)}/runs`, {
        method: "POST",
        body: JSON.stringify({
          workspace_id: workspaceId,
          input: parsedInput,
          testing: runIsTesting,
        }),
      });
      setRunResult(res);
      setNotice(`Run agen '${targetRunAgentKey}' selesai dengan status: ${String(res.status ?? "COMPLETED")}`);
      await loadWorkspace(workspaceId);
    } catch (err: unknown) {
      setError(normalizeGovernanceError(err));
    } finally {
      setRunningAgent(false);
    }
  }

  const reloadReleaseDetail = useCallback(async (releaseId: string) => {
    try {
      const detail = await api<ReleaseRequestDetail>(`/api/v1/release-requests/${encodeURIComponent(releaseId)}`);
      setReleaseDetail(detail);
      setReleaseDetailsMap((prev) => ({ ...prev, [releaseId]: detail }));
      setInspectReleaseItem((prev) => prev ? {
        ...prev,
        status: detail.state,
      } : null);
    } catch (err) {
      setError(normalizeGovernanceError(err));
    }
  }, []);

  async function handleOpenReleaseInspect(
    releaseId: string,
    initialItem?: ReleaseRequestItem,
    initialSubTab: "pipeline" | "tests" | "reviews" | "audit" = "pipeline"
  ) {
    if (initialItem) {
      setInspectReleaseItem(initialItem);
    }
    setInspectSubTab(initialSubTab);
    setSafetyModal("RELEASE_INSPECT");
    setLoadingReleaseDetail(true);
    setError(null);
    try {
      const detail = await api<ReleaseRequestDetail>(`/api/v1/release-requests/${encodeURIComponent(releaseId)}`);
      setReleaseDetail(detail);
      setReleaseDetailsMap((prev) => ({ ...prev, [releaseId]: detail }));
      if (!initialItem) {
        const ag = realAgents.find((a) => a.agent_key === detail.agent_key);
        setInspectReleaseItem({
          id: detail.change_request_id,
          agentKey: detail.agent_key,
          agentName: ag?.name ?? detail.agent_key,
          iconName: "file",
          iconColor: "#10b981",
          iconBg: "rgba(16, 185, 129, 0.12)",
          version: detail.semantic_version,
          requester: detail.requested_by_user_id ? detail.requested_by_user_id.slice(0, 8) : "System",
          status: detail.state,
          submitted: "—",
          updated: "—",
          actionLabel: detail.state === "IN_REVIEW" ? "Release" : "View",
        });
      }
    } catch (err) {
      setError(normalizeGovernanceError(err));
    } finally {
      setLoadingReleaseDetail(false);
    }
  }

  async function handleGenerateDefaultTests(changeRequestId: string, agentKey: string) {
    setPipelineWorking(true);
    setError(null);
    try {
      for (const cat of releaseTestCategories) {
        const form = defaultTestForm(cat, agentKey);
        const payload = testCasePayload(form);
        await api(`/api/v1/release-requests/${encodeURIComponent(changeRequestId)}/test-cases`, {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      setNotice("5 Kategori Test Case standar (POSITIVE, NEGATIVE, REGRESSION, SECURITY, RECOVERY) berhasil didaftarkan dan diserahkan ke QA.");
      await reloadReleaseDetail(changeRequestId);
      await loadWorkspace(workspaceId);
    } catch (err) {
      setError(normalizeGovernanceError(err));
    } finally {
      setPipelineWorking(false);
    }
  }

  async function handleExecuteSingleTest(changeRequestId: string, testKey: string) {
    setExecutingTestKey(testKey);
    setError(null);
    try {
      const result = await api<{ test_run_id: string; test_key: string; status: string }>(
        `/api/v1/release-requests/${encodeURIComponent(changeRequestId)}/test-cases/${encodeURIComponent(testKey)}/execute`,
        { method: "POST" }
      );
      setNotice(`Test '${testKey}' selesai dieksekusi: Status ${result.status}`);
      await reloadReleaseDetail(changeRequestId);
      await loadWorkspace(workspaceId);
    } catch (err) {
      setError(normalizeGovernanceError(err));
    } finally {
      setExecutingTestKey(null);
    }
  }

  async function handleExecuteAllTests(changeRequestId: string) {
    if (!releaseDetail || releaseDetail.test_cases.length === 0) return;
    setBatchRunningTests(true);
    setError(null);
    try {
      for (const tc of releaseDetail.test_cases) {
        setExecutingTestKey(tc.test_key);
        await api(
          `/api/v1/release-requests/${encodeURIComponent(changeRequestId)}/test-cases/${encodeURIComponent(tc.test_key)}/execute`,
          { method: "POST" }
        );
      }
      setNotice("Semua 5 test cases berhasil dieksekusi oleh QA. Evidence hasil pengujian telah tercatat.");
      await reloadReleaseDetail(changeRequestId);
      await loadWorkspace(workspaceId);
    } catch (err) {
      setError(normalizeGovernanceError(err));
    } finally {
      setExecutingTestKey(null);
      setBatchRunningTests(false);
    }
  }

  async function handleSubmitForReview(changeRequestId: string) {
    setPipelineWorking(true);
    setError(null);
    try {
      await api(`/api/v1/release-requests/${encodeURIComponent(changeRequestId)}/submit-review`, {
        method: "POST",
      });
      setNotice("Hasil pengujian 5 kategori berhasil diserahkan ke Review Gate. Status pipeline kini IN_REVIEW.");
      await reloadReleaseDetail(changeRequestId);
      await loadWorkspace(workspaceId);
    } catch (err) {
      setError(normalizeGovernanceError(err));
    } finally {
      setPipelineWorking(false);
    }
  }

  async function handleSubmitReviewGate(changeRequestId: string, gate: "BUSINESS" | "TECHNICAL", decision: "APPROVED" | "REJECTED") {
    const notes = gate === "BUSINESS" ? businessReviewNotes.trim() : technicalReviewNotes.trim();
    if (!notes) {
      setError({
        title: "Catatan Review Wajib Diisi",
        reason: `Harap masukkan catatan evaluasi untuk ${gate} Review Gate.`,
        nextAction: "Lengkapi catatan evaluasi sebelum mengirim keputusan.",
        severity: "warning",
        status: null,
        correlationId: null,
      });
      return;
    }
    setSubmittingReviewGate(gate);
    setError(null);
    try {
      await api(`/api/v1/release-requests/${encodeURIComponent(changeRequestId)}/reviews`, {
        method: "POST",
        body: JSON.stringify({
          gate,
          decision,
          notes,
        }),
      });
      setNotice(`Keputusan ${gate} Review '${decision}' berhasil dicatat.`);
      await reloadReleaseDetail(changeRequestId);
      await loadWorkspace(workspaceId);
    } catch (err) {
      setError(normalizeGovernanceError(err));
    } finally {
      setSubmittingReviewGate(null);
    }
  }

  async function handleReleasePipelineAction(changeRequestId: string, actionType: "approve" | "release" | "activate") {
    setPipelineWorking(true);
    setError(null);
    try {
      await api(`/api/v1/release-requests/${encodeURIComponent(changeRequestId)}/${actionType}`, {
        method: "POST",
      });
      setNotice(`Aksi pipeline '${actionType.toUpperCase()}' berhasil dijalankan.`);
      if (safetyModal === "RELEASE_INSPECT") {
        await reloadReleaseDetail(changeRequestId);
      }
      await loadWorkspace(workspaceId);
    } catch (err: unknown) {
      setError(normalizeGovernanceError(err));
    } finally {
      setPipelineWorking(false);
    }
  }

  function renderKillSwitchView() {
    return (
      <div className="gov-ks-shell">
        {/* Page Sub-header */}
        <div className="gov-page-header">
          <div className="gov-page-title">
            <div className="gov-breadcrumb">
              Controls / <span>Kill Switch &amp; Rollback</span>
            </div>
            <h2>Kill Switch &amp; Emergency Rollback Controls</h2>
            <p>Kontrol pemutusan sirkuit darurat runtime dan pemulihan versi rilis agen secara deterministik.</p>
          </div>
        </div>

        {/* Global Emergency Status Banner */}
        <div className={`gov-emergency-banner ${killSwitchSystem.globalHalted ? "alarm" : "normal"}`}>
          <div className="gov-emergency-meta">
            <span className={`gov-emergency-pill ${killSwitchSystem.globalHalted ? "alarm" : "normal"}`}>
              {killSwitchSystem.globalHalted
                ? "⚠ EMERGENCY HALT ACTIVE - ALL AGENTS SUSPENDED"
                : "● NORMAL OPERATIONAL STATE"}
            </span>
            <h3>
              {killSwitchSystem.globalHalted
                ? "Global Agent Kill Switch Aktif"
                : "Global Agent Kill Switch (Standby)"}
            </h3>
            <p>
              Seluruh sirkuit runtime berjalan dalam toleransi operasional normal. Penghentian darurat pada MVP 0.1 dilakukan melalui granular per-agent circuit breaker di bawah ini.
            </p>
          </div>

          <button
            className="gov-emergency-trigger-btn halt-btn"
            disabled
            title="Global Kill Switch belum tersedia pada backend MVP 0.1. Gunakan tombol Halt/Resume pada masing-masing agen."
            style={{ opacity: 0.6, cursor: "not-allowed" }}
            type="button"
          >
            <GovIcon name="warning_triangle" />
            <span>Global Kill Switch (Belum tersedia di MVP 0.1)</span>
          </button>
        </div>

        {/* 4-Metric Grid */}
        <div className="gov-ks-metrics">
          <div className="gov-ks-metric-card">
            <span className="label">Active Agents</span>
            <div className="value-row">
              <span className="value">
                {killSwitchSystem.activeAgentsCount} / {killSwitchSystem.agents.length}
              </span>
              <span className={`tag ${killSwitchSystem.activeAgentsCount > 0 ? "good" : "alert"}`}>
                {killSwitchSystem.activeAgentsCount > 0 ? "Operational" : "All Halted"}
              </span>
            </div>
          </div>

          <div className="gov-ks-metric-card">
            <span className="label">Halted Circuits</span>
            <div className="value-row">
              <span className="value">{killSwitchSystem.haltedAgentsCount}</span>
              <span className={`tag ${killSwitchSystem.haltedAgentsCount > 0 ? "alert" : "good"}`}>
                {killSwitchSystem.haltedAgentsCount > 0 ? "Isolated" : "None"}
              </span>
            </div>
          </div>

          <div className="gov-ks-metric-card">
            <span className="label">Open Anomalies</span>
            <div className="value-row">
              <span className="value">{killSwitchSystem.openAnomaliesCount}</span>
              <span className="tag warning">Flagged</span>
            </div>
          </div>

          <div className="gov-ks-metric-card">
            <span className="label">Avg Recovery MTTR</span>
            <div className="value-row">
              <span className="value">{killSwitchSystem.mttrMinutes} min</span>
              <span className="tag neutral">Deterministic</span>
            </div>
          </div>
        </div>

        {/* Granular Agent Circuit Breaker Table */}
        <div className="gov-ks-panel">
          <div className="gov-ks-panel-header">
            <div>
              <h3>Granular Agent Circuit Breaker &amp; Lifecycle Control</h3>
              <p>Kendali pemutusan sirkuit darurat dan rollback per-agen tanpa mengganggu agen lainnya.</p>
            </div>
          </div>

          <div className="gov-table-wrap">
            <table className="gov-run-table">
              <thead>
                <tr>
                  <th>Agent</th>
                  <th>Scope</th>
                  <th>Status Sirkuit</th>
                  <th>Versi Aktif</th>
                  <th>Versi Stabil Terakhir</th>
                  <th>Latensi &amp; Anomali</th>
                  <th style={{ textAlign: "right", paddingRight: "20px" }}>Tindakan Darurat</th>
                </tr>
              </thead>
              <tbody>
                {killSwitchSystem.agents.map((ag) => (
                  <tr key={ag.agentKey}>
                    <td>
                      <strong style={{ color: "#111827" }}>{ag.agentName}</strong>
                    </td>
                    <td>
                      <span style={{ color: "#4b5563", fontSize: "0.8rem" }}>{ag.scope}</span>
                    </td>
                    <td>
                      <span className={`gov-circuit-pill ${ag.status.toLowerCase()}`}>
                        {ag.status === "OPERATIONAL"
                          ? "● Closed (Normal)"
                          : ag.status === "HALTED"
                          ? "⚠ Open (Halted)"
                          : "● Half-Open"}
                      </span>
                    </td>
                    <td>
                      <span className="gov-version-tag">{ag.currentVersion}</span>
                    </td>
                    <td>
                      <span className="gov-version-tag stable">{ag.previousStableVersion}</span>
                    </td>
                    <td>
                      {ag.latencyAnomaly ? (
                        <span style={{ color: "#b91c1c", fontWeight: 600, fontSize: "0.78rem" }}>
                          {ag.latencyAnomaly}
                        </span>
                      ) : (
                        <span style={{ color: "#166534", fontSize: "0.78rem" }}>Normal (&lt; 800ms)</span>
                      )}
                    </td>
                    <td style={{ textAlign: "right", paddingRight: "20px" }}>
                      <div className="gov-action-btn-group">
                        {ag.status === "OPERATIONAL" ? (
                          <button
                            className="gov-btn-halt"
                            disabled={!canOperateKillSwitch(actorRoles)}
                            title={
                              canOperateKillSwitch(actorRoles)
                                ? "Halt Agent"
                                : "Pengoperasian Kill Switch memerlukan peran IT_ADMIN atau EXECUTIVE"
                            }
                            style={!canOperateKillSwitch(actorRoles) ? { opacity: 0.5, cursor: "not-allowed" } : undefined}
                            onClick={() => {
                              setActionTargetAgent(ag);
                              setModalReasonInput("");
                              setSafetyModal("AGENT_KILL");
                            }}
                            type="button"
                          >
                            Halt Agent
                          </button>
                        ) : (
                          <button
                            className="gov-btn-resume"
                            disabled={!canOperateKillSwitch(actorRoles)}
                            title={
                              canOperateKillSwitch(actorRoles)
                                ? "Resume Agent"
                                : "Pengoperasian Kill Switch memerlukan peran IT_ADMIN atau EXECUTIVE"
                            }
                            style={!canOperateKillSwitch(actorRoles) ? { opacity: 0.5, cursor: "not-allowed" } : undefined}
                            onClick={() => {
                              setActionTargetAgent(ag);
                              setModalReasonInput("");
                              setSafetyModal("AGENT_KILL");
                            }}
                            type="button"
                          >
                            Resume Agent
                          </button>
                        )}
                        <button
                          className="gov-btn-rollback"
                          disabled={!canApproveRelease(actorRoles) || (ag.rollbackTargets?.length ?? 0) === 0}
                          title={
                            !canApproveRelease(actorRoles)
                              ? "Rollback memerlukan peran EXECUTIVE"
                              : (ag.rollbackTargets?.length ?? 0) === 0
                              ? "Tidak ada target rollback versi stabil untuk agen ini"
                              : "Rollback ke versi stabil"
                          }
                          style={
                            !canApproveRelease(actorRoles) || (ag.rollbackTargets?.length ?? 0) === 0
                              ? { opacity: 0.5, cursor: "not-allowed" }
                              : undefined
                          }
                          onClick={() => {
                            setActionTargetAgent(ag);
                            setRollbackTargetVersion(ag.rollbackTargets?.[0] ?? ag.previousStableVersion);
                            setModalReasonInput("");
                            setSafetyModal("AGENT_ROLLBACK");
                          }}
                          type="button"
                        >
                          Rollback
                        </button>
                        {actorRoles.includes("EXECUTIVE") && !ag.isSuspended && ag.changeRequestId && (
                          <button
                            className="gov-btn-halt"
                            style={{ background: "#78350f", borderColor: "#92400e" }}
                            title="Tangguhkan rilis agen administratif (Direktur)"
                            onClick={() => {
                              setActionTargetAgent(ag);
                              setModalReasonInput("");
                              setSafetyModal("SUSPEND_AGENT");
                            }}
                            type="button"
                          >
                            Suspend
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {killSwitchSystem.agents.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: "32px", color: "#6e847a" }}>
                      Belum ada agent terdaftar untuk dikontrol oleh Kill Switch pada workspace ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Rollback History Panel */}
        <div className="gov-ks-panel">
          <div className="gov-ks-panel-header">
            <div>
              <h3>Riwayat Rollback Versi Rilis Agen</h3>
              <p>Audit deterministik catatan pengembalian versi stabil agen sebelumnya yang terverifikasi.</p>
            </div>
          </div>

          <div className="gov-table-wrap">
            <table className="gov-run-table">
              <thead>
                <tr>
                  <th>Waktu Eksekusi</th>
                  <th>Agent</th>
                  <th>Perubahan Versi</th>
                  <th>Alasan Justifikasi</th>
                  <th>Dieksekusi Oleh</th>
                  <th>Status Verifikasi</th>
                </tr>
              </thead>
              <tbody>
                {killSwitchSystem.rollbackHistory.map((rb) => (
                  <tr key={rb.id}>
                    <td>
                      <span style={{ color: "#4b5563", fontSize: "0.8rem", whiteSpace: "nowrap" }}>
                        {rb.executedAt}
                      </span>
                    </td>
                    <td>
                      <strong style={{ color: "#111827" }}>{rb.agentName}</strong>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ textDecoration: "line-through", color: "#9ca3af", fontSize: "0.78rem" }}>
                          {rb.fromVersion}
                        </span>
                        <span style={{ color: "#6b7280" }}>→</span>
                        <span className="gov-version-tag">{rb.toVersion}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ color: "#374151", fontSize: "0.8rem" }}>{rb.reason}</span>
                    </td>
                    <td>
                      <span style={{ color: "#1f2937", fontWeight: 600, fontSize: "0.8rem" }}>
                        {rb.executedBy}
                      </span>
                    </td>
                    <td>
                      <span className="gov-circuit-pill operational">
                        ✓ {rb.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {killSwitchSystem.rollbackHistory.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", padding: "32px", color: "#6e847a" }}>
                      Belum ada riwayat rollback versi pada workspace ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  function renderAuditTrailView() {
    return (
      <div className="gov-audit-shell">
        {/* Page Sub-header */}
        <div className="gov-page-header">
          <div className="gov-page-title">
            <div className="gov-breadcrumb">
              Controls / <span>Audit Trail</span>
            </div>
            <h2>Append-Only Audit Trail</h2>
            <p>Log catatan audit operasional dan perubahan status governance yang dicatat secara permanen.</p>
          </div>
        </div>

        {/* Audit Trail Banner */}
        <div className="gov-audit-banner">
          <div className="gov-audit-banner-left">
            <div className="gov-audit-shield-icon">
              <GovIcon name="shield" />
            </div>
            <div className="gov-audit-banner-meta">
              <h3>ALOS Operational Audit Trail</h3>
              <p>Setiap tindakan otorisasi, modifikasi budget, dan eksekusi darurat dicatat secara berurutan.</p>
              <div className="badges">
                <span className="gov-audit-chip">🔒 Append-Only Log</span>
                <span className="gov-audit-chip">✓ Authoritative State</span>
                <span className="gov-audit-chip">🏛 Event Count: {auditLogsList.length}</span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              className="gov-audit-export-btn"
              onClick={() => handleExportAudit("csv")}
              type="button"
            >
              <GovIcon name="file" />
              <span>Export CSV</span>
            </button>
            <button
              className="gov-audit-export-btn"
              onClick={() => handleExportAudit("json")}
              type="button"
            >
              <GovIcon name="file" />
              <span>Export JSON</span>
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="gov-audit-toolbar">
          <div className="gov-audit-search">
            <GovIcon name="search" />
            <input
              onChange={(e) => setAuditSearch(e.target.value)}
              placeholder="Cari hash, aksi, aktor, atau alasan..."
              type="text"
              value={auditSearch}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <div className="gov-ag-select-wrap">
              <select
                className="gov-ag-select"
                onChange={(e) => setAuditFilterSeverity(e.target.value)}
                value={auditFilterSeverity}
              >
                <option value="ALL">Semua Severity</option>
                <option value="CRITICAL">Critical</option>
                <option value="WARNING">Warning</option>
                <option value="INFO">Info</option>
                <option value="SUCCESS">Success</option>
              </select>
              <GovIcon name="chevron" />
            </div>

            <div className="gov-ag-select-wrap">
              <select
                className="gov-ag-select"
                onChange={(e) => setAuditFilterActor(e.target.value)}
                value={auditFilterActor}
              >
                <option value="ALL">Semua Aktor</option>
                {Array.from(new Set(auditLogsList.map((l) => l.actor.name)))
                  .filter(Boolean)
                  .sort()
                  .map((actorName) => (
                    <option key={actorName} value={actorName}>
                      {actorName}
                    </option>
                  ))}
              </select>
              <GovIcon name="chevron" />
            </div>

            <div className="gov-ag-select-wrap">
              <select
                className="gov-ag-select"
                onChange={(e) => setAuditFilterEntity(e.target.value)}
                value={auditFilterEntity}
              >
                <option value="ALL">Semua Entitas</option>
                {Array.from(new Set(auditLogsList.map((l) => l.entityType)))
                  .filter(Boolean)
                  .sort()
                  .map((ent) => (
                    <option key={ent} value={ent}>
                      {ent.replace(/_/g, " ")}
                    </option>
                  ))}
              </select>
              <GovIcon name="chevron" />
            </div>
          </div>
        </div>

        {/* Master Audit Trail Table */}
        <div className="gov-table-card">
          <div className="gov-table-wrap">
            <table className="gov-audit-table">
              <thead>
                <tr>
                  <th>Event Hash</th>
                  <th>Action &amp; Title</th>
                  <th>Severity</th>
                  <th>Actor / Pelaku</th>
                  <th>Target Entitas</th>
                  <th>Alasan / Justification</th>
                  <th>Waktu Kejadian</th>
                  <th style={{ textAlign: "right", paddingRight: "20px" }}>Inspect</th>
                </tr>
              </thead>
              <tbody>
                {filteredAuditLogs.map((log) => (
                  <tr key={log.id}>
                    <td>
                      <span className="gov-audit-hash-chip">{log.hash.slice(0, 16)}...</span>
                    </td>
                    <td>
                      <strong style={{ color: "#111827", display: "block" }}>{log.actionTitle}</strong>
                      <small style={{ color: "#6b7280", fontFamily: "ui-monospace, monospace" }}>
                        {log.action}
                      </small>
                    </td>
                    <td>
                      <span className={`gov-audit-sev-badge ${log.severity.toLowerCase()}`}>
                        {log.severity}
                      </span>
                    </td>
                    <td>
                      <div className="gov-actor-chip">
                        <span className={`gov-actor-avatar ${log.actor.kind === "HUMAN" ? "human" : "system"}`}>
                          {log.actor.avatar}
                        </span>
                        <div>
                          <strong style={{ color: "#111827", display: "block", fontSize: "0.78rem" }}>
                            {log.actor.name}
                          </strong>
                          <small style={{ color: "#6b7280", fontSize: "0.7rem" }}>{log.actor.role}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="gov-version-tag stable">{log.entityId}</span>
                    </td>
                    <td style={{ maxWidth: "260px" }}>
                      <span style={{ color: "#374151", fontSize: "0.78rem", lineHeight: 1.4, display: "block" }}>
                        {log.reason}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: "#4b5563", fontSize: "0.78rem", whiteSpace: "nowrap" }}>
                        {log.occurredAt}
                      </span>
                    </td>
                    <td style={{ textAlign: "right", paddingRight: "20px" }}>
                      <button
                        className="gov-audit-inspect-btn"
                        onClick={() => {
                          setInspectAuditItem(log);
                          setSafetyModal("AUDIT_INSPECT");
                        }}
                        type="button"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
                {data?.auditRestricted ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: "center", padding: "32px", color: "#b91c1c" }}>
                      Akses Audit Trail dibatasi. Hanya role Direktur Utama, IT Lead, atau QA &amp; Security yang berwenang membaca log ledger audit.
                    </td>
                  </tr>
                ) : filteredAuditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: "center", padding: "32px", color: "#6e847a" }}>
                      Tidak ada catatan audit yang cocok dengan filter pencarian.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          {/* Table Pagination Footer */}
          <div className="gov-rel-pagination">
            <span>Menampilkan 1 - {filteredAuditLogs.length} dari {auditLogsList.length} audit records</span>
            <div className="gov-rel-page-btns">
              <button className="gov-rel-page-btn" disabled type="button">&lt;</button>
              <button className="gov-rel-page-btn active" type="button">1</button>
              <button className="gov-rel-page-btn" disabled type="button">&gt;</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderSafetyModals() {
    if (!safetyModal) return null;

    if (safetyModal === "GLOBAL_KILL") {
      const isNowHalted = killSwitchSystem.globalHalted;
      return (
        <div className="gov-modal-backdrop" onClick={() => setSafetyModal(null)}>
          <div className="gov-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="gov-modal-header">
              <h3>
                <GovIcon name="warning_triangle" />
                <span>{isNowHalted ? "Konfirmasi Pemulihan Global" : "Konfirmasi Global Kill Switch"}</span>
              </h3>
              <button className="gov-modal-close-btn" onClick={() => setSafetyModal(null)} type="button">✕</button>
            </div>
            <div className="gov-modal-body">
              <div className={`gov-modal-alert ${isNowHalted ? "info" : "danger"}`}>
                <GovIcon name={isNowHalted ? "check" : "warning_triangle"} />
                <div>
                  <strong>{isNowHalted ? "Mengaktifkan Kembali Agen" : "Peringatan Tindakan Kritis"}</strong>
                  <p>
                    {isNowHalted
                      ? "Tindakan ini akan memulihkan sirkuit operasional seluruh agen yang berstatus normal pada workspace ini."
                      : "Tindakan ini akan menghentikan seluruh eksekusi agen aktif secara instan pada workspace ini. Incoming request akan ditolak seketika."}
                  </p>
                </div>
              </div>

              <div className="gov-modal-field">
                <label htmlFor="global-ks-reason">Justifikasi &amp; Alasan Penindakan (Wajib dicatat di Audit Trail):</label>
                <textarea
                  id="global-ks-reason"
                  onChange={(e) => setModalReasonInput(e.target.value)}
                  placeholder={
                    isNowHalted
                      ? "Contoh: Investigasi telah selesai, parameter keamanan telah diverifikasi aman."
                      : "Contoh: Anomali latensi kritis dan dugaan kebocoran data terdeteksi."
                  }
                  rows={3}
                  value={modalReasonInput}
                />
              </div>
            </div>
            <div className="gov-modal-footer">
              <button className="gov-modal-btn-cancel" onClick={() => setSafetyModal(null)} type="button">
                Batal
              </button>
              <button
                className={`gov-modal-btn-confirm ${isNowHalted ? "success" : "danger"}`}
                onClick={handleConfirmGlobalKillSwitch}
                type="button"
              >
                {isNowHalted ? "Konfirmasi Pulihkan Agen" : "Konfirmasi Hentikan Seluruh Agen"}
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (safetyModal === "AGENT_KILL" && actionTargetAgent) {
      const isCurrentlyHalted = actionTargetAgent.status === "HALTED";
      return (
        <div className="gov-modal-backdrop" onClick={() => setSafetyModal(null)}>
          <div className="gov-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="gov-modal-header">
              <h3>
                <GovIcon name="warning_triangle" />
                <span>
                  {isCurrentlyHalted ? "Pulihkan Sirkuit: " : "Isolasi Darurat: "}
                  {actionTargetAgent.agentName}
                </span>
              </h3>
              <button className="gov-modal-close-btn" onClick={() => setSafetyModal(null)} type="button">✕</button>
            </div>
            <div className="gov-modal-body">
              <div className={`gov-modal-alert ${isCurrentlyHalted ? "info" : "danger"}`}>
                <GovIcon name={isCurrentlyHalted ? "check" : "warning_triangle"} />
                <div>
                  <strong>{isCurrentlyHalted ? "Pemulihan Sirkuit Agen" : "Isolasi Sirkuit Agen"}</strong>
                  <p>
                    {isCurrentlyHalted
                      ? `Agen ${actionTargetAgent.agentName} (${actionTargetAgent.currentVersion}) akan kembali melayani request.`
                      : `Agen ${actionTargetAgent.agentName} (${actionTargetAgent.currentVersion}) akan dihentikan dan request gateway akan diputus.`}
                  </p>
                </div>
              </div>

              <div className="gov-modal-field">
                <label htmlFor="agent-ks-reason">Alasan Penindakan (Wajib dicatat di Audit Trail):</label>
                <textarea
                  id="agent-ks-reason"
                  onChange={(e) => setModalReasonInput(e.target.value)}
                  placeholder="Masukkan alasan isolasi / pemulihan agen ini..."
                  rows={3}
                  value={modalReasonInput}
                />
              </div>
            </div>
            <div className="gov-modal-footer">
              <button className="gov-modal-btn-cancel" onClick={() => setSafetyModal(null)} type="button">
                Batal
              </button>
              <button
                className={`gov-modal-btn-confirm ${isCurrentlyHalted ? "success" : "danger"}`}
                disabled={submittingSafetyAction}
                onClick={handleConfirmAgentHalt}
                type="button"
              >
                {submittingSafetyAction
                  ? "Memproses..."
                  : isCurrentlyHalted
                  ? "Konfirmasi Pulihkan Agen"
                  : "Konfirmasi Isolasi Agen"}
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (safetyModal === "AGENT_ROLLBACK" && actionTargetAgent) {
      const candidates =
        actionTargetAgent.rollbackTargets && actionTargetAgent.rollbackTargets.length > 0
          ? actionTargetAgent.rollbackTargets
          : actionTargetAgent.availableVersions.filter((v) => v !== actionTargetAgent.currentVersion);
      return (
        <div className="gov-modal-backdrop" onClick={() => setSafetyModal(null)}>
          <div className="gov-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="gov-modal-header">
              <h3>
                <GovIcon name="clock" />
                <span>Rollback Versi: {actionTargetAgent.agentName}</span>
              </h3>
              <button className="gov-modal-close-btn" onClick={() => setSafetyModal(null)} type="button">✕</button>
            </div>
            <div className="gov-modal-body">
              <div className="gov-modal-alert warning">
                <GovIcon name="warning_triangle" />
                <div>
                  <strong>Rollback Versi Rilis</strong>
                  <p>
                    Versi aktif ({actionTargetAgent.currentVersion}) akan dikembalikan ke versi target sebelumnya.
                    Seluruh kontrak, tools, dan konfigurasi rilis akan disinkronkan kembali dari backend.
                  </p>
                </div>
              </div>

              {candidates.length === 0 ? (
                <div className="gov-modal-alert danger">
                  <GovIcon name="warning_triangle" />
                  <p>Tidak ada target versi stabil sebelumnya yang valid untuk di-rollback pada agen ini.</p>
                </div>
              ) : (
                <div className="gov-modal-field">
                  <label htmlFor="rollback-version-select">Pilih Versi Target Stabil:</label>
                  <select
                    id="rollback-version-select"
                    onChange={(e) => setRollbackTargetVersion(e.target.value)}
                    value={rollbackTargetVersion || candidates[0] || ""}
                  >
                    {candidates.map((ver) => (
                      <option key={ver} value={ver}>
                        {ver} (Stabil Terverifikasi)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="gov-modal-field">
                <label htmlFor="rollback-reason">Alasan Rollback &amp; Referensi Tiket Masalah:</label>
                <textarea
                  id="rollback-reason"
                  onChange={(e) => setModalReasonInput(e.target.value)}
                  placeholder="Contoh: Terdeteksi deviasi logika rekonsiliasi pada rilis v0.2.0, rollback ke v0.1.2 sesuai tiket SEC-902."
                  rows={3}
                  value={modalReasonInput}
                />
              </div>
            </div>
            <div className="gov-modal-footer">
              <button className="gov-modal-btn-cancel" onClick={() => setSafetyModal(null)} type="button">
                Batal
              </button>
              <button
                className="gov-modal-btn-confirm warning"
                disabled={submittingSafetyAction || candidates.length === 0}
                onClick={handleConfirmRollback}
                type="button"
              >
                {submittingSafetyAction ? "Memproses..." : "Eksekusi Rollback Versi"}
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (safetyModal === "SUSPEND_AGENT" && actionTargetAgent) {
      return (
        <div className="gov-modal-backdrop" onClick={() => setSafetyModal(null)}>
          <div className="gov-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="gov-modal-header">
              <h3>
                <GovIcon name="pause" />
                <span>Tangguhkan Agen: {actionTargetAgent.agentName}</span>
              </h3>
              <button className="gov-modal-close-btn" onClick={() => setSafetyModal(null)} type="button">✕</button>
            </div>
            <div className="gov-modal-body">
              <div className="gov-modal-alert warning">
                <GovIcon name="warning_triangle" />
                <div>
                  <strong>Penangguhan Administratif oleh Direktur</strong>
                  <p>
                    Agen {actionTargetAgent.agentName} ({actionTargetAgent.currentVersion}) akan dialihkan ke status SUSPENDED.
                    Eksekusi runtime akan dihentikan hingga dilakukan review atau release baru.
                  </p>
                </div>
              </div>

              <div className="gov-modal-field">
                <label htmlFor="suspend-reason-input">Alasan Penangguhan (Wajib):</label>
                <textarea
                  id="suspend-reason-input"
                  onChange={(e) => setModalReasonInput(e.target.value)}
                  placeholder="Masukkan alasan penangguhan agen..."
                  rows={3}
                  value={modalReasonInput}
                />
              </div>
            </div>
            <div className="gov-modal-footer">
              <button className="gov-modal-btn-cancel" onClick={() => setSafetyModal(null)} type="button">
                Batal
              </button>
              <button
                className="gov-modal-btn-confirm danger"
                disabled={submittingSafetyAction || !modalReasonInput.trim()}
                onClick={handleConfirmSuspend}
                type="button"
              >
                {submittingSafetyAction ? "Memproses..." : "Konfirmasi Penangguhan"}
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (safetyModal === "EDIT_AGENT_DRAFT" && editingAgentDraft && agentDraftForm) {
      return (
        <div className="gov-modal-backdrop" onClick={() => setSafetyModal(null)}>
          <div className="gov-modal-box" style={{ maxWidth: "680px" }} onClick={(e) => e.stopPropagation()}>
            <div className="gov-modal-header">
              <h3>
                <GovIcon name="gear" />
                <span>Edit Draft Agent: {editingAgentDraft.name}</span>
              </h3>
              <button className="gov-modal-close-btn" onClick={() => setSafetyModal(null)} type="button">✕</button>
            </div>
            <div className="gov-modal-body" style={{ maxHeight: "70vh", overflowY: "auto", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div className="gov-modal-field">
                <label htmlFor="edit-agent-name">Nama Agent:</label>
                <input
                  id="edit-agent-name"
                  type="text"
                  value={agentDraftForm.name}
                  onChange={(e) => setAgentDraftForm({ ...agentDraftForm, name: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #d8e2dc", borderRadius: "8px" }}
                />
              </div>
              <div className="gov-modal-field">
                <label htmlFor="edit-agent-objective">Tujuan / Objective:</label>
                <textarea
                  id="edit-agent-objective"
                  rows={2}
                  value={agentDraftForm.objective}
                  onChange={(e) => setAgentDraftForm({ ...agentDraftForm, objective: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #d8e2dc", borderRadius: "8px" }}
                />
              </div>
              <div className="gov-modal-field">
                <label htmlFor="edit-agent-input-schema">Input Schema (JSON):</label>
                <textarea
                  id="edit-agent-input-schema"
                  rows={3}
                  value={agentDraftForm.inputSchema}
                  onChange={(e) => setAgentDraftForm({ ...agentDraftForm, inputSchema: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #d8e2dc", borderRadius: "8px", fontFamily: "monospace", fontSize: "0.85rem" }}
                />
              </div>
              <div className="gov-modal-field">
                <label htmlFor="edit-agent-output-schema">Output Schema (JSON):</label>
                <textarea
                  id="edit-agent-output-schema"
                  rows={3}
                  value={agentDraftForm.outputSchema}
                  onChange={(e) => setAgentDraftForm({ ...agentDraftForm, outputSchema: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #d8e2dc", borderRadius: "8px", fontFamily: "monospace", fontSize: "0.85rem" }}
                />
              </div>
              <div className="gov-modal-field">
                <label htmlFor="edit-agent-forbidden-actions">Forbidden Actions (satu per baris):</label>
                <textarea
                  id="edit-agent-forbidden-actions"
                  rows={2}
                  value={agentDraftForm.forbiddenActions}
                  onChange={(e) => setAgentDraftForm({ ...agentDraftForm, forbiddenActions: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #d8e2dc", borderRadius: "8px", fontFamily: "monospace", fontSize: "0.85rem" }}
                />
              </div>
              <div className="gov-modal-field">
                <label htmlFor="edit-agent-timeout">Timeout (detik):</label>
                <input
                  id="edit-agent-timeout"
                  type="number"
                  value={agentDraftForm.timeoutSeconds}
                  onChange={(e) => setAgentDraftForm({ ...agentDraftForm, timeoutSeconds: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #d8e2dc", borderRadius: "8px" }}
                />
              </div>
            </div>
            <div className="gov-modal-footer">
              <button className="gov-modal-btn-cancel" onClick={() => setSafetyModal(null)} type="button">
                Batal
              </button>
              <button
                className="gov-modal-btn-confirm"
                disabled={submittingSafetyAction || !agentDraftForm.name.trim()}
                onClick={handleSaveEditAgentDraft}
                type="button"
              >
                {submittingSafetyAction ? "Menyimpan..." : "Simpan Perubahan Draft"}
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (safetyModal === "AUDIT_INSPECT" && inspectAuditItem) {
      return (
        <div className="gov-modal-backdrop" onClick={() => setSafetyModal(null)}>
          <div className="gov-modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "640px" }}>
            <div className="gov-modal-header">
              <h3>
                <GovIcon name="shield" />
                <span>Audit Record Inspection</span>
              </h3>
              <button className="gov-modal-close-btn" onClick={() => setSafetyModal(null)} type="button">✕</button>
            </div>
            <div className="gov-modal-body">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <strong style={{ color: "#111827", fontSize: "0.95rem" }}>
                    {inspectAuditItem.actionTitle}
                  </strong>
                  <div style={{ color: "#6b7280", fontSize: "0.75rem", fontFamily: "ui-monospace, monospace" }}>
                    ID: {inspectAuditItem.id} · {inspectAuditItem.action}
                  </div>
                </div>
                <span className={`gov-audit-sev-badge ${inspectAuditItem.severity.toLowerCase()}`}>
                  {inspectAuditItem.severity}
                </span>
              </div>

              <div
                style={{
                  background: "#f8faf9",
                  border: "1px solid #e2eae4",
                  borderRadius: "8px",
                  padding: "12px 14px",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "10px",
                  fontSize: "0.78rem",
                }}
              >
                <div>
                  <span style={{ color: "#6b7280", display: "block" }}>Pelaku (Actor):</span>
                  <strong>
                    {inspectAuditItem.actor.name} ({inspectAuditItem.actor.role})
                  </strong>
                </div>
                <div>
                  <span style={{ color: "#6b7280", display: "block" }}>Waktu Kejadian:</span>
                  <strong>{inspectAuditItem.occurredAt}</strong>
                </div>
                <div>
                  <span style={{ color: "#6b7280", display: "block" }}>Entitas Sasaran:</span>
                  <span className="gov-version-tag stable">{inspectAuditItem.entityId}</span>
                </div>
                <div>
                  <span style={{ color: "#6b7280", display: "block" }}>Kategori Entitas:</span>
                  <strong>{inspectAuditItem.entityType}</strong>
                </div>
              </div>

              <div className="gov-modal-alert info" style={{ margin: 0 }}>
                <GovIcon name="check" />
                <div>
                  <strong>Recorded Audit Evidence</strong>
                  <div
                    style={{
                      fontFamily: "ui-monospace, monospace",
                      fontSize: "0.72rem",
                      wordBreak: "break-all",
                    }}
                  >
                    Correlation ID / Event ID: {inspectAuditItem.hash}
                  </div>
                </div>
              </div>

              <div className="gov-modal-field">
                <label>Raw Metadata Payload &amp; Audit Trace:</label>
                <pre className="gov-json-viewer">
                  {JSON.stringify({ ...inspectAuditItem }, null, 2)}
                </pre>
              </div>
            </div>
            <div className="gov-modal-footer">
              <button className="gov-modal-btn-cancel" onClick={() => setSafetyModal(null)} type="button">
                Tutup
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (safetyModal === "REQUEST_NEW_AGENT") {
      return (
        <div className="gov-modal-backdrop" onClick={() => setSafetyModal(null)}>
          <div className="gov-modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "600px" }}>
            <div className="gov-modal-header">
              <h3>
                <GovIcon name="bot" />
                <span>Request New Agent (Genesis Designer)</span>
              </h3>
              <button className="gov-modal-close-btn" onClick={() => setSafetyModal(null)} type="button">✕</button>
            </div>
            <div className="gov-modal-body">
              <div className="gov-modal-alert info" style={{ margin: 0 }}>
                <GovIcon name="info_circle" />
                <div>
                  <strong>Requirement-based Agent Draft Generation</strong>
                  <p>
                    Agen baru akan dibuat sebagai <code>DRAFT</code> berdasar requirement kebutuhan bisnis.
                    Kontrak aman deterministik, policy LLM, dan kriteria pengujian awal digenerate otomatis.
                  </p>
                </div>
              </div>

              <div className="gov-modal-field">
                <label htmlFor="modal-agent-name">Nama Agen Operasional:</label>
                <input
                  id="modal-agent-name"
                  onChange={(e) => {
                    setNewAgentName(e.target.value);
                    if (!newAgentKey) {
                      setNewAgentKey(e.target.value.toUpperCase().replace(/[^A-Z0-9]+/g, "_").slice(0, 30));
                    }
                  }}
                  placeholder="Contoh: Property Compliance Monitor"
                  type="text"
                  value={newAgentName}
                />
              </div>

              <div className="gov-modal-field">
                <label htmlFor="modal-agent-key">Agent Key (Identifier Unik, Huruf Kapital &amp; Underscore):</label>
                <input
                  id="modal-agent-key"
                  onChange={(e) => setNewAgentKey(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ""))}
                  placeholder="Contoh: PROPERTY_COMPLIANCE_MONITOR"
                  type="text"
                  value={newAgentKey}
                />
              </div>

              <div className="gov-modal-field">
                <label htmlFor="modal-agent-req">Requirement &amp; Outcome Operasional (Min. 20 Karakter):</label>
                <textarea
                  id="modal-agent-req"
                  onChange={(e) => setNewAgentRequirement(e.target.value)}
                  placeholder="Jelaskan tujuan spesifik, batasan tindakan, dan format output yang diinginkan dari agen ini..."
                  rows={4}
                  value={newAgentRequirement}
                />
                <small style={{ color: newAgentRequirement.trim().length >= 20 ? "#15803d" : "#b91c1c", fontSize: "0.72rem" }}>
                  {newAgentRequirement.trim().length} / 20 karakter minimum
                </small>
              </div>
            </div>
            <div className="gov-modal-footer">
              <button className="gov-modal-btn-cancel" disabled={submittingAgent} onClick={() => setSafetyModal(null)} type="button">
                Batal
              </button>
              <button
                className="gov-modal-btn-confirm primary"
                disabled={submittingAgent || newAgentRequirement.trim().length < 20}
                onClick={handleCreateAgentDraft}
                type="button"
              >
                {submittingAgent ? "Mendaftarkan Draft..." : "Buat Agent DRAFT"}
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (safetyModal === "NEW_RELEASE") {
      const availableDrafts = realAgents;
      return (
        <div className="gov-modal-backdrop" onClick={() => setSafetyModal(null)}>
          <div className="gov-modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "580px" }}>
            <div className="gov-modal-header">
              <h3>
                <GovIcon name="file" />
                <span>Buka Release Request Baru</span>
              </h3>
              <button className="gov-modal-close-btn" onClick={() => setSafetyModal(null)} type="button">✕</button>
            </div>
            <div className="gov-modal-body">
              <div className="gov-modal-alert info" style={{ margin: 0 }}>
                <GovIcon name="info_circle" />
                <div>
                  <strong>Pipeline Governance Release</strong>
                  <p>
                    Membuka permintaan rilis untuk agen terdaftar. Permintaan rilis akan menjalani
                    gate pengujian independen (SoD), business review, technical review, dan persetujuan Direktur.
                  </p>
                </div>
              </div>

              <div className="gov-modal-field">
                <label htmlFor="modal-rel-agent">Pilih Agen Terdaftar:</label>
                <select
                  id="modal-rel-agent"
                  onChange={(e) => setNewReleaseAgentKey(e.target.value)}
                  value={newReleaseAgentKey}
                >
                  <option value="">-- Pilih Agen --</option>
                  {availableDrafts.map((ag) => (
                    <option key={ag.agent_key} value={ag.agent_key}>
                      {ag.name} ({ag.agent_key} · {ag.versions[0]?.semantic_version ?? "v1.0.0"})
                    </option>
                  ))}
                </select>
              </div>

              <div className="gov-modal-field">
                <label htmlFor="modal-rel-req">Requirement &amp; Scope Release (Min. 20 Karakter):</label>
                <textarea
                  id="modal-rel-req"
                  onChange={(e) => setNewReleaseRequirement(e.target.value)}
                  placeholder="Jelaskan tujuan rilis, perubahan fungsional, dan cakupan pengujian yang diharapkan..."
                  rows={4}
                  value={newReleaseRequirement}
                />
                <small style={{ color: newReleaseRequirement.trim().length >= 20 ? "#15803d" : "#b91c1c", fontSize: "0.72rem" }}>
                  {newReleaseRequirement.trim().length} / 20 karakter minimum
                </small>
              </div>
            </div>
            <div className="gov-modal-footer">
              <button className="gov-modal-btn-cancel" disabled={submittingRelease} onClick={() => setSafetyModal(null)} type="button">
                Batal
              </button>
              <button
                className="gov-modal-btn-confirm primary"
                disabled={submittingRelease || !newReleaseAgentKey || newReleaseRequirement.trim().length < 20}
                onClick={handleCreateReleaseRequest}
                type="button"
              >
                {submittingRelease ? "Mengajukan..." : "Buka Release Request"}
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (safetyModal === "NEW_PERMISSION") {
      return (
        <div className="gov-modal-backdrop" onClick={() => setSafetyModal(null)}>
          <div className="gov-modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "600px" }}>
            <div className="gov-modal-header">
              <h3>
                <GovIcon name="shield_check" />
                <span>Daftarkan Permission Policy Baru</span>
              </h3>
              <button className="gov-modal-close-btn" onClick={() => setSafetyModal(null)} type="button">✕</button>
            </div>
            <div className="gov-modal-body">
              <div className="gov-modal-alert info" style={{ margin: 0 }}>
                <GovIcon name="info_circle" />
                <div>
                  <strong>Prinsip Least-Privilege</strong>
                  <p>
                    Setiap hak akses tool, data, atau API agen wajib terdaftar eksplisit. Status awal
                    adalah DRAFT dan membutuhkan otorisasi Direktur Utama / QA Security sebelum aktif.
                  </p>
                </div>
              </div>

              <div className="gov-modal-field">
                <label htmlFor="modal-perm-agent">Pilih Target Agen:</label>
                <select
                  id="modal-perm-agent"
                  onChange={(e) => {
                    const selectedKey = e.target.value;
                    setNewPermAgentKey(selectedKey);
                    const ag = realAgents.find((a) => a.agent_key === selectedKey);
                    const defaultVer =
                      resolveActiveAgentVersion(ag)?.semantic_version ||
                      ag?.versions[0]?.semantic_version ||
                      "1.0.0";
                    setNewPermVersion(defaultVer);
                  }}
                  value={newPermAgentKey}
                >
                  <option value="">-- Pilih Agen --</option>
                  {realAgents.map((ag) => (
                    <option key={ag.agent_key} value={ag.agent_key}>
                      {ag.name} ({ag.agent_key})
                    </option>
                  ))}
                </select>
              </div>

              {(() => {
                const selectedAg = realAgents.find((a) => a.agent_key === newPermAgentKey);
                if (!selectedAg || selectedAg.versions.length === 0) return null;
                return (
                  <div className="gov-modal-field">
                    <label htmlFor="modal-perm-version">Target Versi Agen:</label>
                    <select
                      id="modal-perm-version"
                      onChange={(e) => setNewPermVersion(e.target.value)}
                      value={newPermVersion}
                    >
                      {selectedAg.versions.map((ver) => (
                        <option key={ver.agent_version_id} value={ver.semantic_version}>
                          {ver.semantic_version} ({ver.lifecycle_status})
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })()}

              <div className="gov-modal-field">
                <label htmlFor="modal-perm-key">Permission Key (Contoh: crm.customer.read atau property.query):</label>
                <input
                  id="modal-perm-key"
                  onChange={(e) => setNewPermKey(e.target.value.toLowerCase().replace(/[^a-z0-9_.:]/g, ""))}
                  placeholder="Contoh: crm.customer.read"
                  type="text"
                  value={newPermKey}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                <div className="gov-modal-field">
                  <label htmlFor="modal-perm-mode">Access Mode:</label>
                  <select
                    id="modal-perm-mode"
                    onChange={(e) => setNewPermAccessMode(e.target.value as "READ" | "CREATE_DRAFT" | "UPDATE_SCOPED" | "REQUEST_APPROVAL" | "EXECUTE_APPROVED_ACTION")}
                    value={newPermAccessMode}
                  >
                    <option value="READ">READ (Read-only)</option>
                    <option value="CREATE_DRAFT">CREATE_DRAFT (Draft Creation)</option>
                    <option value="UPDATE_SCOPED">UPDATE_SCOPED (Scoped Update)</option>
                    <option value="REQUEST_APPROVAL">REQUEST_APPROVAL (Approval Required)</option>
                    <option value="EXECUTE_APPROVED_ACTION">EXECUTE_APPROVED_ACTION (Direct Execution)</option>
                  </select>
                </div>
                <div className="gov-modal-field">
                  <label htmlFor="modal-perm-type">Resource Type:</label>
                  <select
                    id="modal-perm-type"
                    onChange={(e) => setNewPermResourceType(e.target.value)}
                    value={newPermResourceType}
                  >
                    <option value="DATA">DATA</option>
                    <option value="TOOL">TOOL</option>
                    <option value="WORKSPACE">WORKSPACE</option>
                    <option value="API">API</option>
                  </select>
                </div>
                <div className="gov-modal-field">
                  <label htmlFor="modal-perm-class">Classification:</label>
                  <select
                    id="modal-perm-class"
                    onChange={(e) => setNewPermClassification(e.target.value as "INTERNAL" | "CONFIDENTIAL" | "RESTRICTED")}
                    value={newPermClassification}
                  >
                    <option value="INTERNAL">INTERNAL</option>
                    <option value="CONFIDENTIAL">CONFIDENTIAL</option>
                    <option value="RESTRICTED">RESTRICTED</option>
                  </select>
                </div>
              </div>

              <div className="gov-modal-field">
                <label htmlFor="modal-perm-cap">Capability Key (Opsional, dot-separated):</label>
                <input
                  id="modal-perm-cap"
                  onChange={(e) => setNewPermCapability(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ""))}
                  placeholder="Contoh: customer.lookup"
                  type="text"
                  value={newPermCapability}
                />
              </div>
            </div>
            <div className="gov-modal-footer">
              <button className="gov-modal-btn-cancel" disabled={submittingPerm} onClick={() => setSafetyModal(null)} type="button">
                Batal
              </button>
              <button
                className="gov-modal-btn-confirm primary"
                disabled={submittingPerm || !canRegisterPermission(actorRoles) || !newPermAgentKey || !newPermKey.trim()}
                onClick={handleCreatePermissionPolicy}
                type="button"
              >
                {submittingPerm ? "Mendaftarkan..." : "Daftarkan Permission"}
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (safetyModal === "UPDATE_BUDGET") {
      return (
        <div className="gov-modal-backdrop" onClick={() => setSafetyModal(null)}>
          <div className="gov-modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "560px" }}>
            <div className="gov-modal-header">
              <h3>
                <GovIcon name="chart" />
                <span>Pembaruan Batas Anggaran (Budget Limits)</span>
              </h3>
              <button className="gov-modal-close-btn" onClick={() => setSafetyModal(null)} type="button">✕</button>
            </div>
            <div className="gov-modal-body">
              <div className="gov-modal-alert info" style={{ margin: 0 }}>
                <GovIcon name="info_circle" />
                <div>
                  <strong>Batas Konsumsi Harian Workspace</strong>
                  <p>
                    Setiap perubahan limit dievaluasi secara deterministik pada runtime guardrail.
                    Jika limit terlampaui, pemanggilan model AI berikutnya akan diblokir otomatis.
                  </p>
                </div>
              </div>

              <div className="gov-modal-field">
                <label htmlFor="modal-budget-req">Daily Request Limit (Jumlah Panggilan Maks/Hari):</label>
                <input
                  id="modal-budget-req"
                  min={1}
                  max={100000}
                  onChange={(e) => setBudgetReqLimit(e.target.value)}
                  type="number"
                  value={budgetReqLimit}
                />
              </div>

              <div className="gov-modal-field">
                <label htmlFor="modal-budget-tok">Daily Output Token Limit:</label>
                <input
                  id="modal-budget-tok"
                  min={1000}
                  max={10000000}
                  onChange={(e) => setBudgetTokenLimit(e.target.value)}
                  type="number"
                  value={budgetTokenLimit}
                />
              </div>

              <div className="gov-modal-field">
                <label htmlFor="modal-budget-cost">Daily Cost Cap USD ($):</label>
                <input
                  id="modal-budget-cost"
                  min={0}
                  max={1000000}
                  onChange={(e) => setBudgetCostCap(e.target.value)}
                  step="0.01"
                  type="number"
                  value={budgetCostCap}
                />
              </div>
            </div>
            <div className="gov-modal-footer">
              <button className="gov-modal-btn-cancel" disabled={submittingBudget} onClick={() => setSafetyModal(null)} type="button">
                Batal
              </button>
              <button
                className="gov-modal-btn-confirm primary"
                disabled={submittingBudget || !canChangeBudget(actorRoles)}
                onClick={handleUpdateBudget}
                type="button"
              >
                {submittingBudget ? "Menyimpan Limit..." : "Simpan Perubahan Limit"}
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (safetyModal === "BUDGET_DETAIL") {
      return (
        <div className="gov-modal-backdrop" onClick={() => setSafetyModal(null)}>
          <div className="gov-modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "680px" }}>
            <div className="gov-modal-header">
              <h3>
                <GovIcon name="chart" />
                <span>Rincian Penggunaan &amp; Alokasi Anggaran</span>
              </h3>
              <button className="gov-modal-close-btn" onClick={() => setSafetyModal(null)} type="button">✕</button>
            </div>
            <div className="gov-modal-body">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                <div style={{ background: "#f8faf9", padding: "14px", borderRadius: "8px", border: "1px solid #e2eae4" }}>
                  <span style={{ fontSize: "0.75rem", color: "#6b7280", display: "block" }}>Total Biaya Hari Ini</span>
                  <strong style={{ fontSize: "1.25rem", color: "#111827" }}>{budgetOverview.usedAmount}</strong>
                  <small style={{ color: "#6b7280", display: "block", marginTop: "4px" }}>Cap: {budgetOverview.totalAmount}</small>
                </div>
                <div style={{ background: "#f8faf9", padding: "14px", borderRadius: "8px", border: "1px solid #e2eae4" }}>
                  <span style={{ fontSize: "0.75rem", color: "#6b7280", display: "block" }}>Output Tokens</span>
                  <strong style={{ fontSize: "1.25rem", color: "#111827" }}>{budgetOverview.dailyLimits.outputTokenLimit.used}</strong>
                  <small style={{ color: "#6b7280", display: "block", marginTop: "4px" }}>Max: {budgetOverview.dailyLimits.outputTokenLimit.max}</small>
                </div>
                <div style={{ background: "#f8faf9", padding: "14px", borderRadius: "8px", border: "1px solid #e2eae4" }}>
                  <span style={{ fontSize: "0.75rem", color: "#6b7280", display: "block" }}>Request Executed</span>
                  <strong style={{ fontSize: "1.25rem", color: "#111827" }}>{budgetOverview.dailyLimits.requestLimit.used}</strong>
                  <small style={{ color: "#6b7280", display: "block", marginTop: "4px" }}>Max: {budgetOverview.dailyLimits.requestLimit.max}</small>
                </div>
              </div>

              <div>
                <strong style={{ color: "#111827", fontSize: "0.86rem", display: "block", marginBottom: "8px" }}>
                  Riwayat Eksekusi Terkini ({realRuns.length} Runs Tercatat):
                </strong>
                <div style={{ maxHeight: "200px", overflowY: "auto", border: "1px solid #e2eae4", borderRadius: "8px" }}>
                  <table style={{ width: "100%", fontSize: "0.76rem", borderCollapse: "collapse" }}>
                    <thead style={{ background: "#f3f4f6", borderBottom: "1px solid #e5e7eb" }}>
                      <tr>
                        <th style={{ padding: "8px 10px", textAlign: "left" }}>Agent</th>
                        <th style={{ padding: "8px 10px", textAlign: "left" }}>Status</th>
                        <th style={{ padding: "8px 10px", textAlign: "right" }}>Tokens</th>
                        <th style={{ padding: "8px 10px", textAlign: "right" }}>Est. Cost</th>
                        <th style={{ padding: "8px 10px", textAlign: "right" }}>Waktu</th>
                      </tr>
                    </thead>
                    <tbody>
                      {realRuns.map((rn) => (
                        <tr key={rn.agent_run_id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                          <td style={{ padding: "8px 10px", fontWeight: 600 }}>{rn.agent_key}</td>
                          <td style={{ padding: "8px 10px" }}>
                            <span className={`gov-run-status-badge ${rn.status === "COMPLETED" ? "success" : "failed"}`}>
                              {rn.status}
                            </span>
                          </td>
                          <td style={{ padding: "8px 10px", textAlign: "right" }}>{formatInteger(rn.output_tokens || 0)}</td>
                          <td style={{ padding: "8px 10px", textAlign: "right" }}>${Number(rn.estimated_cost_usd || 0).toFixed(4)}</td>
                          <td style={{ padding: "8px 10px", textAlign: "right", color: "#6b7280" }}>{formatDateTime(rn.created_at)}</td>
                        </tr>
                      ))}
                      {realRuns.length === 0 && (
                        <tr>
                          <td colSpan={5} style={{ textAlign: "center", padding: "20px", color: "#6b7280" }}>
                            Belum ada pemanggilan runtime tercatat hari ini.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className="gov-modal-footer">
              <button className="gov-modal-btn-cancel" onClick={() => setSafetyModal(null)} type="button">
                Tutup
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (safetyModal === "RUN_AGENT") {
      return (
        <div className="gov-modal-backdrop" onClick={() => setSafetyModal(null)}>
          <div className="gov-modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "640px" }}>
            <div className="gov-modal-header">
              <h3>
                <GovIcon name="play_triangle" />
                <span>Uji Eksekusi Runtime: {targetRunAgentName || targetRunAgentKey}</span>
              </h3>
              <button className="gov-modal-close-btn" onClick={() => setSafetyModal(null)} type="button">✕</button>
            </div>
            <div className="gov-modal-body">
              <div className="gov-modal-alert info" style={{ margin: 0 }}>
                <GovIcon name="info_circle" />
                <div>
                  <strong>Eksekusi Aman Melalui Guardrail Platform</strong>
                  <p>
                    Pemanggilan agen diverifikasi terhadap permission, policy token, dan budget limit.
                    Hasil eksekusi deterministik akan dicatat langsung ke Runtime Monitoring &amp; Audit Trail.
                  </p>
                </div>
              </div>

              <div className="gov-modal-field">
                <label htmlFor="modal-run-input">Input Payload / Query (JSON atau Text):</label>
                <textarea
                  id="modal-run-input"
                  onChange={(e) => setRunInputText(e.target.value)}
                  placeholder='{"query": "Lakukan pengecekan..."}'
                  rows={4}
                  style={{ fontFamily: "ui-monospace, monospace" }}
                  value={runInputText}
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <input
                  id="modal-run-test-mode"
                  checked={runIsTesting}
                  onChange={(e) => setRunIsTesting(e.target.checked)}
                  type="checkbox"
                />
                <label htmlFor="modal-run-test-mode" style={{ fontSize: "0.78rem", color: "#374151" }}>
                  Mode Pengujian Eksplisit (Izinkan eksekusi agen berstatus DRAFT)
                </label>
              </div>

              {runResult && (
                <div>
                  <strong style={{ fontSize: "0.82rem", color: "#111827", display: "block", marginBottom: "6px" }}>
                    Hasil Eksekusi (Status: {String(runResult.status ?? "COMPLETED")}):
                  </strong>
                  <pre className="gov-json-viewer">
                    {JSON.stringify(runResult, null, 2)}
                  </pre>
                </div>
              )}
            </div>
            <div className="gov-modal-footer">
              <button className="gov-modal-btn-cancel" disabled={runningAgent} onClick={() => setSafetyModal(null)} type="button">
                {runResult ? "Selesai" : "Batal"}
              </button>
              <button
                className="gov-modal-btn-confirm success"
                disabled={runningAgent || !runInputText.trim()}
                onClick={handleExecuteRunAgent}
                type="button"
              >
                {runningAgent ? "Menjalankan Agen..." : "Jalankan Agen (Execute Run)"}
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (safetyModal === "RELEASE_INSPECT" && inspectReleaseItem) {
      const detail = releaseDetail ?? releaseDetailsMap[inspectReleaseItem.id];
      const testCases = detail?.test_cases ?? [];
      const latestRuns = detail ? latestRunByTestCase(detail.test_runs) : new Map();
      const passedCount = testCases.filter((tc) => latestRuns.get(tc.test_case_id)?.status === "PASSED").length;
      const all5TestsConfigured = testCases.length >= 5;
      const all5TestsPassed = all5TestsConfigured && passedCount === 5;
      const isDraft = (detail?.state ?? inspectReleaseItem.status) === "DRAFT";
      const isInReview = (detail?.state ?? inspectReleaseItem.status) === "IN_REVIEW";
      const isApproved = (detail?.state ?? inspectReleaseItem.status) === "APPROVED";
      const isReleased = (detail?.state ?? inspectReleaseItem.status) === "RELEASED";
      const isRejected = (detail?.state ?? inspectReleaseItem.status) === "REJECTED";

      const businessReview = detail?.reviews?.find((r) => r.review_gate === "BUSINESS");
      const technicalReview = detail?.reviews?.find((r) => r.review_gate === "TECHNICAL");
      const dualGateApproved = businessReview?.decision === "APPROVED" && technicalReview?.decision === "APPROVED";

      // Stepper Stage calculations:
      const stage1Status = all5TestsConfigured ? "completed" : "active";
      const stage2Status = !isDraft ? "completed" : all5TestsConfigured ? "active" : "waiting";
      const stage3Status = isRejected ? "rejected" : isApproved || isReleased ? "completed" : isInReview ? "active" : "waiting";
      const stage4Status = isReleased ? "completed" : isApproved ? "active" : (isInReview && dualGateApproved) ? "active" : "waiting";

      return (
        <div className="gov-modal-backdrop" onClick={() => setSafetyModal(null)}>
          <div className="gov-modal-box pipeline-modal" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="gov-modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span className="gov-rel-icon" style={{ background: "rgba(12, 59, 47, 0.12)", color: "#0c3b2f" }}>
                  <GovIcon name="file" />
                </span>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.05rem" }}>
                    Separation of Duties (SoD) Release Pipeline
                  </h3>
                  <p style={{ margin: 0, fontSize: "0.76rem", color: "#6b7280" }}>
                    {inspectReleaseItem.agentName} ({inspectReleaseItem.agentKey}) &bull; Versi {detail?.semantic_version ?? inspectReleaseItem.version}
                  </p>
                </div>
              </div>
              <button className="gov-modal-close-btn" onClick={() => setSafetyModal(null)} type="button">✕</button>
            </div>

            {/* Stepper Bar */}
            <div style={{ padding: "14px 24px 0 24px", background: "#ffffff" }}>
              <div className="gov-pipe-stepper">
                {/* Step 1: Maker / IT Lead */}
                <div className={`gov-pipe-step ${stage1Status}`}>
                  <div className="gov-pipe-step-num">1</div>
                  <div className="gov-pipe-step-text">
                    <span className="gov-pipe-step-title">IT Lead (Maker)</span>
                    <span className="gov-pipe-step-desc">
                      {all5TestsConfigured ? "5 Test Didaftarkan" : "Setup Test Suites"}
                    </span>
                  </div>
                </div>

                {/* Step 2: Checker / QA */}
                <div className={`gov-pipe-step ${stage2Status}`}>
                  <div className="gov-pipe-step-num">2</div>
                  <div className="gov-pipe-step-text">
                    <span className="gov-pipe-step-title">QA &amp; Security</span>
                    <span className="gov-pipe-step-desc">
                      {!isDraft ? "Evidence Lulus" : `${passedCount}/5 Suite Lulus`}
                    </span>
                  </div>
                </div>

                {/* Step 3: Dual Review Gates */}
                <div className={`gov-pipe-step ${stage3Status}`}>
                  <div className="gov-pipe-step-num">3</div>
                  <div className="gov-pipe-step-text">
                    <span className="gov-pipe-step-title">Dual Review Gates</span>
                    <span className="gov-pipe-step-desc">
                      {dualGateApproved ? "Bisnis & Teknis OK" : isRejected ? "Ditolak Review" : isInReview ? "Dalam Evaluasi" : "Menunggu QA"}
                    </span>
                  </div>
                </div>

                {/* Step 4: Executive Director */}
                <div className={`gov-pipe-step ${stage4Status}`}>
                  <div className="gov-pipe-step-num">4</div>
                  <div className="gov-pipe-step-text">
                    <span className="gov-pipe-step-title">Direktur Utama</span>
                    <span className="gov-pipe-step-desc">
                      {isReleased ? "Rilis Operasional" : isApproved ? "Siap Staging" : "Approval Final"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Subtabs Bar */}
            <div style={{ padding: "12px 24px 0 24px", background: "#ffffff" }}>
              <div className="gov-pipe-subtabs">
                <button
                  className={`gov-pipe-subtab-btn ${inspectSubTab === "pipeline" ? "active" : ""}`}
                  onClick={() => setInspectSubTab("pipeline")}
                  type="button"
                >
                  Alur Pipeline &amp; Tindakan
                </button>
                <button
                  className={`gov-pipe-subtab-btn ${inspectSubTab === "tests" ? "active" : ""}`}
                  onClick={() => setInspectSubTab("tests")}
                  type="button"
                >
                  Test Cases ({passedCount}/{testCases.length})
                </button>
                <button
                  className={`gov-pipe-subtab-btn ${inspectSubTab === "reviews" ? "active" : ""}`}
                  onClick={() => setInspectSubTab("reviews")}
                  type="button"
                >
                  Review Gates (Bisnis &amp; Teknis)
                </button>
                <button
                  className={`gov-pipe-subtab-btn ${inspectSubTab === "audit" ? "active" : ""}`}
                  onClick={() => setInspectSubTab("audit")}
                  type="button"
                >
                  Audit &amp; Detail Payload
                </button>
              </div>
            </div>

            {/* Modal Scrollable Body */}
            <div className="gov-modal-body-scroll">
              {loadingReleaseDetail && (
                <div style={{ textAlign: "center", padding: "20px", color: "#6b7280" }}>
                  <p>Memuat rincian state pipeline rilis...</p>
                </div>
              )}

              {!loadingReleaseDetail && inspectSubTab === "pipeline" && (
                <>
                  {/* Summary Bar */}
                  <div className="gov-pipe-header-bar">
                    <div>
                      <span style={{ fontSize: "0.72rem", color: "#6b7280", display: "block" }}>Change Request ID:</span>
                      <strong style={{ fontSize: "0.84rem", fontFamily: "monospace" }}>{inspectReleaseItem.id}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: "0.72rem", color: "#6b7280", display: "block" }}>Status Pipeline:</span>
                      <span className={`gov-rel-status ${
                        (detail?.state ?? inspectReleaseItem.status).toLowerCase()
                      }`}>
                        {(detail?.state ?? inspectReleaseItem.status).replace("_", " ")}
                      </span>
                    </div>
                    <div>
                      <span style={{ fontSize: "0.72rem", color: "#6b7280", display: "block" }}>Maker (IT Lead):</span>
                      <strong style={{ fontSize: "0.82rem" }}>
                        {detail?.requested_by_user_id ? detail.requested_by_user_id.slice(0, 10) : inspectReleaseItem.requester}
                      </strong>
                    </div>
                    <div>
                      <span style={{ fontSize: "0.72rem", color: "#6b7280", display: "block" }}>Checker (QA):</span>
                      <strong style={{ fontSize: "0.82rem" }}>
                        {detail?.checker_user_id ? detail.checker_user_id.slice(0, 10) : "Belum dieksekusi"}
                      </strong>
                    </div>
                  </div>

                  {/* Stage 1: Maker Handover */}
                  <div className="gov-callout-action stage1">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
                      <div>
                        <strong style={{ fontSize: "0.88rem", color: "#1e3a8a", display: "block" }}>
                          Tahap 1 — Maker (IT Lead): Pendaftaran &amp; Handover 5 Test Cases
                        </strong>
                        <p style={{ margin: "4px 0 0 0", fontSize: "0.78rem", color: "#3b82f6" }}>
                          IT Lead mendaftarkan minimal 5 kategori pengujian: POSITIVE, NEGATIVE, REGRESSION, SECURITY, dan RECOVERY.
                        </p>
                      </div>
                      <span className={`gov-test-status-badge ${testCases.length >= 5 ? "passed" : "not-run"}`}>
                        {testCases.length >= 5 ? "5 KATEGORI TERDAFTAR" : `${testCases.length}/5 DIDAFTARKAN`}
                      </span>
                    </div>

                    {testCases.length === 0 && (
                      <div className="gov-pipe-btn-group" style={{ marginTop: "6px" }}>
                        <button
                          className="gov-modal-btn-confirm primary"
                          disabled={pipelineWorking || !canMakeRelease(actorRoles)}
                          title={!canMakeRelease(actorRoles) ? "Pendaftaran test suite memerlukan otorisasi Maker (IT_ADMIN)" : undefined}
                          style={!canMakeRelease(actorRoles) ? { opacity: 0.5, cursor: "not-allowed" } : undefined}
                          onClick={() => handleGenerateDefaultTests(inspectReleaseItem.id, inspectReleaseItem.agentKey)}
                          type="button"
                        >
                          {pipelineWorking ? "Mendaftarkan..." : "Daftarkan 5 Kategori Test Suites (Handover ke QA)"}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Stage 2: Checker QA Execution & Review Submission */}
                  <div className="gov-callout-action stage2">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
                      <div>
                        <strong style={{ fontSize: "0.88rem", color: "#065f46", display: "block" }}>
                          Tahap 2 — Checker (QA &amp; Security): Eksekusi Pengujian &amp; Penyerahan Evidence
                        </strong>
                        <p style={{ margin: "4px 0 0 0", fontSize: "0.78rem", color: "#047857" }}>
                          QA &amp; Security mengeksekusi ke-5 test cases dan memastikan ada minimal 1 runtime agent run valid sebelum menyerahkan hasil ke Review Gates.
                        </p>
                      </div>
                      <span className={`gov-test-status-badge ${!isDraft ? "passed" : all5TestsPassed ? "passed" : "not-run"}`}>
                        {!isDraft ? "EVIDENCE DISERAHKAN" : `${passedCount}/${testCases.length} LULUS`}
                      </span>
                    </div>

                    {isDraft && testCases.length > 0 && (
                      <div className="gov-pipe-btn-group" style={{ marginTop: "6px" }}>
                        <button
                          className="gov-modal-btn-confirm"
                          disabled={batchRunningTests || pipelineWorking || !canCheckRelease(actorRoles)}
                          title={!canCheckRelease(actorRoles) ? "Eksekusi test memerlukan otorisasi Checker (QA_ASSURANCE atau TECHNICAL_REVIEWER)" : undefined}
                          style={!canCheckRelease(actorRoles) ? { opacity: 0.5, cursor: "not-allowed", background: "#0c3b2f", color: "#ffffff" } : { background: "#0c3b2f", color: "#ffffff" }}
                          onClick={() => handleExecuteAllTests(inspectReleaseItem.id)}
                          type="button"
                        >
                          {batchRunningTests ? "Mengeksekusi 5 Test..." : "Jalankan Semua 5 Test Cases (QA Run)"}
                        </button>

                        <button
                          className="gov-modal-btn-confirm primary"
                          disabled={pipelineWorking || batchRunningTests || !all5TestsPassed || !canCheckRelease(actorRoles)}
                          title={
                            !canCheckRelease(actorRoles)
                              ? "Penyerahan hasil review memerlukan otorisasi Checker (QA_ASSURANCE atau TECHNICAL_REVIEWER)"
                              : !all5TestsPassed
                              ? "Semua 5 test cases harus lulus sebelum diserahkan ke Review Gate"
                              : undefined
                          }
                          style={!canCheckRelease(actorRoles) || !all5TestsPassed ? { opacity: 0.5, cursor: "not-allowed" } : undefined}
                          onClick={() => handleSubmitForReview(inspectReleaseItem.id)}
                          type="button"
                        >
                          {pipelineWorking ? "Menyerahkan..." : "Serahkan Hasil ke Review Gate (Submit Review)"}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Stage 3: Dual Review Gates (Business & Technical) */}
                  <div className="gov-callout-action stage3">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
                      <div>
                        <strong style={{ fontSize: "0.88rem", color: "#581c87", display: "block" }}>
                          Tahap 3 — Dual Review Gates (Business &amp; Technical Reviewers)
                        </strong>
                        <p style={{ margin: "4px 0 0 0", fontSize: "0.78rem", color: "#7e22ce" }}>
                          Evaluasi independen dua arah: Gate Bisnis memverifikasi kesesuaian SOP, Gate Teknis memverifikasi integritas arsitektur &amp; guardrail.
                        </p>
                      </div>
                      <span className={`gov-test-status-badge ${dualGateApproved ? "passed" : isRejected ? "failed" : isInReview ? "pending" : "not-run"}`}>
                        {dualGateApproved ? "KEDUA GATE APPROVED" : isRejected ? "REVIEW DITOLAK" : isInReview ? "MENUNGGU EVALUASI" : "BELUM DIBUKA"}
                      </span>
                    </div>

                    <div className="gov-gate-grid" style={{ marginTop: "6px" }}>
                      {/* Business Gate Card */}
                      <div className={`gov-gate-card ${businessReview?.decision === "APPROVED" ? "approved" : businessReview?.decision === "REJECTED" ? "rejected" : ""}`}>
                        <div className="gov-gate-header">
                          <span className="gov-gate-title">Gate 1: Business Review</span>
                          <span className={`gov-gate-status ${businessReview?.decision === "APPROVED" ? "approved" : businessReview?.decision === "REJECTED" ? "rejected" : "pending"}`}>
                            {businessReview?.decision ?? (isInReview ? "PENDING" : "LOCKED")}
                          </span>
                        </div>
                        <p style={{ fontSize: "0.74rem", color: "#6b7280", margin: 0 }}>
                          {businessReview?.notes ?? (isInReview ? "Menunggu keputusan Business Reviewer." : "Terbuka setelah QA menyerahkan evidence.")}
                        </p>
                        {isInReview && !businessReview && (
                          <div className="gov-gate-actions">
                            <button
                              className="gov-modal-btn-confirm success"
                              disabled={submittingReviewGate === "BUSINESS" || !canReviewBusinessGate(actorRoles)}
                              title={!canReviewBusinessGate(actorRoles) ? "Evaluasi Business Gate memerlukan peran BUSINESS_REVIEWER" : undefined}
                              style={!canReviewBusinessGate(actorRoles) ? { opacity: 0.5, cursor: "not-allowed", padding: "6px 12px", fontSize: "0.74rem" } : { padding: "6px 12px", fontSize: "0.74rem" }}
                              onClick={() => handleSubmitReviewGate(inspectReleaseItem.id, "BUSINESS", "APPROVED")}
                              type="button"
                            >
                              Approve Bisnis
                            </button>
                            <button
                              className="gov-modal-btn-cancel"
                              disabled={submittingReviewGate === "BUSINESS" || !canReviewBusinessGate(actorRoles)}
                              title={!canReviewBusinessGate(actorRoles) ? "Evaluasi Business Gate memerlukan peran BUSINESS_REVIEWER" : undefined}
                              style={!canReviewBusinessGate(actorRoles) ? { opacity: 0.5, cursor: "not-allowed", padding: "6px 12px", fontSize: "0.74rem" } : { padding: "6px 12px", fontSize: "0.74rem" }}
                              onClick={() => handleSubmitReviewGate(inspectReleaseItem.id, "BUSINESS", "REJECTED")}
                              type="button"
                            >
                              Reject Bisnis
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Technical Gate Card */}
                      <div className={`gov-gate-card ${technicalReview?.decision === "APPROVED" ? "approved" : technicalReview?.decision === "REJECTED" ? "rejected" : ""}`}>
                        <div className="gov-gate-header">
                          <span className="gov-gate-title">Gate 2: Technical Review</span>
                          <span className={`gov-gate-status ${technicalReview?.decision === "APPROVED" ? "approved" : technicalReview?.decision === "REJECTED" ? "rejected" : "pending"}`}>
                            {technicalReview?.decision ?? (isInReview ? "PENDING" : "LOCKED")}
                          </span>
                        </div>
                        <p style={{ fontSize: "0.74rem", color: "#6b7280", margin: 0 }}>
                          {technicalReview?.notes ?? (isInReview ? "Menunggu keputusan Technical Reviewer." : "Terbuka setelah QA menyerahkan evidence.")}
                        </p>
                        {isInReview && !technicalReview && (
                          <div className="gov-gate-actions">
                            <button
                              className="gov-modal-btn-confirm success"
                              disabled={submittingReviewGate === "TECHNICAL" || !canReviewTechnicalGate(actorRoles)}
                              title={!canReviewTechnicalGate(actorRoles) ? "Evaluasi Technical Gate memerlukan peran TECHNICAL_REVIEWER" : undefined}
                              style={!canReviewTechnicalGate(actorRoles) ? { opacity: 0.5, cursor: "not-allowed", padding: "6px 12px", fontSize: "0.74rem" } : { padding: "6px 12px", fontSize: "0.74rem" }}
                              onClick={() => handleSubmitReviewGate(inspectReleaseItem.id, "TECHNICAL", "APPROVED")}
                              type="button"
                            >
                              Approve Teknis
                            </button>
                            <button
                              className="gov-modal-btn-cancel"
                              disabled={submittingReviewGate === "TECHNICAL" || !canReviewTechnicalGate(actorRoles)}
                              title={!canReviewTechnicalGate(actorRoles) ? "Evaluasi Technical Gate memerlukan peran TECHNICAL_REVIEWER" : undefined}
                              style={!canReviewTechnicalGate(actorRoles) ? { opacity: 0.5, cursor: "not-allowed", padding: "6px 12px", fontSize: "0.74rem" } : { padding: "6px 12px", fontSize: "0.74rem" }}
                              onClick={() => handleSubmitReviewGate(inspectReleaseItem.id, "TECHNICAL", "REJECTED")}
                              type="button"
                            >
                              Reject Teknis
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Stage 4: Executive Approver */}
                  <div className="gov-callout-action stage4">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
                      <div>
                        <strong style={{ fontSize: "0.88rem", color: "#78350f", display: "block" }}>
                          Tahap 4 — Approver (Direktur Utama): Persetujuan &amp; Aktivasi Rilis
                        </strong>
                        <p style={{ margin: "4px 0 0 0", fontSize: "0.78rem", color: "#b45309" }}>
                          Direktur Utama mengesahkan rilis setelah dual review gates disetujui, melakukan deployment ke staging internal, lalu mengaktifkan ke produksi.
                        </p>
                      </div>
                      <span className={`gov-test-status-badge ${isReleased ? "passed" : isApproved ? "passed" : "not-run"}`}>
                        {isReleased ? "RILIS OPERASIONAL" : isApproved ? "APPROVED (SIAP STAGING)" : "MENUNGGU DUAL GATES"}
                      </span>
                    </div>

                    <div className="gov-pipe-btn-group" style={{ marginTop: "6px" }}>
                      {isInReview && (
                        <button
                          className="gov-modal-btn-confirm primary"
                          disabled={pipelineWorking || !dualGateApproved || !canApproveRelease(actorRoles)}
                          title={
                            !canApproveRelease(actorRoles)
                              ? "Persetujuan rilis memerlukan peran EXECUTIVE"
                              : !dualGateApproved
                              ? "Kedua gate (Business & Technical) harus disetujui terlebih dahulu"
                              : undefined
                          }
                          style={!canApproveRelease(actorRoles) || !dualGateApproved ? { opacity: 0.5, cursor: "not-allowed" } : undefined}
                          onClick={() => handleReleasePipelineAction(inspectReleaseItem.id, "approve")}
                          type="button"
                        >
                          {pipelineWorking ? "Memproses..." : "1. Sahkan Rilis (Approve by Director)"}
                        </button>
                      )}

                      {isApproved && (
                        <button
                          className="gov-modal-btn-confirm primary"
                          disabled={pipelineWorking || !canApproveRelease(actorRoles)}
                          title={!canApproveRelease(actorRoles) ? "Deployment rilis memerlukan peran EXECUTIVE" : undefined}
                          style={!canApproveRelease(actorRoles) ? { opacity: 0.5, cursor: "not-allowed" } : undefined}
                          onClick={() => handleReleasePipelineAction(inspectReleaseItem.id, "release")}
                          type="button"
                        >
                          {pipelineWorking ? "Memproses..." : "2. Deploy ke Staging Internal (Release)"}
                        </button>
                      )}

                      {isReleased && (
                        <button
                          className="gov-modal-btn-confirm success"
                          disabled={pipelineWorking || !canApproveRelease(actorRoles)}
                          title={!canApproveRelease(actorRoles) ? "Aktivasi produksi memerlukan peran EXECUTIVE" : undefined}
                          style={!canApproveRelease(actorRoles) ? { opacity: 0.5, cursor: "not-allowed" } : undefined}
                          onClick={() => handleReleasePipelineAction(inspectReleaseItem.id, "activate")}
                          type="button"
                        >
                          {pipelineWorking ? "Memproses..." : "3. Aktifkan Agen ke Produksi (Activate Agent)"}
                        </button>
                      )}
                    </div>

                    <div style={{ marginTop: "16px" }}>
                      <ReadinessDecisionsPanel
                        actorRoles={actorRoles}
                        onError={setError}
                        onNotice={setNotice}
                        selectedReleaseId={inspectReleaseItem.id}
                        workspaceId={workspaceId}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Tab 2: Test Cases */}
              {!loadingReleaseDetail && inspectSubTab === "tests" && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <div>
                      <strong style={{ fontSize: "0.88rem", color: "#111827" }}>
                        Daftar 5 Kategori Test Evidence ({testCases.length} Test Suites)
                      </strong>
                      <p style={{ fontSize: "0.74rem", color: "#6b7280", margin: "2px 0 0 0" }}>
                        Dikelola oleh QA &amp; Security untuk membuktikan ketahanan model agen sebelum diajukan ke review.
                      </p>
                    </div>
                    {isDraft && testCases.length > 0 && (
                      <button
                        className="gov-modal-btn-confirm"
                        disabled={batchRunningTests}
                        onClick={() => handleExecuteAllTests(inspectReleaseItem.id)}
                        style={{ background: "#0c3b2f", color: "#ffffff", padding: "6px 14px", fontSize: "0.76rem" }}
                        type="button"
                      >
                        {batchRunningTests ? "Menjalankan..." : "Eksekusi Semua Test (Batch Run)"}
                      </button>
                    )}
                  </div>

                  <div className="gov-table-wrap" style={{ margin: 0 }}>
                    <table className="gov-rel-table">
                      <thead>
                        <tr>
                          <th>Kategori</th>
                          <th>Test Key</th>
                          <th>Expected Assertions</th>
                          <th>Hasil Terakhir</th>
                          <th>Waktu Eksekusi</th>
                          <th style={{ textAlign: "right", paddingRight: "16px" }}>Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {testCases.map((tc) => {
                          const run = latestRuns.get(tc.test_case_id);
                          const isExecuting = executingTestKey === tc.test_key;
                          return (
                            <tr key={tc.test_case_id}>
                              <td>
                                <span className={`gov-test-cat-pill ${tc.category.toLowerCase()}`}>
                                  {tc.category}
                                </span>
                              </td>
                              <td><strong style={{ fontFamily: "monospace", fontSize: "0.78rem" }}>{tc.test_key}</strong></td>
                              <td>
                                <span style={{ fontSize: "0.74rem", color: "#374151" }}>
                                  status = {String((tc.expected_assertions as Record<string, unknown>)?.status ?? "SUCCEEDED")}
                                </span>
                              </td>
                              <td>
                                <span className={`gov-test-status-badge ${run?.status === "PASSED" ? "passed" : run?.status === "FAILED" ? "failed" : "not-run"}`}>
                                  {run?.status ?? "NOT RUN"}
                                </span>
                              </td>
                              <td>
                                <span style={{ fontSize: "0.74rem", color: "#6b7280" }}>
                                  {run?.completed_at ? formatDateTime(run.completed_at) : "—"}
                                </span>
                              </td>
                              <td style={{ textAlign: "right", paddingRight: "16px" }}>
                                <button
                                  className="gov-rel-action-btn"
                                  disabled={isExecuting || batchRunningTests}
                                  onClick={() => handleExecuteSingleTest(inspectReleaseItem.id, tc.test_key)}
                                  type="button"
                                >
                                  {isExecuting ? "Running..." : "Run Test"}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                        {testCases.length === 0 && (
                          <tr>
                            <td colSpan={6} style={{ textAlign: "center", padding: "24px", color: "#6b7280" }}>
                              Belum ada test case yang didaftarkan. Kembali ke tab Alur Pipeline untuk mendaftarkan 5 test cases standar.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tab 3: Review Gates */}
              {!loadingReleaseDetail && inspectSubTab === "reviews" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div>
                    <strong style={{ fontSize: "0.88rem", color: "#111827" }}>
                      Dual Review Gate Governance
                    </strong>
                    <p style={{ fontSize: "0.74rem", color: "#6b7280", margin: "2px 0 0 0" }}>
                      Persetujuan independen dari Business Reviewer dan Technical Reviewer sebelum Direktur Utama dapat mengesahkan rilis.
                    </p>
                  </div>

                  {/* Business Review Form */}
                  <div className="gov-gate-card">
                    <div className="gov-gate-header">
                      <div>
                        <span className="gov-gate-title">1. Business Governance Review Gate</span>
                        <span style={{ display: "block", fontSize: "0.72rem", color: "#6b7280" }}>
                          Evaluasi dampak proses bisnis, kepatuhan SOP, dan limit risiko finansial.
                        </span>
                      </div>
                      <span className={`gov-gate-status ${businessReview?.decision === "APPROVED" ? "approved" : businessReview?.decision === "REJECTED" ? "rejected" : "pending"}`}>
                        {businessReview?.decision ?? (isInReview ? "PENDING" : "BELUM AKTIF")}
                      </span>
                    </div>

                    {businessReview ? (
                      <div style={{ background: "#f8faf9", padding: "10px 12px", borderRadius: "6px", fontSize: "0.78rem" }}>
                        <div><strong>Evaluator:</strong> {businessReview.reviewer_user_id?.slice(0, 10) ?? "Business Reviewer"}</div>
                        <div><strong>Waktu:</strong> {formatDateTime(businessReview.created_at)}</div>
                        <div style={{ marginTop: "4px" }}><strong>Catatan:</strong> {businessReview.notes}</div>
                      </div>
                    ) : (
                      <div className="gov-modal-field" style={{ margin: 0 }}>
                        <label htmlFor="business-notes-input">Catatan Evaluasi Bisnis:</label>
                        <textarea
                          id="business-notes-input"
                          onChange={(e) => setBusinessReviewNotes(e.target.value)}
                          placeholder="Masukkan catatan evaluasi kesesuaian bisnis..."
                          rows={2}
                          value={businessReviewNotes}
                        />
                        <div className="gov-gate-actions" style={{ marginTop: "8px" }}>
                          <button
                            className="gov-modal-btn-confirm success"
                            disabled={submittingReviewGate === "BUSINESS" || !isInReview || !actorRoles.includes("BUSINESS_REVIEWER")}
                            onClick={() => handleSubmitReviewGate(inspectReleaseItem.id, "BUSINESS", "APPROVED")}
                            title={!actorRoles.includes("BUSINESS_REVIEWER") ? "Hanya role BUSINESS_REVIEWER yang berwenang menyetujui gate ini." : undefined}
                            type="button"
                          >
                            {submittingReviewGate === "BUSINESS" ? "Menyimpan..." : "Approve Business Gate"}
                          </button>
                          <button
                            className="gov-modal-btn-cancel"
                            disabled={submittingReviewGate === "BUSINESS" || !isInReview || !actorRoles.includes("BUSINESS_REVIEWER")}
                            onClick={() => handleSubmitReviewGate(inspectReleaseItem.id, "BUSINESS", "REJECTED")}
                            title={!actorRoles.includes("BUSINESS_REVIEWER") ? "Hanya role BUSINESS_REVIEWER yang berwenang menolak gate ini." : undefined}
                            type="button"
                          >
                            Reject Business Gate
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Technical Review Form */}
                  <div className="gov-gate-card">
                    <div className="gov-gate-header">
                      <div>
                        <span className="gov-gate-title">2. Technical Governance Review Gate</span>
                        <span style={{ display: "block", fontSize: "0.72rem", color: "#6b7280" }}>
                          Evaluasi arsitektur runtime, isolasi sandbox, guardrail deterministik, dan SLA token.
                        </span>
                      </div>
                      <span className={`gov-gate-status ${technicalReview?.decision === "APPROVED" ? "approved" : technicalReview?.decision === "REJECTED" ? "rejected" : "pending"}`}>
                        {technicalReview?.decision ?? (isInReview ? "PENDING" : "BELUM AKTIF")}
                      </span>
                    </div>

                    {technicalReview ? (
                      <div style={{ background: "#f8faf9", padding: "10px 12px", borderRadius: "6px", fontSize: "0.78rem" }}>
                        <div><strong>Evaluator:</strong> {technicalReview.reviewer_user_id?.slice(0, 10) ?? "Technical Reviewer"}</div>
                        <div><strong>Waktu:</strong> {formatDateTime(technicalReview.created_at)}</div>
                        <div style={{ marginTop: "4px" }}><strong>Catatan:</strong> {technicalReview.notes}</div>
                      </div>
                    ) : (
                      <div className="gov-modal-field" style={{ margin: 0 }}>
                        <label htmlFor="technical-notes-input">Catatan Evaluasi Teknis:</label>
                        <textarea
                          id="technical-notes-input"
                          onChange={(e) => setTechnicalReviewNotes(e.target.value)}
                          placeholder="Masukkan catatan evaluasi teknis dan guardrail..."
                          rows={2}
                          value={technicalReviewNotes}
                        />
                        <div className="gov-gate-actions" style={{ marginTop: "8px" }}>
                          <button
                            className="gov-modal-btn-confirm success"
                            disabled={submittingReviewGate === "TECHNICAL" || !isInReview || !actorRoles.includes("TECHNICAL_REVIEWER")}
                            onClick={() => handleSubmitReviewGate(inspectReleaseItem.id, "TECHNICAL", "APPROVED")}
                            title={!actorRoles.includes("TECHNICAL_REVIEWER") ? "Hanya role TECHNICAL_REVIEWER yang berwenang menyetujui gate ini." : undefined}
                            type="button"
                          >
                            {submittingReviewGate === "TECHNICAL" ? "Menyimpan..." : "Approve Technical Gate"}
                          </button>
                          <button
                            className="gov-modal-btn-cancel"
                            disabled={submittingReviewGate === "TECHNICAL" || !isInReview || !actorRoles.includes("TECHNICAL_REVIEWER")}
                            onClick={() => handleSubmitReviewGate(inspectReleaseItem.id, "TECHNICAL", "REJECTED")}
                            title={!actorRoles.includes("TECHNICAL_REVIEWER") ? "Hanya role TECHNICAL_REVIEWER yang berwenang menolak gate ini." : undefined}
                            type="button"
                          >
                            Reject Technical Gate
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 4: Audit & Detail JSON */}
              {!loadingReleaseDetail && inspectSubTab === "audit" && (
                <div>
                  <strong style={{ fontSize: "0.88rem", color: "#111827", display: "block", marginBottom: "6px" }}>
                    Metadata Rilis &amp; Audit Trail Snapshot
                  </strong>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "12px", fontSize: "0.76rem" }}>
                    <div style={{ background: "#f8faf9", padding: "10px", borderRadius: "6px", border: "1px solid #e2eae4" }}>
                      <span style={{ color: "#6b7280", display: "block" }}>Change Request ID:</span>
                      <strong style={{ fontFamily: "monospace", fontSize: "0.72rem" }}>
                        {inspectReleaseItem.id}
                      </strong>
                    </div>
                    <div style={{ background: "#f8faf9", padding: "10px", borderRadius: "6px", border: "1px solid #e2eae4" }}>
                      <span style={{ color: "#6b7280", display: "block" }}>Submitted At:</span>
                      <strong>{detail?.lifecycle_events?.[0]?.created_at ? formatDateTime(detail.lifecycle_events[0].created_at) : inspectReleaseItem.submitted}</strong>
                    </div>
                    <div style={{ background: "#f8faf9", padding: "10px", borderRadius: "6px", border: "1px solid #e2eae4" }}>
                      <span style={{ color: "#6b7280", display: "block" }}>Updated At:</span>
                      <strong>{detail?.lifecycle_events?.length ? formatDateTime(detail.lifecycle_events[detail.lifecycle_events.length - 1].created_at) : inspectReleaseItem.updated}</strong>
                    </div>
                  </div>

                  <span style={{ fontSize: "0.76rem", fontWeight: 700, color: "#374151", display: "block", marginBottom: "4px" }}>
                    Raw Release Detail JSON (Audit Trail):
                  </span>
                  <pre className="gov-json-viewer" style={{ maxHeight: "240px" }}>
                    {JSON.stringify(detail ?? inspectReleaseItem, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="gov-modal-footer">
              <button className="gov-modal-btn-cancel" onClick={() => setSafetyModal(null)} type="button">
                Tutup Konsol
              </button>
            </div>
          </div>
        </div>
      );
    }

    return null;
  }

  return (
    <main className="gov-shell">
      {/* --------------------------------------------------------------------
          Sidebar: Dedicated Governance Sidebar (Dark Forest Green)
          -------------------------------------------------------------------- */}
      <aside className="gov-sidebar" aria-label="Governance and Agent Control Navigation">
        <div className="gov-brand">
          <div className="gov-brand-icon">
            <span aria-hidden="true">A</span>
          </div>
          <div className="gov-brand-text">
            <strong>ALOS</strong>
            <span>Trusted AI For a Brighter Tomorrow</span>
          </div>
        </div>

        <div className="gov-sidebar-title">
          <h2>Governance</h2>
          <p>AI &amp; Agent Control</p>
        </div>

        <nav className="gov-nav" aria-label="Menu Governance">
          <button
            className={`gov-nav-btn ${view === "overview" ? "active" : ""}`}
            onClick={() => changeView("overview")}
            type="button"
          >
            <GovIcon name="overview" />
            <span>Overview</span>
          </button>

          <button
            className={`gov-nav-btn ${view === "agents" ? "active" : ""}`}
            onClick={() => {
              changeView("agents");
            }}
            type="button"
          >
            <GovIcon name="agents" />
            <span>Agent Control</span>
            <span className="gov-nav-arrow">
              <GovIcon name="chevron" />
            </span>
          </button>

          {view === "agents" && (
            <div className="gov-subnav">
              <button
                className={`gov-subnav-btn ${agentSubView === "agents" && !viewingAgentDetail ? "active" : ""}`}
                onClick={() => {
                  setAgentSubView("agents");
                  setViewingAgentDetail(false);
                  window.history.replaceState(null, "", `/genesis?view=agents&sub=agents`);
                }}
                type="button"
              >
                <span className="gov-subnav-dot" />
                <span>Agents</span>
              </button>

              <button
                className={`gov-subnav-btn ${agentSubView === "releases" ? "active" : ""}`}
                onClick={() => {
                  setAgentSubView("releases");
                  window.history.replaceState(null, "", `/genesis?view=agents&sub=releases`);
                }}
                type="button"
              >
                <span className="gov-subnav-dot" />
                <span>Release Requests</span>
              </button>

              <button
                className={`gov-subnav-btn ${agentSubView === "tests" ? "active" : ""}`}
                onClick={() => {
                  setAgentSubView("tests");
                  window.history.replaceState(null, "", `/genesis?view=agents&sub=tests`);
                }}
                type="button"
              >
                <span className="gov-subnav-dot" />
                <span>Test &amp; Evidence</span>
              </button>

              <button
                className={`gov-subnav-btn ${agentSubView === "reviews" ? "active" : ""}`}
                onClick={() => {
                  setAgentSubView("reviews");
                  window.history.replaceState(null, "", `/genesis?view=agents&sub=reviews`);
                }}
                type="button"
              >
                <span className="gov-subnav-dot" />
                <span>Reviews &amp; Approval</span>
              </button>
            </div>
          )}

          <button
            className={`gov-nav-btn ${view === "permissions" ? "active" : ""}`}
            onClick={() => changeView("permissions")}
            type="button"
          >
            <GovIcon name="permissions" />
            <span>Permissions</span>
          </button>

          <button
            className={`gov-nav-btn ${view === "runtime" ? "active" : ""}`}
            onClick={() => changeView("runtime")}
            type="button"
          >
            <GovIcon name="runtime" />
            <span>Runtime &amp; Monitoring</span>
          </button>

          <button
            className={`gov-nav-btn ${view === "budget" && budgetSubTab === "budget" ? "active" : ""}`}
            onClick={() => {
              changeView("budget");
              setBudgetSubTab("budget");
            }}
            type="button"
          >
            <GovIcon name="budget" />
            <span>Budget</span>
          </button>

          <button
            className={`gov-nav-btn ${view === "budget" && budgetSubTab === "killswitch" ? "active" : view === "safety" ? "active" : ""}`}
            onClick={() => {
              changeView("budget");
              setBudgetSubTab("killswitch");
            }}
            type="button"
          >
            <GovIcon name="safety" />
            <span>Kill Switch / Rollbacks</span>
          </button>

          <button
            className={`gov-nav-btn ${view === "budget" && budgetSubTab === "audit" ? "active" : view === "audit" ? "active" : ""}`}
            onClick={() => {
              changeView("budget");
              setBudgetSubTab("audit");
            }}
            type="button"
          >
            <GovIcon name="audit" />
            <span>Audit Trail</span>
          </button>

          <button
            className={`gov-nav-btn ${view === "sources" ? "active" : ""}`}
            onClick={() => changeView("sources")}
            type="button"
          >
            <GovIcon name="file" />
            <span>Sources &amp; Vault</span>
          </button>
        </nav>

        <div className="gov-sidebar-footer">
          <Link className="gov-back-btn" href="/">
            <GovIcon name="back" />
            <span>Back to ALOS</span>
          </Link>
        </div>
      </aside>

      {/* --------------------------------------------------------------------
          Main Content Area (Light Warm Off-White)
          -------------------------------------------------------------------- */}
      <section className="gov-main">
        {/* Top Header Bar */}
        {/* Top Header Bar - Profile Only */}
        <header className="gov-topbar">
          <div className="gov-profile-chip" title={`Akun: ${currentActiveUserName} (${currentActiveRoleTitle})`}>
            <div className="gov-avatar">{currentActiveUserAvatar}</div>
            <div className="gov-profile-meta">
              <strong>{currentActiveUserName}</strong>
              <small>{currentActiveRoleTitle}</small>
            </div>
            <GovIcon name="chevron" size={12} />
          </div>
        </header>

        {/* Feedback alerts if any */}
        {error || notice ? (
          <div style={{ padding: "16px 32px 0" }}>
            <GovernanceFeedback error={error} notice={notice} onDismiss={() => setError(null)} />
          </div>
        ) : null}

        {/* Body Content */}
        <div className="gov-body">
          {view === "overview" && (
            <>
              {/* Page Sub-header */}
              <div className="gov-page-header">
                <div className="gov-page-title">
                  <div className="gov-breadcrumb">
                    Governance / <span>Overview</span>
                  </div>
                  <h2>Governance Overview</h2>
                  <p>Monitor AI agents, risk, approvals, and operational health.</p>
                </div>

                <div className="gov-page-controls">
                  <div className="gov-filter-select">
                    <GovIcon name="calendar" size={14} />
                    <select
                      aria-label="Rentang Waktu Evaluasi"
                      onChange={(e) => setTimeRange(e.target.value)}
                      style={{ border: 0, background: "transparent", font: "inherit", fontWeight: 600, color: "inherit", cursor: "pointer", outline: "none" }}
                      value={timeRange}
                    >
                      <option>7 Hari Terakhir</option>
                      <option>30 Hari Terakhir</option>
                      <option>Kuartal Ini (Q3)</option>
                      <option>Tahun Berjalan 2026</option>
                    </select>
                    <GovIcon name="chevron" size={12} />
                  </div>
                  <div className="gov-freshness-tag">
                    <i />
                    <span>Diperbarui 12 Sep 2026, 14:32 WIB</span>
                  </div>
                </div>
              </div>

              {/* 8 Metric Cards Grid */}
              <section className="gov-metrics-grid" aria-label="8 Metrik Utama Tata Kelola">
                {metrics.map((card) => (
                  <article className={`gov-metric-card ${card.key}`} key={card.key}>
                    <div className="gov-metric-header">
                      <span className="gov-metric-label">{card.label}</span>
                      <div className="gov-metric-icon">
                        <GovIcon name={card.iconName} size={15} />
                      </div>
                    </div>
                    <div className="gov-metric-body">
                      <strong className="gov-metric-value">{card.value}</strong>
                      <div className={`gov-metric-trend ${card.trendDir === "up" ? (card.trendType === "good" ? "up-good" : "up-bad") : (card.trendType === "good" ? "down-good" : "down-bad")}`}>
                        <span className="gov-trend-arrow">{card.trendDir === "up" ? "↑" : "↓"}</span>
                        <span>{card.trend}</span>
                      </div>
                    </div>
                  </article>
                ))}
              </section>

              {/* Middle Section: Donut Distribution & Recent Activity */}
              <section className="gov-mid-grid">
                {/* Donut Chart: Agent Lifecycle Distribution */}
                <article className="gov-panel">
                  <div className="gov-panel-header">
                    <h3>Agent Lifecycle Distribution</h3>
                  </div>
                  <div className="gov-donut-wrap">
                    <div className="gov-donut-chart">
                      <GovDonutChart items={distribution} />
                      <div className="gov-donut-center">
                        <strong>{realAgents.length}</strong>
                        <span>Total Agents</span>
                      </div>
                    </div>
                    <div className="gov-donut-legend">
                      {distribution.map((item) => (
                        <div className="gov-donut-item" key={item.key}>
                          <div className="gov-donut-item-label">
                            <i style={{ background: item.color }} />
                            <span>{item.label}</span>
                          </div>
                          <div className="gov-donut-item-val">
                            <span>{item.count}</span>
                            <small>({item.percent}%)</small>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </article>

                {/* Aktivitas Terbaru */}
                <article className="gov-panel">
                  <div className="gov-panel-header">
                    <h3>Aktivitas Terbaru</h3>
                    <Link className="gov-panel-link" href="/genesis?view=audit">
                      Lihat Semua →
                    </Link>
                  </div>
                  <div className="gov-activity-list">
                    {activities.map((act) => (
                      <div className="gov-activity-item" key={act.id}>
                        <div className={`gov-activity-icon ${act.iconType}`}>
                          <GovIcon name={act.iconType} />
                        </div>
                        <div className="gov-activity-copy">
                          <strong>{act.title}</strong>
                          <p>{act.subtitle}</p>
                        </div>
                        <span className="gov-activity-time">{act.timeAgo}</span>
                      </div>
                    ))}
                  </div>
                </article>
              </section>

              {/* Bottom Section: Pending Human Actions & Risk Summary */}
              <section className="gov-bottom-grid">
                {/* Pending Human Actions */}
                <article className="gov-panel">
                  <div className="gov-panel-header">
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <GovIcon name="hourglass" />
                      <h3>Pending Human Actions</h3>
                    </div>
                    <Link className="gov-panel-link" href="/genesis?view=agents&sub=reviews">
                      Lihat Semua →
                    </Link>
                  </div>
                  <div className="gov-table-wrap">
                    <table className="gov-actions-table">
                      <thead>
                        <tr>
                          <th>Agent</th>
                          <th>Tipe</th>
                          <th>Diminta Oleh</th>
                          <th>Menunggu Sejak</th>
                          <th>Prioritas</th>
                          <th>Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingActions.map((action) => (
                          <tr key={action.id}>
                            <td>
                              <strong className="agent-name">{action.agentName}</strong>
                            </td>
                            <td>{action.type}</td>
                            <td>{action.requestedBy}</td>
                            <td>{action.waitingSince}</td>
                            <td>
                              <span
                                className={`gov-priority-badge ${action.priority === "Tinggi" ? "high" : action.priority === "Sedang" ? "medium" : "low"}`}
                              >
                                {action.priority}
                              </span>
                            </td>
                            <td>
                              <div className="gov-row-actions">
                                <button
                                  className="gov-review-btn"
                                  onClick={() => void handleOpenReleaseInspect(action.id, undefined, "reviews")}
                                  type="button"
                                >
                                  Review
                                </button>
                                <button aria-label="Opsi aksi" className="gov-more-btn" type="button">
                                  •••
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </article>

                {/* Risk / Blocker Summary */}
                <article className="gov-panel">
                  <div className="gov-panel-header">
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <GovIcon name="alert" />
                      <h3>Risk / Blocker Summary</h3>
                    </div>
                    <Link className="gov-panel-link" href="/genesis?view=runtime">
                      Lihat Detail →
                    </Link>
                  </div>
                  <div className="gov-risk-list">
                    {riskBlockers.map((risk) => (
                      <div className="gov-risk-item" key={risk.id}>
                        <div className="gov-risk-copy">
                          <i className={`risk-dot ${risk.color}`} />
                          <div>
                            <strong>{risk.title}</strong>
                            <small>{risk.description}</small>
                          </div>
                        </div>
                        <span className="gov-risk-count">{risk.count}</span>
                      </div>
                    ))}
                  </div>
                </article>
              </section>
            </>
          )}

          {/* ----------------------------------------------------------------
              View: Agent Control (Agents Detail, Release Requests, etc.)
              ---------------------------------------------------------------- */}
          {view === "agents" && agentSubView === "releases" && (
            <div className="gov-agent-header">
              {/* Page Sub-header */}
              <div className="gov-page-header">
                <div className="gov-page-title">
                  <div className="gov-breadcrumb">
                    Agent Control / <span>Release Requests</span>
                  </div>
                  <h2>Release Requests</h2>
                  <p>Pantau dan kelola permintaan rilis agent.</p>
                </div>

                <div className="gov-page-controls">
                  <div className="gov-filter-select">
                    <GovIcon name="calendar" />
                    <select
                      onChange={(e) => setTimeRange(e.target.value)}
                      style={{
                        border: 0,
                        background: "transparent",
                        font: "inherit",
                        fontWeight: 600,
                        color: "inherit",
                        cursor: "pointer",
                        outline: "none",
                      }}
                      value={timeRange}
                    >
                      <option value="7 Hari Terakhir">7 Hari Terakhir</option>
                      <option value="30 Hari Terakhir">30 Hari Terakhir</option>
                      <option value="Kuartal Ini">Kuartal Ini</option>
                    </select>
                    <GovIcon name="chevron" />
                  </div>
                </div>
              </div>

              {/* Filter & Action Toolbar */}
              <div className="gov-rel-toolbar">
                <div className="gov-rel-filters">
                  <div className="gov-rel-search">
                    <GovIcon name="search" />
                    <input
                      onChange={(e) => setReleaseSearch(e.target.value)}
                      placeholder="Cari release request..."
                      type="text"
                      value={releaseSearch}
                    />
                  </div>

                  <select
                    className="gov-rel-select"
                    onChange={(e) => setReleaseFilterStatus(e.target.value)}
                    value={releaseFilterStatus}
                  >
                    <option value="ALL">Semua Status</option>
                    {releaseStates.map((st) => (
                      <option key={st} value={st}>
                        {formatReleaseState(st)}
                      </option>
                    ))}
                  </select>

                  <select
                    className="gov-rel-select"
                    onChange={(e) => setReleaseFilterAgent(e.target.value)}
                    value={releaseFilterAgent}
                  >
                    <option value="ALL">Semua Agent</option>
                    {releaseRequestsList.map((item) => (
                      <option key={item.id} value={item.agentKey}>
                        {item.agentName}
                      </option>
                    ))}
                  </select>

                  <button
                    className="gov-rel-btn-filter"
                    onClick={() => {
                      setReleaseFilterStatus("ALL");
                      setReleaseFilterAgent("ALL");
                      setReleaseSearch("");
                    }}
                    type="button"
                  >
                    <GovIcon name="filter" />
                    <span>Filter</span>
                  </button>
                </div>

                <button
                  className="gov-rel-btn-new"
                  onClick={() => {
                    setNewReleaseAgentKey(realAgents[0]?.agent_key || "");
                    setNewReleaseRequirement("");
                    setSafetyModal("NEW_RELEASE");
                  }}
                  type="button"
                >
                  <GovIcon name="plus" />
                  <span>New Release</span>
                </button>
              </div>

              {/* Release Requests Table Card */}
              <div className="gov-rel-card">
                <div className="gov-table-wrap" style={{ margin: 0 }}>
                  <table className="gov-rel-table">
                    <thead>
                      <tr>
                        <th>Agent</th>
                        <th>Version</th>
                        <th>Requester</th>
                        <th>Status</th>
                        <th>Submitted</th>
                        <th>Updated</th>
                        <th style={{ textAlign: "right", paddingRight: "24px" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredReleases.map((row) => (
                        <tr key={row.id}>
                          <td>
                            <div className="gov-rel-agent-cell">
                              <span className="gov-rel-icon" style={{ background: row.iconBg, color: row.iconColor }}>
                                <GovIcon name={row.iconName} />
                              </span>
                              <strong>{row.agentName}</strong>
                            </div>
                          </td>
                          <td>
                            <span className="gov-rel-version">{row.version}</span>
                          </td>
                          <td>
                            <span className="gov-rel-requester">{row.requester}</span>
                          </td>
                          <td>
                            <span className={`gov-rel-status ${row.status.toLowerCase()}`}>
                              {formatReleaseState(row.status)}
                            </span>
                          </td>
                          <td>
                            <span className="gov-rel-timestamp">{row.submitted}</span>
                          </td>
                          <td>
                            <span className="gov-rel-timestamp">{row.updated}</span>
                          </td>
                          <td style={{ textAlign: "right", paddingRight: "24px" }}>
                            <button
                              className="gov-rel-action-btn"
                              onClick={() => void handleOpenReleaseInspect(row.id, row, "pipeline")}
                              type="button"
                            >
                              {row.actionLabel}
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredReleases.length === 0 && (
                        <tr>
                          <td colSpan={7} style={{ textAlign: "center", padding: "32px", color: "#6e847a" }}>
                            Tidak ada permintaan rilis yang cocok dengan filter pencarian.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Table Pagination Footer */}
                <div className="gov-rel-pagination">
                  <span>
                    Menampilkan 1 - {filteredReleases.length} dari {releaseRequestsList.length} release request
                  </span>
                  <div className="gov-rel-page-btns">
                    <button className="gov-rel-page-btn" disabled type="button">
                      &lt;
                    </button>
                    <button className="gov-rel-page-btn active" type="button">
                      1
                    </button>
                    <button className="gov-rel-page-btn" disabled type="button">
                      &gt;
                    </button>
                  </div>
                </div>

                <div style={{ marginTop: "24px" }}>
                  <ReadinessDecisionsPanel
                    actorRoles={actorRoles}
                    onError={setError}
                    onNotice={setNotice}
                    workspaceId={workspaceId}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------
              View: Agent Control -> Agents Directory Table (Image 1)
              ---------------------------------------------------------------- */}
          {view === "agents" && agentSubView === "agents" && !viewingAgentDetail && (
            <div className="gov-agent-header">
              {/* Page Sub-header */}
              <div className="gov-page-header">
                <div className="gov-page-title">
                  <div className="gov-breadcrumb">
                    Agent Control / <span>Agents</span>
                  </div>
                  <h2>Agents</h2>
                  <p>Kelola seluruh agent, versi, dan status lifecycle.</p>
                </div>
              </div>

              {/* Filter & Action Toolbar */}
              <div className="gov-ag-toolbar">
                <div className="gov-ag-search">
                  <GovIcon name="search" />
                  <input
                    onChange={(e) => setAgentSearch(e.target.value)}
                    placeholder="Cari agent (nama, tujuan, atau purpose...)"
                    type="text"
                    value={agentSearch}
                  />
                </div>

                <div className="gov-ag-filter-group">
                  <div className="gov-ag-select-wrap">
                    <GovIcon name="scope" />
                    <select
                      className="gov-ag-select"
                      onChange={(e) => setAgentFilterScope(e.target.value)}
                      value={agentFilterScope}
                    >
                      <option value="ALL">Semua Scope</option>
                      <option value="Property">Property</option>
                      <option value="Company">Company</option>
                      <option value="HR">HR</option>
                      <option value="Finance">Finance</option>
                    </select>
                    <GovIcon name="chevron" />
                  </div>

                  <div className="gov-ag-select-wrap">
                    <GovIcon name="shield_check" />
                    <select
                      className="gov-ag-select"
                      onChange={(e) => setAgentFilterRisk(e.target.value)}
                      value={agentFilterRisk}
                    >
                      <option value="ALL">Semua Risk</option>
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </select>
                    <GovIcon name="chevron" />
                  </div>

                  <div className="gov-ag-select-wrap">
                    <GovIcon name="filter" />
                    <select
                      className="gov-ag-select"
                      onChange={(e) => setAgentFilterStatus(e.target.value)}
                      value={agentFilterStatus}
                    >
                      <option value="ALL">Semua Status</option>
                      <option value="ACTIVE">Active</option>
                      <option value="IN_REVIEW">In Review</option>
                      <option value="DRAFT">Draft</option>
                      <option value="SUSPENDED">Suspended</option>
                    </select>
                    <GovIcon name="chevron" />
                  </div>

                  <button
                    className="gov-ag-request-btn"
                    disabled={!canEditAgentRegistry(actorRoles)}
                    onClick={() => {
                      setNewAgentName("");
                      setNewAgentKey("");
                      setNewAgentRequirement("");
                      setSafetyModal("REQUEST_NEW_AGENT");
                    }}
                    title={!canEditAgentRegistry(actorRoles) ? "Hanya peran IT_ADMIN (Maker) yang dapat membuat agen." : undefined}
                    type="button"
                  >
                    <GovIcon name="plus" />
                    <span>Request New Agent</span>
                  </button>
                </div>
              </div>

              {/* Table Card */}
              <div className="gov-table-card">
                <div className="gov-table-wrap">
                  <table className="gov-ag-table">
                    <thead>
                      <tr>
                        <th>Agent</th>
                        <th>Version</th>
                        <th>Scope</th>
                        <th>Risk</th>
                        <th>Status</th>
                        <th>
                          <span className="gov-th-sort">
                            Last Run <GovIcon name="sort" />
                          </span>
                        </th>
                        <th>
                          <span className="gov-th-sort">
                            Updated <GovIcon name="sort" />
                          </span>
                        </th>
                        <th style={{ textAlign: "center" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAgentDirectory.map((ag) => (
                        <tr key={ag.id}>
                          <td>
                            <div className="gov-ag-meta-cell">
                              <div className="gov-ag-avatar-icon">
                                <GovIcon name={ag.iconName} />
                              </div>
                              <div className="gov-ag-meta-text">
                                <strong>{ag.agentName}</strong>
                                <p>{ag.purpose}</p>
                              </div>
                            </div>
                          </td>
                          <td><span className="gov-ag-version">{ag.version}</span></td>
                          <td><span className="gov-ag-scope">{ag.scope}</span></td>
                          <td>
                            <span className={`gov-ag-risk-pill ${ag.risk.toLowerCase()}`}>
                              {ag.risk}
                            </span>
                          </td>
                          <td>
                            <span className={`gov-ag-status-badge ${ag.status.toLowerCase().replace('_', '-')}`}>
                              {ag.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td><span className="gov-ag-time">{ag.lastRun}</span></td>
                          <td><span className="gov-ag-time">{ag.updated}</span></td>
                          <td>
                            <div className="gov-ag-actions">
                              <button
                                className="gov-ag-action-btn use"
                                onClick={() => {
                                  setTargetRunAgentKey(ag.agentKey);
                                  setTargetRunAgentName(ag.agentName);
                                  setRunInputText('{\n  "query": "Jalankan evaluasi kepatuhan operasional."\n}');
                                  setRunResult(null);
                                  setSafetyModal("RUN_AGENT");
                                }}
                                type="button"
                              >
                                <GovIcon name="play_triangle" />
                                <span>Use</span>
                              </button>
                              <button
                                className="gov-ag-action-btn details"
                                onClick={() => {
                                  setSelectedAgentKey(ag.agentKey);
                                  setViewingAgentDetail(true);
                                }}
                                type="button"
                              >
                                Details
                              </button>
                              <button
                                className="gov-ag-action-btn dots"
                                onClick={() => {
                                  setTargetRunAgentKey(ag.agentKey);
                                  setTargetRunAgentName(ag.agentName);
                                  setRunIsTesting(true);
                                  setSafetyModal("RUN_AGENT");
                                }}
                                title="Jalankan Uji Benchmark / Test Agent"
                                type="button"
                              >
                                <GovIcon name="dots" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredAgentDirectory.length === 0 && (
                        <tr>
                          <td colSpan={8} style={{ textAlign: "center", padding: "40px 24px", color: "#546e63", fontSize: "0.9rem" }}>
                            {agentDirectoryList.length === 0
                              ? "Belum ada agent terdaftar pada workspace ini."
                              : "Tidak ada agent yang cocok dengan filter pencarian."}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Table Pagination Footer */}
                <div className="gov-rel-pagination">
                  <span>
                    {agentDirectoryList.length === 0
                      ? "Menampilkan 0 agent"
                      : `Menampilkan 1 - ${filteredAgentDirectory.length} dari ${agentDirectoryList.length} agent`}
                  </span>
                  <div className="gov-rel-page-btns">
                    <button className="gov-rel-page-btn" disabled type="button">
                      &lt;
                    </button>
                    <button className="gov-rel-page-btn active" type="button">
                      1
                    </button>
                    <button className="gov-rel-page-btn" disabled type="button">
                      &gt;
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------
              View: Agent Control -> Agent Detail View
              ---------------------------------------------------------------- */}
          {view === "agents" && agentSubView === "agents" && viewingAgentDetail && !currentAgent && (
            <div className="gov-agent-header">
              <div style={{ padding: "48px 24px", textAlign: "center", background: "#ffffff", borderRadius: "12px", border: "1px solid #d8e2dc" }}>
                <p style={{ color: "#546e63", marginBottom: "16px" }}>Agent tidak ditemukan atau belum terdaftar di workspace ini.</p>
                <button
                  className="gov-ag-action-btn details"
                  onClick={() => setViewingAgentDetail(false)}
                  type="button"
                >
                  ← Kembali ke Direktori Agent
                </button>
              </div>
            </div>
          )}

          {view === "agents" && agentSubView === "agents" && viewingAgentDetail && currentAgent && (
            <div className="gov-agent-header">
              {/* Breadcrumb row */}
              <div className="gov-breadcrumb" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span>Agent Control</span> /{" "}
                <button
                  onClick={() => setViewingAgentDetail(false)}
                  style={{
                    background: "transparent",
                    border: 0,
                    padding: 0,
                    font: "inherit",
                    color: "#1b4b3c",
                    fontWeight: 600,
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                  title="Kembali ke Daftar Agents"
                  type="button"
                >
                  Agents
                </button>{" "}
                / <span>{currentAgent.name}</span>
              </div>

              {/* Agent switcher bar if opened */}
              {showAgentPicker && (
                <div
                  style={{
                    background: "#ffffff",
                    border: "1px solid #d8e2dc",
                    borderRadius: "10px",
                    padding: "12px 16px",
                    display: "flex",
                    gap: "10px",
                    alignItems: "center",
                    flexWrap: "wrap",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                  }}
                >
                  <span style={{ fontSize: "0.8rem", color: "#546e63", fontWeight: 600 }}>Daftar Agent Terdaftar:</span>
                  {agentControlList.map((ag) => (
                    <button
                      key={ag.agentKey}
                      onClick={() => {
                        setSelectedAgentKey(ag.agentKey);
                        setShowAgentPicker(false);
                      }}
                      style={{
                        background: ag.agentKey === currentAgent.agentKey ? "#0c3b2f" : "#f1f5f3",
                        color: ag.agentKey === currentAgent.agentKey ? "#ffffff" : "#14392e",
                        border: 0,
                        padding: "6px 14px",
                        borderRadius: "8px",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                      type="button"
                    >
                      {ag.name} · <span style={{ opacity: 0.8 }}>{ag.version}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Title & Action Buttons Row */}
              <div className="gov-agent-title-bar">
                <div className="gov-agent-title-group">
                  <h2 className="gov-agent-title">{currentAgent.name}</h2>
                  <span
                    className={
                      currentAgent.lifecycleStatus === "ACTIVE"
                        ? "gov-pill-active"
                        : currentAgent.lifecycleStatus === "IN_REVIEW"
                        ? "gov-pill-review"
                        : "gov-pill-suspended"
                    }
                  >
                    {currentAgent.lifecycleStatus}
                  </span>
                  <span className="gov-pill-version">{currentAgent.version}</span>
                </div>

                <div className="gov-agent-actions">
                  <button
                    className="gov-agent-btn-outline"
                    onClick={() => {
                      setTargetRunAgentKey(currentAgent.agentKey);
                      setTargetRunAgentName(currentAgent.name);
                      setRunIsTesting(true);
                      setSafetyModal("RUN_AGENT");
                    }}
                    type="button"
                  >
                    <GovIcon name="test" />
                    <span>Test Agent</span>
                  </button>

                  <Link className="gov-agent-btn-outline" href="/genesis">
                    <GovIcon name="open" />
                    <span>Open in GENESIS</span>
                  </Link>

                  {canEditAgentRegistry(actorRoles) &&
                    (currentAgent.lifecycleStatus === "DRAFT" || currentAgent.lifecycleStatus === "RETURNED") && (
                      <>
                        <button
                          className="gov-agent-btn-outline"
                          onClick={() => handleOpenEditAgentDraft(currentAgent.agentKey)}
                          title="Edit spesifikasi draft agent ini"
                          type="button"
                        >
                          <GovIcon name="gear" />
                          <span>Edit Draft</span>
                        </button>
                        <button
                          className="gov-agent-btn-outline danger"
                          onClick={() => void handleDeleteAgentDraft(currentAgent.agentKey)}
                          title="Hapus draft agent ini dari registri"
                          type="button"
                        >
                          <GovIcon name="ban" />
                          <span>Hapus Draft</span>
                        </button>
                      </>
                    )}

                  {actorRoles.includes("EXECUTIVE") && currentAgent.lifecycleStatus === "ACTIVE" && (
                    <button
                      className="gov-agent-btn-outline danger"
                      onClick={() => handleSuspendAgent(currentAgent.agentKey)}
                      title="Tangguhkan rilis agen administratif (Direktur)"
                      type="button"
                    >
                      <GovIcon name="pause" />
                      <span>Suspend</span>
                    </button>
                  )}

                  {canEditAgentRegistry(actorRoles) &&
                    (currentAgent.lifecycleStatus === "ACTIVE" || currentAgent.lifecycleStatus === "SUSPENDED") && (
                      <button
                        className="gov-agent-btn-outline danger"
                        onClick={() => void handleRetireAgent(currentAgent.agentKey)}
                        title="Pensiunkan agent ini dari operasional"
                        type="button"
                      >
                        <GovIcon name="pause" />
                        <span>Pensiunkan</span>
                      </button>
                    )}

                  <button
                    className="gov-agent-btn-more"
                    onClick={() => setShowAgentPicker(!showAgentPicker)}
                    title="Ganti Agent / Opsi Tambahan"
                    type="button"
                  >
                    ···
                  </button>
                </div>
              </div>

              {/* Subtitle */}
              <p className="gov-agent-subtitle">{currentAgent.purpose}</p>

              {/* Sub-navigation Tabs */}
              <div className="gov-subtabs" role="tablist">
                <button
                  className={`gov-subtab-btn ${agentSubTab === "overview" ? "active" : ""}`}
                  onClick={() => setAgentSubTab("overview")}
                  type="button"
                >
                  Overview
                </button>
                <button
                  className={`gov-subtab-btn ${agentSubTab === "contract" ? "active" : ""}`}
                  onClick={() => setAgentSubTab("contract")}
                  type="button"
                >
                  Contract
                </button>
                <button
                  className={`gov-subtab-btn ${agentSubTab === "tools" ? "active" : ""}`}
                  onClick={() => setAgentSubTab("tools")}
                  type="button"
                >
                  Tools &amp; Permissions
                </button>
                <button
                  className={`gov-subtab-btn ${agentSubTab === "tests" ? "active" : ""}`}
                  onClick={() => setAgentSubTab("tests")}
                  type="button"
                >
                  Tests
                </button>
                <button
                  className={`gov-subtab-btn ${agentSubTab === "runtime" ? "active" : ""}`}
                  onClick={() => setAgentSubTab("runtime")}
                  type="button"
                >
                  Runtime
                </button>
                <button
                  className={`gov-subtab-btn ${agentSubTab === "history" ? "active" : ""}`}
                  onClick={() => setAgentSubTab("history")}
                  type="button"
                >
                  History &amp; Audit
                </button>
              </div>

              {/* Sub-tab Content: Overview (Matching Reference Mockup Exactly) */}
              {agentSubTab === "overview" && (
                <div className="gov-agent-grid">
                  {/* Left Column: Informasi Umum & Capabilities */}
                  <div className="gov-agent-col">
                    {/* Card 1: Informasi Umum */}
                    <article className="gov-agent-card">
                      <h3 className="gov-agent-card-title">Informasi Umum</h3>
                      <div className="gov-kv-list">
                        <div className="gov-kv-row">
                          <span className="gov-kv-label">Agent Key</span>
                          <span className="gov-kv-value">
                            <code>{currentAgent.agentKey}</code>
                          </span>
                        </div>
                        <div className="gov-kv-row">
                          <span className="gov-kv-label">Purpose</span>
                          <span className="gov-kv-value">{currentAgent.purpose}</span>
                        </div>
                        <div className="gov-kv-row">
                          <span className="gov-kv-label">Scope</span>
                          <span className="gov-kv-value">{currentAgent.scope}</span>
                        </div>
                        <div className="gov-kv-row">
                          <span className="gov-kv-label">Risk Level</span>
                          <span className="gov-kv-value">
                            <span
                              className={
                                currentAgent.riskLevel === "LOW"
                                  ? "gov-pill-risk-low"
                                  : "gov-pill-risk-med"
                              }
                            >
                              {currentAgent.riskLevel}
                            </span>
                          </span>
                        </div>
                        <div className="gov-kv-row">
                          <span className="gov-kv-label">Owner</span>
                          <span className="gov-kv-value">{currentAgent.owner}</span>
                        </div>
                        <div className="gov-kv-row">
                          <span className="gov-kv-label">Created</span>
                          <span className="gov-kv-value">{currentAgent.createdAt}</span>
                        </div>
                        <div className="gov-kv-row">
                          <span className="gov-kv-label">Last Updated</span>
                          <span className="gov-kv-value">{currentAgent.lastUpdatedAt}</span>
                        </div>
                      </div>
                    </article>

                    {/* Card 2: Capabilities */}
                    <article className="gov-agent-card">
                      <h3 className="gov-agent-card-title">Capabilities</h3>
                      <p className="gov-agent-card-desc">
                        Data dan fungsi yang dapat diakses oleh agent ini.
                      </p>
                      <div className="gov-caps-list">
                        {currentAgent.capabilities.map((cap) => (
                          <span className="gov-cap-pill" key={cap}>
                            {cap}
                          </span>
                        ))}
                      </div>
                    </article>
                  </div>

                  {/* Right Column: Status & Readiness + Quick Actions */}
                  <div className="gov-agent-col">
                    {/* Card 3: Status & Readiness */}
                    <article className="gov-agent-card">
                      <h3 className="gov-agent-card-title">Status &amp; Readiness</h3>
                      <div className="gov-readiness-list">
                        {currentAgent.readinessChecklist.map((item) => (
                          <div className="gov-readiness-item" key={item.label}>
                            <div className="gov-readiness-label">
                              <span className="gov-check-icon">
                                <svg
                                  fill="none"
                                  stroke="currentColor"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  viewBox="0 0 24 24"
                                >
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              </span>
                              <span>{item.label}</span>
                            </div>
                            <span
                              className={`gov-readiness-status ${
                                item.passed ? "passed" : "in_review"
                              }`}
                            >
                              {item.status}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Ready Banner */}
                      <div className="gov-ready-banner">
                        <span className="gov-ready-banner-icon">
                          <svg
                            fill="none"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            viewBox="0 0 24 24"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </span>
                        <div className="gov-ready-banner-text">
                          <strong>{currentAgent.readyMessageTitle}</strong>
                          <small>{currentAgent.readyMessageSubtitle}</small>
                        </div>
                      </div>
                    </article>

                    {/* Card 4: Quick Actions */}
                    <article className="gov-agent-card">
                      <h3 className="gov-agent-card-title">Quick Actions</h3>
                      <div className="gov-qa-group">
                        <button
                          className="gov-qa-btn-primary"
                          onClick={() => router.push(`/genesis?agent=${currentAgent.agentKey}`)}
                          type="button"
                        >
                          <GovIcon name="play" />
                          <span>Use Agent</span>
                        </button>
                        <button
                          className="gov-qa-btn-secondary"
                          onClick={() => {
                            setTargetRunAgentKey(currentAgent.agentKey);
                            setTargetRunAgentName(currentAgent.name);
                            setRunIsTesting(true);
                            setSafetyModal("RUN_AGENT");
                          }}
                          type="button"
                        >
                          <GovIcon name="test" />
                          <span>Test Agent</span>
                        </button>
                        <button
                          className="gov-qa-btn-secondary"
                          onClick={() => changeView("overview")}
                          type="button"
                        >
                          <GovIcon name="open" />
                          <span>Open in Governance</span>
                        </button>
                      </div>
                    </article>
                  </div>
                </div>
              )}

              {/* Sub-tab Content: Contract */}
              {agentSubTab === "contract" && (
                <div className="gov-agent-grid">
                  <div className="gov-agent-col">
                    <article className="gov-agent-card">
                      <h3 className="gov-agent-card-title">Input Schema (JSON Schema)</h3>
                      <pre className="gov-code-box">{currentAgent.contract.inputSchema}</pre>
                    </article>
                    <article className="gov-agent-card">
                      <h3 className="gov-agent-card-title">Output Schema</h3>
                      <pre className="gov-code-box">{currentAgent.contract.outputSchema}</pre>
                    </article>
                  </div>
                  <div className="gov-agent-col">
                    <article className="gov-agent-card">
                      <h3 className="gov-agent-card-title">Deterministic Invariants</h3>
                      <ul className="gov-invariants-list">
                        {currentAgent.contract.invariants.map((inv, idx) => (
                          <li key={idx}>{inv}</li>
                        ))}
                      </ul>
                      <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: "1px solid #edf1ee" }}>
                        <div className="gov-kv-row">
                          <span className="gov-kv-label">SLA Latency Target</span>
                          <span className="gov-kv-value">&lt; {currentAgent.contract.slaLatencyMs} ms</span>
                        </div>
                        <div className="gov-kv-row">
                          <span className="gov-kv-label">Max Token Output</span>
                          <span className="gov-kv-value">{currentAgent.contract.maxOutputTokens} tokens</span>
                        </div>
                        <div className="gov-kv-row">
                          <span className="gov-kv-label">Model Binding</span>
                          <span className="gov-kv-value">{currentAgent.contract.modelBinding}</span>
                        </div>
                      </div>
                    </article>
                  </div>
                </div>
              )}

              {/* Sub-tab Content: Tools & Permissions */}
              {agentSubTab === "tools" && (
                <article className="gov-panel">
                  <div className="gov-panel-header">
                    <h3>Deterministic Tools &amp; Capability Policies</h3>
                  </div>
                  <div className="gov-table-wrap">
                    <table className="gov-actions-table">
                      <thead>
                        <tr>
                          <th>Tool Key</th>
                          <th>Nama Tool</th>
                          <th>Permission Scope</th>
                          <th>Access Mode</th>
                          <th>Status Otorisasi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentAgent.tools.map((tl) => (
                          <tr key={tl.key}>
                            <td><code>{tl.key}</code></td>
                            <td><strong>{tl.name}</strong></td>
                            <td><span className="gov-cap-pill">{tl.permission}</span></td>
                            <td>{tl.accessMode}</td>
                            <td><span className="gov-priority-badge low">{tl.status}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </article>
              )}

              {/* Sub-tab Content: Tests */}
              {agentSubTab === "tests" && (
                <article className="gov-panel">
                  <div className="gov-panel-header">
                    <h3>Automated Evaluation &amp; Safety Benchmark Suite</h3>
                    <button
                      className="gov-review-btn"
                      onClick={() => {
                        setTargetRunAgentKey(currentAgent.agentKey);
                        setTargetRunAgentName(currentAgent.name);
                        setRunIsTesting(true);
                        setSafetyModal("RUN_AGENT");
                      }}
                      type="button"
                    >
                      Jalankan Test Ulang
                    </button>
                  </div>
                  <div className="gov-table-wrap">
                    <table className="gov-actions-table">
                      <thead>
                        <tr>
                          <th>Nama Evaluasi</th>
                          <th>Kategori</th>
                          <th>Hasil</th>
                          <th>Skor / Benchmark</th>
                          <th>Tanggal Uji</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentAgent.tests.map((tst, i) => (
                          <tr key={i}>
                            <td><strong>{tst.testName}</strong></td>
                            <td>{tst.category}</td>
                            <td><span className="gov-priority-badge low">{tst.result}</span></td>
                            <td><strong style={{ color: "#0c8b4e" }}>{tst.score}</strong></td>
                            <td>{tst.date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </article>
              )}

              {/* Sub-tab Content: Runtime */}
              {agentSubTab === "runtime" && (
                <article className="gov-panel">
                  <div className="gov-panel-header">
                    <h3>Runtime Execution &amp; Resource Monitoring</h3>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "20px" }}>
                    <div style={{ background: "#f8fbf9", border: "1px solid #dce5df", borderRadius: "8px", padding: "12px" }}>
                      <small style={{ color: "#5d7369", display: "block" }}>Total Eksekusi</small>
                      <strong style={{ fontSize: "1.2rem", color: "#0c2b22" }}>{currentAgent.runtime.totalRuns}</strong>
                    </div>
                    <div style={{ background: "#f8fbf9", border: "1px solid #dce5df", borderRadius: "8px", padding: "12px" }}>
                      <small style={{ color: "#5d7369", display: "block" }}>Rata-rata Latensi</small>
                      <strong style={{ fontSize: "1.2rem", color: "#0c2b22" }}>{currentAgent.runtime.avgLatencyMs} ms</strong>
                    </div>
                    <div style={{ background: "#f8fbf9", border: "1px solid #dce5df", borderRadius: "8px", padding: "12px" }}>
                      <small style={{ color: "#5d7369", display: "block" }}>Error Rate</small>
                      <strong style={{ fontSize: "1.2rem", color: "#0c8b4e" }}>{currentAgent.runtime.errorRate}</strong>
                    </div>
                    <div style={{ background: "#f8fbf9", border: "1px solid #dce5df", borderRadius: "8px", padding: "12px" }}>
                      <small style={{ color: "#5d7369", display: "block" }}>Eksekusi Terakhir</small>
                      <strong style={{ fontSize: "0.85rem", color: "#0c2b22" }}>{currentAgent.runtime.lastRunAt}</strong>
                    </div>
                  </div>
                  <div className="gov-table-wrap">
                    <table className="gov-actions-table">
                      <thead>
                        <tr>
                          <th>Run ID</th>
                          <th>Status</th>
                          <th>Tokens</th>
                          <th>Latency</th>
                          <th>Waktu Eksekusi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentAgent.runtime.recentRuns.map((rn) => (
                          <tr key={rn.runId}>
                            <td><code>{rn.runId}</code></td>
                            <td><span className="gov-priority-badge low">{rn.status}</span></td>
                            <td>{rn.tokens} tokens</td>
                            <td>{rn.latencyMs} ms</td>
                            <td>{rn.timestamp}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </article>
              )}

              {/* Sub-tab Content: History & Audit */}
              {agentSubTab === "history" && (
                <article className="gov-panel">
                  <div className="gov-panel-header">
                    <h3>Immutable Release Audit Trail</h3>
                  </div>
                  <div className="gov-table-wrap">
                    <table className="gov-actions-table">
                      <thead>
                        <tr>
                          <th>Versi</th>
                          <th>Peristiwa / Keputusan</th>
                          <th>Aktor / Penandatangan</th>
                          <th>Waktu</th>
                          <th>Correlation ID / Event ID</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentAgent.auditHistory.map((ah, i) => (
                          <tr key={i}>
                            <td><strong>{ah.version}</strong></td>
                            <td>{ah.event}</td>
                            <td>{ah.actor}</td>
                            <td>{ah.date}</td>
                            <td><code>{ah.hash}</code></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </article>
              )}
            </div>
          )}

          {/* ----------------------------------------------------------------
              View: Agent Control -> Test & Evidence (Image 2)
              ---------------------------------------------------------------- */}
          {view === "agents" && agentSubView === "tests" && (
            <div className="gov-agent-header">
              {/* Page Sub-header */}
              <div className="gov-page-header">
                <div className="gov-page-title">
                  <div className="gov-breadcrumb">
                    Agent Control / <span>Test &amp; Evidence</span>
                  </div>
                  <h2>Test &amp; Evidence</h2>
                  <p>Lihat hasil test agent dan evidence pendukung.</p>
                </div>
              </div>

              {/* Filter Card */}
              <div className="gov-test-filter-card">
                <div className="gov-test-filter-field">
                  <label>Agent</label>
                  <div className="gov-test-select-wrap">
                    <select
                      className="gov-test-select"
                      onChange={(e) => setTestFilterAgent(e.target.value)}
                      value={testFilterAgent}
                    >
                      <option value="ALL">Semua Agent</option>
                      <option value="EVIDENCE_CHECKER">Evidence Checker</option>
                      <option value="FINANCE_RECONCILIATION">Finance Reconciliation</option>
                    </select>
                    <GovIcon name="chevron" />
                  </div>
                </div>

                <div className="gov-test-filter-field">
                  <label>Category</label>
                  <div className="gov-test-select-wrap">
                    <select
                      className="gov-test-select"
                      onChange={(e) => setTestFilterCategory(e.target.value)}
                      value={testFilterCategory}
                    >
                      <option value="ALL">Semua Kategori</option>
                      <option value="POSITIVE">Positive</option>
                      <option value="NEGATIVE">Negative</option>
                      <option value="REGRESSION">Regression</option>
                      <option value="SECURITY">Security</option>
                      <option value="RECOVERY">Recovery</option>
                    </select>
                    <GovIcon name="chevron" />
                  </div>
                </div>

                <div className="gov-test-filter-field">
                  <label>Status</label>
                  <div className="gov-test-select-wrap">
                    <select
                      className="gov-test-select"
                      onChange={(e) => setTestFilterStatus(e.target.value)}
                      value={testFilterStatus}
                    >
                      <option value="ALL">Semua Status</option>
                      <option value="PASSED">Passed</option>
                      <option value="FAILED">Failed</option>
                      <option value="BLOCKED">Blocked</option>
                      <option value="NOT RUN">Not Run</option>
                      <option value="PENDING">Pending</option>
                    </select>
                    <GovIcon name="chevron" />
                  </div>
                </div>

                <div className="gov-test-filter-field date-range">
                  <label>Rentang Tanggal</label>
                  <div className="gov-test-date-picker">
                    <GovIcon name="calendar" />
                    <select
                      aria-label="Rentang Tanggal"
                      className="gov-date-select"
                      onChange={(e) => setDateFilterRange(e.target.value as "ALL" | "TODAY" | "7D" | "30D")}
                      style={{ background: "transparent", border: "none", color: "inherit", font: "inherit", cursor: "pointer", outline: "none" }}
                      value={dateFilterRange}
                    >
                      <option value="ALL">Semua Waktu</option>
                      <option value="TODAY">Hari Ini</option>
                      <option value="7D">7 Hari Terakhir</option>
                      <option value="30D">30 Hari Terakhir</option>
                    </select>
                  </div>
                </div>

                <div className="gov-test-filter-action">
                  <button className="gov-test-filter-btn" type="button">
                    <GovIcon name="filter" />
                    <span>Filter</span>
                  </button>
                </div>
              </div>

              {/* Table Card */}
              <div className="gov-table-card">
                <div className="gov-table-wrap">
                  <table className="gov-test-table">
                    <thead>
                      <tr>
                        <th>Agent</th>
                        <th>Category</th>
                        <th>Test Key</th>
                        <th>Expected</th>
                        <th>Actual</th>
                        <th>Status</th>
                        <th>
                          <span className="gov-th-sort">
                            Last Run <GovIcon name="arrow_down" />
                          </span>
                        </th>
                        <th style={{ textAlign: "center" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTestEvidence.map((te) => (
                        <tr key={te.id}>
                          <td><strong className="gov-test-agent-name">{te.agentName}</strong></td>
                          <td><span className="gov-test-category">{te.category}</span></td>
                          <td><span className="gov-test-key">{te.testKey}</span></td>
                          <td><span className="gov-test-val">{te.expected}</span></td>
                          <td><span className="gov-test-val">{te.actual}</span></td>
                          <td>
                            <span className={`gov-test-status-pill ${te.status.toLowerCase().replace(' ', '-')}`}>
                              {te.status}
                            </span>
                          </td>
                          <td><span className="gov-test-time">{te.lastRun}</span></td>
                          <td style={{ textAlign: "center" }}>
                            <button
                              className="gov-test-view-btn"
                              onClick={() => {
                                if (te.changeRequestId) {
                                  void handleOpenReleaseInspect(te.changeRequestId, undefined, "tests");
                                } else {
                                  setTargetRunAgentKey(te.agentKey);
                                  setTargetRunAgentName(te.agentName);
                                  setRunIsTesting(true);
                                  setRunInputText(
                                    JSON.stringify(
                                      {
                                        test_key: te.testKey,
                                        category: te.category,
                                        expected: te.expected,
                                        actual: te.actual,
                                      },
                                      null,
                                      2
                                    )
                                  );
                                  setSafetyModal("RUN_AGENT");
                                }
                              }}
                              type="button"
                            >
                              Run / Inspect
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredTestEvidence.length === 0 && (
                        <tr>
                          <td colSpan={8} style={{ textAlign: "center", padding: "32px", color: "#6e847a" }}>
                            Tidak ada test evidence yang sesuai dengan kriteria filter.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Table Pagination Footer */}
                <div className="gov-rel-pagination">
                  <span>
                    {testEvidenceList.length === 0
                      ? "Menampilkan 0 test hasil"
                      : `Menampilkan 1 - ${filteredTestEvidence.length} dari ${testEvidenceList.length} test hasil`}
                  </span>
                  <div className="gov-rel-page-btns">
                    <button className="gov-rel-page-btn" disabled type="button">
                      &lt;
                    </button>
                    <button className="gov-rel-page-btn active" type="button">
                      1
                    </button>
                    <button className="gov-rel-page-btn" disabled type="button">
                      &gt;
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------
              View: Agent Control -> Reviews & Approval
              ---------------------------------------------------------------- */}
          {view === "agents" && agentSubView === "reviews" && (
            <div className="gov-agent-header">
              <div className="gov-page-header">
                <div className="gov-page-title">
                  <div className="gov-breadcrumb">
                    Agent Control / <span>Reviews &amp; Approval</span>
                  </div>
                  <h2>Reviews &amp; Approval</h2>
                  <p>Daftar permintaan rilis dan perubahan kebijakan agent yang memerlukan persetujuan manusia.</p>
                </div>
              </div>

              <div className="gov-table-card">
                <div className="gov-table-wrap">
                  <table className="gov-actions-table">
                    <thead>
                      <tr>
                        <th>Agent</th>
                        <th>Tipe Permintaan</th>
                        <th>Diajukan Oleh</th>
                        <th>Menunggu Sejak</th>
                        <th>Prioritas</th>
                        <th style={{ textAlign: "right", paddingRight: "20px" }}>Aksi Evaluasi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingActions.map((act) => (
                        <tr key={act.id}>
                          <td><strong className="agent-name">{act.agentName}</strong></td>
                          <td>{act.type}</td>
                          <td>{act.requestedBy}</td>
                          <td>{act.waitingSince}</td>
                          <td>
                            <span
                              className={`gov-priority-badge ${
                                act.priority === "Tinggi" ? "high" : act.priority === "Sedang" ? "medium" : "low"
                              }`}
                            >
                              {act.priority}
                            </span>
                          </td>
                          <td style={{ textAlign: "right", paddingRight: "20px" }}>
                            <button
                              className="gov-review-btn"
                              onClick={() => void handleOpenReleaseInspect(act.id, undefined, "reviews")}
                              style={{ background: "#0c3b2f", color: "#ffffff", borderColor: "#0c3b2f" }}
                              type="button"
                            >
                              Buka Evaluasi &amp; Review
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------
              View: Controls / Permissions (Image 3)
              ---------------------------------------------------------------- */}
          {view === "permissions" && (
            <div className="gov-agent-header">
              {/* Page Sub-header */}
              <div className="gov-page-header">
                <div className="gov-page-title">
                  <div className="gov-breadcrumb">
                    Controls / <span>Permissions</span>
                  </div>
                  <h2>Agent Permissions</h2>
                  <p>Kelola dan monitor permission agent.</p>
                </div>
              </div>

              {/* Toolbar */}
              <div className="gov-ag-toolbar">
                <div className="gov-ag-search">
                  <GovIcon name="search" />
                  <input
                    onChange={(e) => setPermSearch(e.target.value)}
                    placeholder="Cari permission..."
                    type="text"
                    value={permSearch}
                  />
                </div>

                <div className="gov-ag-filter-group">
                  <div className="gov-ag-select-wrap">
                    <select
                      className="gov-ag-select"
                      onChange={(e) => setPermFilterAgent(e.target.value)}
                      value={permFilterAgent}
                    >
                      <option value="ALL">Semua Agent</option>
                      {filterPermAgentOptions.map((ag) => (
                        <option key={ag.key} value={ag.key}>
                          {ag.name} ({ag.key})
                        </option>
                      ))}
                    </select>
                    <GovIcon name="chevron" />
                  </div>

                  <div className="gov-ag-select-wrap">
                    <select
                      className="gov-ag-select"
                      onChange={(e) => setPermFilterStatus(e.target.value)}
                      value={permFilterStatus}
                    >
                      <option value="ALL">Semua Status</option>
                      <option value="APPROVED">Approved</option>
                      <option value="DRAFT">Draft</option>
                      <option value="IN_REVIEW">In Review</option>
                      <option value="REVOKED">Revoked</option>
                    </select>
                    <GovIcon name="chevron" />
                  </div>

                  <button
                    className="gov-test-filter-btn"
                    onClick={() => {}}
                    type="button"
                  >
                    <GovIcon name="filter" />
                    <span>Filter</span>
                  </button>

                  <button
                    className="gov-ag-request-btn"
                    disabled={!canRegisterPermission(actorRoles)}
                    title={
                      canRegisterPermission(actorRoles)
                        ? "Daftarkan permission policy baru"
                        : "Pendaftaran permission policy memerlukan peran IT_ADMIN, EXECUTIVE, atau QA_ASSURANCE"
                    }
                    style={!canRegisterPermission(actorRoles) ? { opacity: 0.5, cursor: "not-allowed" } : undefined}
                    onClick={() => {
                      const firstAg = realAgents[0];
                      const firstKey = firstAg?.agent_key || "";
                      setNewPermAgentKey(firstKey);
                      setNewPermVersion(
                        resolveActiveAgentVersion(firstAg)?.semantic_version ||
                        firstAg?.versions[0]?.semantic_version ||
                        "1.0.0"
                      );
                      setNewPermKey("");
                      setNewPermCapability("");
                      setSafetyModal("NEW_PERMISSION");
                    }}
                    type="button"
                  >
                    <GovIcon name="plus" />
                    <span>New Permission</span>
                  </button>
                </div>
              </div>

              {/* Table Card */}
              <div className="gov-table-card">
                <div className="gov-table-wrap">
                  <table className="gov-perm-table">
                    <thead>
                      <tr>
                        <th>Agent</th>
                        <th>Permission</th>
                        <th>Capability</th>
                        <th>Access Mode</th>
                        <th>Status</th>
                        <th>Approved By</th>
                        <th style={{ textAlign: "right", paddingRight: "28px" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPermissions.map((pm) => (
                        <tr key={pm.id}>
                          <td><strong style={{ color: "#111827" }}>{pm.agentName}</strong></td>
                          <td><span className="gov-perm-key">{pm.permission}</span></td>
                          <td><span style={{ color: "#374151" }}>{pm.capability}</span></td>
                          <td><span style={{ color: "#374151" }}>{pm.accessMode}</span></td>
                          <td>
                            <span className={`gov-perm-status-badge ${pm.status.toLowerCase()}`}>
                              {pm.status}
                            </span>
                          </td>
                          <td><span style={{ color: "#4b5563" }}>{pm.approvedBy}</span></td>
                          <td style={{ textAlign: "right", paddingRight: "28px" }}>
                            {pm.status === "APPROVED" ? (
                              <span style={{ color: "#15803d", fontWeight: 600, fontSize: "0.76rem" }}>✓ Approved</span>
                            ) : pm.status === "REVOKED" ? (
                              <span style={{ color: "#b91c1c", fontWeight: 600, fontSize: "0.76rem" }}>Revoked</span>
                            ) : (
                              (() => {
                                const isMaker = Boolean(data?.actor?.user_id && pm.createdBy && data.actor.user_id === pm.createdBy);
                                return (
                                  <button
                                    className="gov-perm-action-btn"
                                    disabled={!canApprovePermission(actorRoles) || isMaker || submittingPerm}
                                    onClick={() => void handleApprovePermission(pm.id, pm.permission)}
                                    title={
                                      !canApprovePermission(actorRoles)
                                        ? "Hanya EXECUTIVE atau QA_ASSURANCE yang berwenang menyetujui permission policy."
                                        : isMaker
                                        ? "Maker tidak dapat menyetujui permission policy yang dibuat sendiri (Maker-Checker policy)."
                                        : undefined
                                    }
                                    type="button"
                                  >
                                    {submittingPerm ? "Memproses..." : "Approve"}
                                  </button>
                                );
                              })()
                            )}
                          </td>
                        </tr>
                      ))}
                      {filteredPermissions.length === 0 && (
                        <tr>
                          <td colSpan={7} style={{ textAlign: "center", padding: "32px", color: "#6e847a" }}>
                            Tidak ada permission policy yang cocok dengan filter pencarian.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Table Pagination Footer */}
                <div className="gov-rel-pagination">
                  <span>
                    {permissionsList.length === 0
                      ? "Menampilkan 0 permission"
                      : `Menampilkan 1 - ${filteredPermissions.length} dari ${permissionsList.length} permission`}
                  </span>
                  <div className="gov-rel-page-btns">
                    <button className="gov-rel-page-btn" disabled type="button">&lt;</button>
                    <button className="gov-rel-page-btn active" type="button">1</button>
                    <button className="gov-rel-page-btn" disabled type="button">&gt;</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------
              View: Controls / Runtime & Monitoring (Image 2)
              ---------------------------------------------------------------- */}
          {view === "runtime" && (
            <div className="gov-agent-header">
              {/* Page Sub-header */}
              <div className="gov-page-header">
                <div className="gov-page-title">
                  <div className="gov-breadcrumb">
                    Controls / <span>Runtime &amp; Monitoring</span>
                  </div>
                  <h2>Runtime &amp; Monitoring</h2>
                  <p>Pantau aktivitas runtime agent secara real-time dan historis.</p>
                </div>

                <div className="gov-page-controls">
                  <span className="gov-live-badge">
                    <i className="gov-live-dot" />
                    Live
                  </span>
                </div>
              </div>

              {/* Filter Toolbar */}
              <div className="gov-ag-toolbar" style={{ justifyContent: "flex-start", gap: "12px" }}>
                <div className="gov-ag-select-wrap">
                  <select
                    className="gov-ag-select"
                    onChange={(e) => setRuntimeFilterAgent(e.target.value)}
                    value={runtimeFilterAgent}
                  >
                    <option value="ALL">Semua Agent</option>
                    {realAgents.map((ag) => (
                      <option key={ag.agent_key} value={ag.agent_key}>
                        {ag.name} ({ag.agent_key})
                      </option>
                    ))}
                  </select>
                  <GovIcon name="chevron" />
                </div>

                <div className="gov-ag-select-wrap">
                  <select
                    className="gov-ag-select"
                    onChange={(e) => setRuntimeFilterStatus(e.target.value)}
                    value={runtimeFilterStatus}
                  >
                    <option value="ALL">Semua Status</option>
                    <option value="SUCCESS">Success</option>
                    <option value="FAILED">Failed</option>
                    <option value="BLOCKED">Blocked</option>
                  </select>
                  <GovIcon name="chevron" />
                </div>

                <div className="gov-test-date-picker">
                  <GovIcon name="calendar" />
                  <select
                    aria-label="Rentang Tanggal"
                    className="gov-date-select"
                    onChange={(e) => setDateFilterRange(e.target.value as "ALL" | "TODAY" | "7D" | "30D")}
                    style={{ background: "transparent", border: "none", color: "inherit", font: "inherit", cursor: "pointer", outline: "none" }}
                    value={dateFilterRange}
                  >
                    <option value="ALL">Semua Waktu</option>
                    <option value="TODAY">Hari Ini</option>
                    <option value="7D">7 Hari Terakhir</option>
                    <option value="30D">30 Hari Terakhir</option>
                  </select>
                </div>

                <button
                  className="gov-test-filter-btn"
                  onClick={() => {}}
                  type="button"
                >
                  <GovIcon name="filter" />
                  <span>Filter</span>
                </button>
              </div>

              {/* Table Card */}
              <div className="gov-table-card">
                <div className="gov-table-wrap">
                  <table className="gov-run-table">
                    <thead>
                      <tr>
                        <th>Run ID</th>
                        <th>Agent</th>
                        <th>Version</th>
                        <th>Status</th>
                        <th>Tokens</th>
                        <th>Cost (USD)</th>
                        <th>Latency</th>
                        <th>Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRuntimeMonitoring.map((rn) => (
                        <tr key={rn.id}>
                          <td><span className="gov-run-id">{rn.runId}</span></td>
                          <td><strong style={{ color: "#111827" }}>{rn.agentName}</strong></td>
                          <td><span style={{ color: "#4b5563" }}>{rn.version}</span></td>
                          <td>
                            <span className={`gov-run-status-badge ${rn.status.toLowerCase()}`}>
                              {rn.status}
                            </span>
                          </td>
                          <td><span style={{ color: "#374151" }}>{rn.tokens}</span></td>
                          <td><span style={{ color: "#374151" }}>{rn.costUsd}</span></td>
                          <td><span style={{ color: "#374151" }}>{rn.latency}</span></td>
                          <td><span style={{ color: "#6b7280" }}>{rn.time}</span></td>
                        </tr>
                      ))}
                      {filteredRuntimeMonitoring.length === 0 && (
                        <tr>
                          <td colSpan={8} style={{ textAlign: "center", padding: "32px", color: "#6e847a" }}>
                            Tidak ada aktivitas runtime yang sesuai dengan filter.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Table Pagination Footer */}
                <div className="gov-rel-pagination">
                  <span>
                    {runtimeMonitoringList.length === 0
                      ? "Menampilkan 0 runtime"
                      : `Menampilkan 1 - ${filteredRuntimeMonitoring.length} dari ${runtimeMonitoringList.length} runtime`}
                  </span>
                  <div className="gov-rel-page-btns">
                    <button className="gov-rel-page-btn" disabled type="button">&lt;</button>
                    <button className="gov-rel-page-btn active" type="button">1</button>
                    <button className="gov-rel-page-btn" disabled type="button">&gt;</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------
              View: Controls / Budget (Image 1)
              ---------------------------------------------------------------- */}
          {view === "budget" && (
            <div className="gov-agent-header">
              {/* Page Sub-header */}
              <div className="gov-page-header">
                <div className="gov-page-title">
                  <div className="gov-breadcrumb">
                    Controls / <span>Budget</span>
                  </div>
                  <h2>Budget</h2>
                  <p>Pengelolaan biaya dan limit AI.</p>
                </div>

                <div className="gov-page-controls">
                  <div className="gov-test-date-picker">
                    <GovIcon name="calendar" />
                    <select
                      aria-label="Rentang Tanggal"
                      className="gov-date-select"
                      onChange={(e) => setDateFilterRange(e.target.value as "ALL" | "TODAY" | "7D" | "30D")}
                      style={{ background: "transparent", border: "none", color: "inherit", font: "inherit", cursor: "pointer", outline: "none" }}
                      value={dateFilterRange}
                    >
                      <option value="ALL">Semua Waktu</option>
                      <option value="TODAY">Hari Ini</option>
                      <option value="7D">7 Hari Terakhir</option>
                      <option value="30D">30 Hari Terakhir</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Sub-tabs */}
              <div className="gov-budget-tabs">
                <button
                  className={`gov-budget-tab-btn ${budgetSubTab === "budget" ? "active" : ""}`}
                  onClick={() => setBudgetSubTab("budget")}
                  type="button"
                >
                  Budget
                </button>
                <button
                  className={`gov-budget-tab-btn ${budgetSubTab === "killswitch" ? "active" : ""}`}
                  onClick={() => setBudgetSubTab("killswitch")}
                  type="button"
                >
                  Kill Switch / Rollback
                </button>
                <button
                  className={`gov-budget-tab-btn ${budgetSubTab === "audit" ? "active" : ""}`}
                  onClick={() => setBudgetSubTab("audit")}
                  type="button"
                >
                  Audit Trail
                </button>
              </div>

              {/* Sub-tab: Budget Main Content */}
              {budgetSubTab === "budget" && (
                <div className="gov-budget-grid">
                  {/* Left Column */}
                  <div className="gov-budget-col">
                    {/* Card 1: Budget Terpakai */}
                    <article className="gov-budget-card">
                      <h3>Budget Terpakai</h3>
                      <p className="subtitle">Persentase penggunaan biaya dari limit AI.</p>
                      <div className="gov-budget-stat-wrap">
                        <span className="gov-budget-big-pct">{budgetOverview.percentage}%</span>
                        <span className="gov-budget-fraction">
                          {budgetOverview.usedAmount} / {budgetOverview.totalAmount}
                        </span>
                      </div>
                      <div className="gov-bar-track">
                        <div
                          className="gov-bar-fill"
                          style={{ width: `${budgetOverview.percentage}%` }}
                        />
                      </div>
                    </article>

                    {/* Card 2: Limit Harian */}
                    <article className="gov-budget-card">
                      <h3>Limit Harian</h3>
                      <p className="subtitle">Batas harian untuk request, token, dan biaya.</p>
                      <div className="gov-limit-list">
                        <div className="gov-limit-item">
                          <div className="gov-limit-meta">
                            <span className="label">Request Limit</span>
                            <span className="val">
                              {budgetOverview.dailyLimits.requestLimit.used} /{" "}
                              {budgetOverview.dailyLimits.requestLimit.max} (
                              {budgetOverview.dailyLimits.requestLimit.percent}%)
                            </span>
                          </div>
                          <div className="gov-bar-track">
                            <div
                              className="gov-bar-fill"
                              style={{ width: `${budgetOverview.dailyLimits.requestLimit.percent}%` }}
                            />
                          </div>
                        </div>

                        <div className="gov-limit-item">
                          <div className="gov-limit-meta">
                            <span className="label">Output Token Limit</span>
                            <span className="val">
                              {budgetOverview.dailyLimits.outputTokenLimit.used} /{" "}
                              {budgetOverview.dailyLimits.outputTokenLimit.max} (
                              {budgetOverview.dailyLimits.outputTokenLimit.percent}%)
                            </span>
                          </div>
                          <div className="gov-bar-track">
                            <div
                              className="gov-bar-fill"
                              style={{ width: `${budgetOverview.dailyLimits.outputTokenLimit.percent}%` }}
                            />
                          </div>
                        </div>

                        <div className="gov-limit-item">
                          <div className="gov-limit-meta">
                            <span className="label">Cost Limit</span>
                            <span className="val">
                              {budgetOverview.dailyLimits.costLimit.used} /{" "}
                              {budgetOverview.dailyLimits.costLimit.max} (
                              {budgetOverview.dailyLimits.costLimit.percent}%)
                            </span>
                          </div>
                          <div className="gov-bar-track">
                            <div
                              className="gov-bar-fill"
                              style={{ width: `${budgetOverview.dailyLimits.costLimit.percent}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </article>
                  </div>

                  {/* Right Column */}
                  <div className="gov-budget-col">
                    {/* Card 3: Peringatan */}
                    <article className="gov-budget-card">
                      <h3>Peringatan</h3>
                      <div className="gov-balert-list">
                        {budgetOverview.alerts.map((al) => (
                          <div className="gov-balert-item" key={al.id}>
                            <div className={`gov-balert-icon ${al.type}`}>
                              {al.type === "info" ? (
                                <GovIcon name="info_circle" />
                              ) : (
                                <GovIcon name="warning_triangle" />
                              )}
                            </div>
                            <div className="gov-balert-body">
                              <strong>{al.title}</strong>
                              <p>{al.subtitle}</p>
                            </div>
                            <span className="gov-balert-time">{al.timeAgo}</span>
                          </div>
                        ))}
                      </div>
                    </article>

                    {/* Card 4: Quick Actions */}
                    <article className="gov-budget-card">
                      <h3>Quick Actions</h3>
                      <p className="subtitle" style={{ margin: "0 0 10px" }}>
                        Kelola budget dan lakukan tindakan cepat.
                      </p>
                      <div className="gov-baction-btns">
                        <button
                          className="gov-baction-btn primary"
                          disabled={!canChangeBudget(actorRoles)}
                          title={
                            canChangeBudget(actorRoles)
                              ? "Perbarui limit anggaran harian workspace"
                              : "Pengubahan budget memerlukan peran IT_ADMIN atau EXECUTIVE"
                          }
                          style={!canChangeBudget(actorRoles) ? { opacity: 0.5, cursor: "not-allowed" } : undefined}
                          onClick={() => {
                            setBudgetReqLimit(String(realBudget?.daily_request_limit || 1000));
                            setBudgetTokenLimit(String(realBudget?.daily_output_token_limit || 2500000));
                            setBudgetCostCap(String(realBudget?.daily_cost_cap_usd || "50.00"));
                            setSafetyModal("UPDATE_BUDGET");
                          }}
                          type="button"
                        >
                          Update Budget
                        </button>
                        <button
                          className="gov-baction-btn secondary"
                          onClick={() => setSafetyModal("BUDGET_DETAIL")}
                          type="button"
                        >
                          Lihat Detail
                        </button>
                      </div>
                    </article>
                  </div>
                </div>
              )}

              {/* Sub-tab: Kill Switch / Rollback in Budget */}
              {budgetSubTab === "killswitch" && renderKillSwitchView()}

              {/* Sub-tab: Audit Trail in Budget */}
              {budgetSubTab === "audit" && renderAuditTrailView()}
            </div>
          )}

          {/* ----------------------------------------------------------------
              View: Kill Switch / Rollbacks
              ---------------------------------------------------------------- */}
          {view === "safety" && renderKillSwitchView()}

          {/* ----------------------------------------------------------------
              View: Audit Trail
              ---------------------------------------------------------------- */}
          {view === "audit" && renderAuditTrailView()}

          {/* ----------------------------------------------------------------
              View: Sources & Vault (Source Management & Verification)
              ---------------------------------------------------------------- */}
          {view === "sources" && (
            <SourcesView
              actorRoles={actorRoles}
              onError={setError}
              onNotice={setNotice}
              workspaceId={workspaceId}
            />
          )}
        </div>
      </section>

      {/* Interactive Safety & Audit Modals */}
      {renderSafetyModals()}
    </main>
  );
}

// ----------------------------------------------------------------------------
// Sub-components: Vector Donut Chart
// ----------------------------------------------------------------------------
function GovDonutChart({ items }: { items: Array<{ key: string; percent: number; color: string }> }) {
  const radius = 68;
  const circumference = 2 * Math.PI * radius;
  const itemsWithOffset = items.reduce<Array<{ key: string; percent: number; color: string; offset: number }>>((acc, item) => {
    const previousOffset = acc.length > 0 ? acc[acc.length - 1].offset + acc[acc.length - 1].percent : 0;
    return [...acc, { ...item, offset: previousOffset }];
  }, []);

  return (
    <svg viewBox="0 0 180 180">
      <circle
        cx="90"
        cy="90"
        fill="transparent"
        r={radius}
        stroke="#edf2ef"
        strokeWidth="24"
      />
      {itemsWithOffset.map((item) => (
        <circle
          cx="90"
          cy="90"
          fill="transparent"
          key={item.key}
          r={radius}
          stroke={item.color}
          strokeDasharray={`${(item.percent / 100) * circumference} ${circumference}`}
          strokeDashoffset={-((item.offset / 100) * circumference)}
          strokeLinecap="butt"
          strokeWidth="24"
          style={{ transition: "stroke-dashoffset 0.5s ease" }}
        />
      ))}
    </svg>
  );
}

// ----------------------------------------------------------------------------
// Sub-components: Vector SVG Icons
// ----------------------------------------------------------------------------
function GovIcon({ name, className = "", size = 18 }: { name: string; className?: string; size?: number }) {
  const commonProps = {
    width: size,
    height: size,
    className: `gov-icon ${className}`.trim(),
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (name) {
    case "overview":
    case "home":
      return (
        <svg {...commonProps}>
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      );
    case "agents":
    case "robot":
      return (
        <svg {...commonProps}>
          <rect height="12" rx="2" width="16" x="4" y="8" />
          <circle cx="9" cy="13" r="1.5" />
          <circle cx="15" cy="13" r="1.5" />
          <path d="M12 4v4M8 4h8" />
        </svg>
      );
    case "permissions":
    case "shield":
      return (
        <svg {...commonProps}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <polyline points="9 12 11 14 15 10" />
        </svg>
      );
    case "runtime":
    case "activity":
      return (
        <svg {...commonProps}>
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      );
    case "budget":
    case "database":
      return (
        <svg {...commonProps}>
          <ellipse cx="12" cy="5" rx="9" ry="3" />
          <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
        </svg>
      );
    case "safety":
    case "power":
      return (
        <svg {...commonProps}>
          <path d="M18.36 6.64a9 9 0 1 1-12.73 0M12 2v10" />
        </svg>
      );
    case "audit":
    case "file":
      return (
        <svg {...commonProps}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" x2="8" y1="13" y2="13" />
          <line x1="16" x2="8" y1="17" y2="17" />
        </svg>
      );
    case "back":
      return (
        <svg {...commonProps}>
          <line x1="19" x2="5" y1="12" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
      );
    case "users":
      return (
        <svg {...commonProps}>
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case "clock":
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      );
    case "play":
    case "play_triangle":
      return (
        <svg {...commonProps} fill="currentColor" stroke="none">
          <polygon points="6 4 20 12 6 20 6 4" />
        </svg>
      );
    case "pause":
      return (
        <svg {...commonProps} fill="currentColor" stroke="none">
          <rect height="16" rx="1" width="4" x="6" y="4" />
          <rect height="16" rx="1" width="4" x="14" y="4" />
        </svg>
      );
    case "hourglass":
      return (
        <svg {...commonProps}>
          <path d="M5 22h14M5 2h14M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2" />
        </svg>
      );
    case "alert":
    case "warning_triangle":
      return (
        <svg {...commonProps}>
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" x2="12" y1="9" y2="13" />
          <circle cx="12" cy="17" fill="currentColor" r="1" stroke="none" />
        </svg>
      );
    case "ban":
    case "blocked":
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="10" />
          <line x1="4.93" x2="19.07" y1="4.93" y2="19.07" />
        </svg>
      );
    case "search":
      return (
        <svg {...commonProps}>
          <circle cx="11" cy="11" r="8" />
          <line x1="21" x2="16.65" y1="21" y2="16.65" />
        </svg>
      );
    case "bell":
      return (
        <svg {...commonProps}>
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      );
    case "chevron":
    case "arrow_down":
      return (
        <svg {...commonProps}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      );
    case "calendar":
      return (
        <svg {...commonProps}>
          <rect height="18" rx="2" width="18" x="3" y="4" />
          <line x1="16" x2="16" y1="2" y2="6" />
          <line x1="8" x2="8" y1="2" y2="6" />
          <line x1="3" x2="21" y1="10" y2="10" />
        </svg>
      );
    case "approved":
    case "check":
      return (
        <svg {...commonProps}>
          <polyline points="20 6 9 17 4 12" />
        </svg>
      );
    case "test":
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="7" />
          <circle cx="12" cy="12" r="2" />
        </svg>
      );
    case "open":
      return (
        <svg {...commonProps}>
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <polyline points="15 3 21 3 21 9" />
          <line x1="10" x2="21" y1="14" y2="3" />
        </svg>
      );
    case "review":
      return (
        <svg {...commonProps}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      );
    case "chart":
      return (
        <svg {...commonProps}>
          <line x1="18" x2="18" y1="20" y2="10" />
          <line x1="12" x2="12" y1="20" y2="4" />
          <line x1="6" x2="6" y1="20" y2="14" />
        </svg>
      );
    case "settings":
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      );
    case "filter":
      return (
        <svg {...commonProps}>
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
        </svg>
      );
    case "plus":
      return (
        <svg {...commonProps}>
          <line x1="12" x2="12" y1="5" y2="19" />
          <line x1="5" x2="19" y1="12" y2="12" />
        </svg>
      );
    case "policy":
      return (
        <svg {...commonProps}>
          <rect height="14" rx="2" width="18" x="3" y="5" />
          <line x1="7" x2="17" y1="10" y2="10" />
          <line x1="7" x2="13" y1="14" y2="14" />
        </svg>
      );
    case "dots":
      return (
        <svg {...commonProps} fill="currentColor" stroke="none">
          <circle cx="5" cy="12" r="1.75" />
          <circle cx="12" cy="12" r="1.75" />
          <circle cx="19" cy="12" r="1.75" />
        </svg>
      );
    case "scope":
      return (
        <svg {...commonProps}>
          <polygon points="12 2 2 7 12 12 22 7 12 2" />
          <polyline points="2 17 12 22 22 17" />
          <polyline points="2 12 12 17 22 12" />
        </svg>
      );
    case "shield_check":
      return (
        <svg {...commonProps}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <polyline points="9 12 11 14 15 10" />
        </svg>
      );
    case "sort":
      return (
        <svg {...commonProps}>
          <polyline points="7 10 12 5 17 10" />
          <polyline points="17 14 12 19 7 14" />
        </svg>
      );
    case "search_file":
      return (
        <svg {...commonProps}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <circle cx="11" cy="14" r="3" />
          <line x1="13.5" x2="16" y1="16.5" y2="19" />
        </svg>
      );
    case "info_circle":
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="10" />
          <line x1="12" x2="12" y1="16" y2="12" />
          <circle cx="12" cy="8" fill="currentColor" r="1" stroke="none" />
        </svg>
      );
    default:
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="9" />
        </svg>
      );
  }
}

async function loadFoundation(): Promise<Foundation> {
  const [actor, workspaces, policy] = await Promise.all([
    loadSessionActor(),
    loadAccessibleWorkspaces(),
    api<ModelPolicy>("/api/v1/governance/model-policy"),
  ]);
  return { actor, workspaces, policy };
}

async function loadAudit(workspaceId?: string): Promise<Pick<DashboardData, "audit" | "auditRestricted">> {
  try {
    const url = workspaceId
      ? `/api/v1/audit-events?workspace_id=${workspaceId}&limit=50`
      : `/api/v1/audit-events?limit=50`;
    const audit = await api<AuditEvent[]>(url);
    return {
      audit,
      auditRestricted: false,
    };
  } catch (error: unknown) {
    if (error instanceof ApiError && error.status === 403) {
      return { audit: [], auditRestricted: true };
    }
    throw error;
  }
}

function foundationOf(data: DashboardData): Foundation {
  return { actor: data.actor, workspaces: data.workspaces, policy: data.policy };
}

function triggerAuditDownload(logs: AuditTrailRecord[], format: "csv" | "json"): void {
  const timestamp = Date.now();
  if (format === "json") {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `alos_audit_trail_${timestamp}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  } else {
    const headers = "Hash,Action,Severity,Actor,Target,Reason,OccurredAt\n";
    const rows = logs
      .map(
        (r) =>
          `"${r.hash}","${r.action}","${r.severity}","${r.actor.name}","${r.entityId}","${r.reason.replace(
            /"/g,
            '""'
          )}","${r.occurredAt}"`
      )
      .join("\n");
    const dataStr = "data:text/csv;charset=utf-8," + encodeURIComponent(headers + rows);
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `alos_audit_trail_${timestamp}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }
}
