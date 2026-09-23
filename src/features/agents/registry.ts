export type JsonObject = Record<string, unknown>;

export type AgentContractSnapshot = {
  agent_key: string;
  name: string;
  workspace_id: string;
  parent_agent_key: string | null;
  purpose: string;
  risk_level: RiskLevel;
  owner_user_id: string;
  input_schema: JsonObject;
  output_schema: JsonObject;
  model_policy: JsonObject;
  tool_keys: string[];
  permission_keys: string[];
  evidence_requirements: string[];
  forbidden_actions: string[];
  kpis: JsonObject[];
  approval_required: boolean;
  timeout_seconds: number;
  prompt_template: string;
};

export type AgentVersion = {
  agent_version_id: string;
  semantic_version: string;
  lifecycle_status: string;
  digest: string;
  contract_snapshot: AgentContractSnapshot;
  created_at?: string;
};

export type AgentRecord = {
  agent_contract_id: string;
  agent_key: string;
  name: string;
  workspace_id: string;
  parent_agent_key: string | null;
  agent_level: number;
  risk_level: RiskLevel;
  created_at?: string;
  updated_at?: string;
  active_version_id?: string | null;
  released_version_id?: string | null;
  versions: AgentVersion[];
};

export type AgentDraftResult = {
  agent_contract_id: string;
  agent_version_id: string;
  agent_key: string;
  semantic_version: string;
  lifecycle_status: "DRAFT" | "RETIRED";
  agent_level: number;
  digest: string;
  correlation_id: string;
};

export type ToolDecision = {
  tool_key: string;
  decision: "ALLOWED" | "BLOCKED";
  reason: string;
};

export type AgentRunResult = {
  agent_run_id: string;
  agent_key: string;
  semantic_version: string;
  status: "SUCCEEDED" | "FAILED" | "BLOCKED";
  correlation_id: string;
  output: JsonObject | null;
  provider: string | null;
  model: string | null;
  input_tokens: number | null;
  output_tokens: number | null;
  latency_milliseconds: number | null;
  estimated_cost_usd: string | null;
  tool_decisions: ToolDecision[];
  error_code: string | null;
};

export type AgentRunForm = {
  input: string;
  requestedToolKeys: string;
};

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type DataClassification = "PUBLIC" | "INTERNAL" | "CONFIDENTIAL" | "RESTRICTED";

export type AgentDraftForm = {
  agentKey: string;
  name: string;
  parentAgentKey: string;
  objective: string;
  inputSchema: string;
  outputSchema: string;
  toolKeys: string;
  permissionKeys: string;
  riskLevel: RiskLevel;
  approvalRequired: boolean;
  timeoutSeconds: string;
  dataClassification: DataClassification;
  forbiddenActions: string;
  kpis: string;
};

export type AgentDraftPayload = {
  workspace_id: string;
  agent_key: string;
  name: string;
  objective: string;
  parent_agent_key?: string;
  risk_level: RiskLevel;
  input_schema: JsonObject;
  output_schema: JsonObject;
  model_policy: JsonObject;
  tool_keys: string[];
  permission_keys: string[];
  approval_required: boolean;
  timeout_seconds: number;
  data_classification: DataClassification;
  forbidden_actions: string[];
  kpis: JsonObject[];
};

export const agentBuilderSteps = [
  "Identitas",
  "Tujuan",
  "Schema",
  "Tool & izin",
  "Risiko",
  "Prompt & DRAFT",
] as const;

export function canEditAgentRegistry(roles: string[]): boolean {
  return roles.includes("IT_LEAD");
}

export function canReadAgentRegistry(roles: string[]): boolean {
  return roles.some((role) => ["DIRECTOR", "DIVISION_OWNER", "IT_LEAD", "QA_SECURITY", "BUSINESS_REVIEWER", "TECHNICAL_REVIEWER"].includes(role));
}

export function agentCrudPolicy(lifecycleStatus: string) {
  const mutable = ["DRAFT", "RETURNED"].includes(lifecycleStatus);
  return {
    create: true,
    read: true,
    update: mutable,
    delete: mutable,
    createNewVersion: ["APPROVED", "RELEASED", "ACTIVE", "SUSPENDED", "ROLLED_BACK"].includes(lifecycleStatus),
  };
}

export function agentStateActions(lifecycleStatus: string): string[] {
  const matrix: Record<string, string[]> = {
    DRAFT: ["EDIT_DRAFT", "DELETE_DRAFT", "MANAGE_TESTS", "RUN_TESTS", "SUBMIT_REVIEW"],
    RETURNED: ["EDIT_DRAFT", "DELETE_DRAFT", "MANAGE_TESTS", "RUN_TESTS", "SUBMIT_REVIEW"],
    TESTED: ["VIEW_EVIDENCE", "CONTINUE_REVIEW"],
    IN_REVIEW: ["BUSINESS_REVIEW", "TECHNICAL_REVIEW"],
    APPROVED: ["RELEASE"],
    RELEASED: ["ACTIVATE"],
    ACTIVE: ["VIEW_RUNTIME", "SUSPEND", "KILL_SWITCH", "ROLLBACK", "CREATE_NEW_VERSION"],
    SUSPENDED: ["VIEW_REASON", "ROLLBACK", "CREATE_NEW_VERSION"],
    ROLLED_BACK: ["VIEW_HISTORY", "CREATE_NEW_VERSION"],
  };
  return matrix[lifecycleStatus] ?? ["READ_HISTORY"];
}

export function registryConflictMessage(detail?: string): string {
  const messages: Record<string, string> = {
    "agent key already exists in this organization": "Agent key sudah dipakai, termasuk oleh Agent yang dipensiunkan. Gunakan key baru.",
    "parent agent contract was not found": "Parent Agent tidak ditemukan pada organisasi ini.",
    "agent hierarchy cannot exceed level 2": "Hierarki Agent tidak boleh melebihi level 2.",
    "an agent contract cannot be moved between workspaces": "Workspace Agent tidak dapat diubah setelah dibuat.",
  };
  return messages[detail ?? ""] ?? "Perubahan ditolak: agent key, parent, atau level hierarchy tidak valid.";
}

export function runtimeBlockedMessage(detail?: string): string {
  const messages: Record<string, string> = {
    "daily request budget cap reached": "Limit request harian workspace telah tercapai.",
    "daily output token budget cap reached": "Limit output token harian workspace telah tercapai.",
    "daily cost budget cap reached": "Hard cost cap harian workspace telah tercapai.",
    "an active workspace cost limit is required": "Limit harian workspace belum aktif.",
    "an eligible DRAFT Agent Contract was not found": "Agent DRAFT aktif tidak ditemukan pada workspace ini.",
    "fixture runtime execution is disabled outside local/test/staging": "Fixture Runtime tidak diizinkan pada environment ini.",
  };
  return messages[detail ?? ""] ?? "Fixture Test diblokir oleh kontrol runtime. Tidak ada provider atau tool yang dijalankan.";
}

export function latestVersion(agent: AgentRecord): AgentVersion | undefined {
  if (agent.active_version_id) {
    const exact = agent.versions.find((v) => v.agent_version_id === agent.active_version_id);
    if (exact) return exact;
  }
  return (
    agent.versions.find((v) => v.lifecycle_status === "ACTIVE") ??
    agent.versions.find((v) => v.lifecycle_status === "SUSPENDED") ??
    agent.versions.find((v) => v.lifecycle_status === "RELEASED") ??
    agent.versions[0]
  );
}

export function eligibleParents(agents: AgentRecord[], editingAgentKey = ""): AgentRecord[] {
  return agents.filter((agent) => agent.agent_key !== editingAgentKey && agent.agent_level < 2);
}

export function emptyAgentDraftForm(): AgentDraftForm {
  return {
    agentKey: "",
    name: "",
    parentAgentKey: "",
    objective: "",
    inputSchema: '{\n  "type": "object",\n  "properties": {}\n}',
    outputSchema: '{\n  "type": "object",\n  "properties": {}\n}',
    toolKeys: "",
    permissionKeys: "",
    riskLevel: "LOW",
    approvalRequired: true,
    timeoutSeconds: "120",
    dataClassification: "INTERNAL",
    forbiddenActions: "Jangan menulis data, menghubungi pihak eksternal, membelanjakan dana, atau mengubah produksi.",
    kpis: '[\n  { "name": "quality", "target": 1 }\n]',
  };
}

export function emptyAgentRunForm(): AgentRunForm {
  return { input: "{}", requestedToolKeys: "" };
}

export function runPayloadFromForm(form: AgentRunForm, workspaceId: string) {
  return {
    workspace_id: workspaceId,
    input: parseJsonObject(form.input, "Input fixture"),
    requested_tool_keys: splitKeys(form.requestedToolKeys),
  };
}

export function formFromAgent(agent: AgentRecord): AgentDraftForm {
  const snapshot = latestVersion(agent)?.contract_snapshot;
  if (!snapshot) {
    return emptyAgentDraftForm();
  }
  return {
    agentKey: snapshot.agent_key,
    name: snapshot.name,
    parentAgentKey: snapshot.parent_agent_key ?? "",
    objective: snapshot.purpose,
    inputSchema: JSON.stringify(snapshot.input_schema, null, 2),
    outputSchema: JSON.stringify(snapshot.output_schema, null, 2),
    toolKeys: snapshot.tool_keys.join(", "),
    permissionKeys: snapshot.permission_keys.join(", "),
    riskLevel: snapshot.risk_level,
    approvalRequired: snapshot.approval_required,
    timeoutSeconds: String(snapshot.timeout_seconds),
    dataClassification: "INTERNAL",
    forbiddenActions: snapshot.forbidden_actions.join("\n"),
    kpis: JSON.stringify(snapshot.kpis, null, 2),
  };
}

export function draftPayloadFromForm(
  form: AgentDraftForm,
  workspaceId: string,
): AgentDraftPayload {
  const agentKey = form.agentKey.trim().toUpperCase();
  if (!/^[A-Z][A-Z0-9_]{2,79}$/.test(agentKey)) {
    throw new Error("Agent key harus memakai huruf kapital, angka, atau underscore (3–80 karakter).");
  }
  if (form.name.trim().length === 0) {
    throw new Error("Nama agent wajib diisi.");
  }
  if (form.objective.trim().length < 20) {
    throw new Error("Tujuan agent minimal 20 karakter.");
  }
  const timeoutSeconds = Number(form.timeoutSeconds);
  if (!Number.isInteger(timeoutSeconds) || timeoutSeconds < 1 || timeoutSeconds > 3600) {
    throw new Error("Timeout harus berupa bilangan antara 1 dan 3.600 detik.");
  }
  if (["HIGH", "CRITICAL"].includes(form.riskLevel) && !form.approvalRequired) {
    throw new Error("Agent berisiko tinggi atau kritis wajib memerlukan persetujuan manusia.");
  }
  const forbiddenActions = form.forbiddenActions
    .split("\n")
    .map((value) => value.trim())
    .filter(Boolean);
  if (forbiddenActions.length === 0) {
    throw new Error("Minimal satu forbidden action wajib diisi.");
  }
  return {
    workspace_id: workspaceId,
    agent_key: agentKey,
    name: form.name.trim(),
    objective: form.objective.trim(),
    ...(form.parentAgentKey ? { parent_agent_key: form.parentAgentKey } : {}),
    risk_level: form.riskLevel,
    input_schema: parseJsonObject(form.inputSchema, "Input schema"),
    output_schema: parseJsonObject(form.outputSchema, "Output schema"),
    model_policy: { model_route: "light", usage: "controlled_draft" },
    tool_keys: splitKeys(form.toolKeys),
    permission_keys: splitKeys(form.permissionKeys),
    approval_required: form.approvalRequired,
    timeout_seconds: timeoutSeconds,
    data_classification: form.dataClassification,
    forbidden_actions: forbiddenActions,
    kpis: parseJsonObjectArray(form.kpis, "KPI"),
  };
}

function splitKeys(value: string): string[] {
  return value.split(",").map((entry) => entry.trim()).filter(Boolean);
}

function parseJsonObject(value: string, label: string): JsonObject {
  try {
    const parsed: unknown = JSON.parse(value);
    if (parsed === null || Array.isArray(parsed) || typeof parsed !== "object") {
      throw new Error();
    }
    return parsed as JsonObject;
  } catch {
    throw new Error(`${label} harus berupa objek JSON yang valid.`);
  }
}

function parseJsonObjectArray(value: string, label: string): JsonObject[] {
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed) || parsed.length === 0 || parsed.some((item) => item === null || Array.isArray(item) || typeof item !== "object")) {
      throw new Error();
    }
    return parsed as JsonObject[];
  } catch {
    throw new Error(`${label} harus berupa array JSON non-kosong berisi objek.`);
  }
}
