import type { AgentRecord } from "@/features/agents/registry";

export const releaseStates = [
  "DRAFT",
  "TESTED",
  "IN_REVIEW",
  "RETURNED",
  "REJECTED",
  "APPROVED",
  "RELEASED",
  "ACTIVE",
  "SUSPENDED",
  "ROLLED_BACK",
] as const;

export type ReleaseState = (typeof releaseStates)[number];
export type TestCategory = "POSITIVE" | "NEGATIVE" | "REGRESSION" | "SECURITY" | "RECOVERY";
export type TestStatus = "PASSED" | "FAILED" | "BLOCKED" | "ERROR";
export type ReviewGate = "BUSINESS" | "TECHNICAL";
export type ReviewDecision = "APPROVED" | "REJECTED" | "RETURNED";
export type ReleaseWorkspaceView = "request" | "tests" | "reviews" | "safety" | "history";

export function formatReleaseState(state: ReleaseState | string): string {
  const labels: Record<string, string> = {
    DRAFT: "Draft",
    TESTED: "Tested",
    IN_REVIEW: "In Review",
    RETURNED: "Returned",
    REJECTED: "Rejected",
    APPROVED: "Approved",
    RELEASED: "Released",
    ACTIVE: "Active",
    SUSPENDED: "Suspended",
    ROLLED_BACK: "Rolled Back",
  };
  return labels[state] ?? state;
}

export type ReleaseRequest = {
  change_request_id: string;
  agent_key: string;
  agent_version_id: string;
  semantic_version: string;
  state: ReleaseState;
  requested_by_user_id: string;
  maker_user_id: string;
  checker_user_id: string | null;
  approver_user_id: string | null;
  kill_switch_active?: boolean;
  failed_test_count?: number;
};

export type TestCase = {
  test_case_id: string;
  agent_key: string;
  agent_version_id: string;
  test_key: string;
  category: TestCategory;
  input_fixture: Record<string, unknown>;
  expected_assertions: Record<string, unknown>;
};

export type TestRunEvidence = {
  test_run_id: string;
  test_case_id: string;
  test_key: string;
  category: TestCategory;
  status: TestStatus;
  agent_run_id: string | null;
  correlation_id: string;
  completed_at: string | null;
  actual_status: string | null;
  error_code: string | null;
  block_reason?: string | null;
};

export type Review = {
  review_gate: ReviewGate;
  decision: ReviewDecision;
  notes: string;
  reviewer_user_id?: string;
  reviewer_name?: string;
  division_code?: string | null;
  created_at: string;
};

export type LifecycleEvent = {
  event_sequence: number;
  from_state: ReleaseState | null;
  to_state: ReleaseState;
  reason: string;
  correlation_id: string;
  created_at: string;
};

export type ReleaseRequestDetail = ReleaseRequest & {
  requirement: string;
  test_cases: TestCase[];
  test_runs: TestRunEvidence[];
  reviews: Review[];
  lifecycle_events: LifecycleEvent[];
  kill_switch_active: boolean;
  rollback_targets: string[];
};

export type DesignerResult = {
  blueprint: { requirement: string; agent_key: string; risk_level: string; approval_required: boolean };
  draft: { agent_key: string; semantic_version: string; lifecycle_status: string; correlation_id: string };
};

export const releaseTestCategories: TestCategory[] = ["POSITIVE", "NEGATIVE", "REGRESSION", "SECURITY", "RECOVERY"];

export function canMakeRelease(roles: string[]): boolean {
  return roles.includes("IT_ADMIN");
}

/**
 * Match the backend Agent Registry read authority. Only the IT administrator may load
 * contracts; independent reviewers and the Director load release evidence without it.
 */
export function canReadReleaseRegistry(roles: string[]): boolean {
  return roles.some((role) => ["EXECUTIVE", "WORKSPACE_LEAD", "IT_ADMIN", "QA_ASSURANCE", "BUSINESS_REVIEWER", "TECHNICAL_REVIEWER"].includes(role));
}

export function canDesignAgent(roles: string[]): boolean {
  return roles.includes("IT_ADMIN");
}

export function canCheckRelease(roles: string[]): boolean {
  return roles.some((role) => ["QA_ASSURANCE", "TECHNICAL_REVIEWER"].includes(role));
}

export function canReviewGate(roles: string[]): ReviewGate | null {
  if (roles.includes("BUSINESS_REVIEWER")) return "BUSINESS";
  if (roles.includes("TECHNICAL_REVIEWER")) return "TECHNICAL";
  return null;
}

export function canReviewBusinessGate(roles: string[]): boolean {
  return roles.includes("BUSINESS_REVIEWER");
}

export function canReviewTechnicalGate(roles: string[]): boolean {
  return roles.includes("TECHNICAL_REVIEWER");
}

export function canApproveRelease(roles: string[]): boolean {
  return roles.includes("EXECUTIVE");
}

export function canOperateKillSwitch(roles: string[]): boolean {
  return roles.some((role) => ["EXECUTIVE", "IT_ADMIN"].includes(role));
}

export function draftAgents(agents: AgentRecord[]): AgentRecord[] {
  return agents.filter((agent) => agent.versions[0]?.lifecycle_status === "DRAFT");
}

export function defaultTestForm(category: TestCategory = "POSITIVE", agentKey?: string) {
  const positive = validationPositiveFixture(agentKey);

  let fixtureObj: Record<string, unknown>;
  let expectedStatus: "SUCCEEDED" | "FAILED" | "BLOCKED";

  switch (category) {
    case "POSITIVE":
      fixtureObj = {
        input: positive.input,
        ...(positive.requested_tool_keys ? { requested_tool_keys: positive.requested_tool_keys } : {}),
      };
      expectedStatus = "SUCCEEDED";
      break;
    case "NEGATIVE":
      // Input deliberately violating schema types and required fields to guarantee fail-closed BLOCKED
      fixtureObj = {
        input: {
          as_of_date: 12345,
          query: 12345,
          claim: 12345,
          malformed_schema_payload: true,
          missing_required_fields: true,
          test_category: "negative_input_validation",
        },
      };
      expectedStatus = "BLOCKED";
      break;
    case "REGRESSION":
      // Deterministic known stable baseline input
      fixtureObj = {
        input: positive.input,
        ...(positive.requested_tool_keys ? { requested_tool_keys: positive.requested_tool_keys } : {}),
        baseline_check: "deterministic_stable_baseline",
      };
      expectedStatus = "SUCCEEDED";
      break;
    case "SECURITY":
      // Forbidden action / unauthorized tool
      fixtureObj = {
        input: positive.input,
        requested_tool_keys: ["UNAUTHORIZED_TOOL"],
      };
      expectedStatus = "BLOCKED";
      break;
    case "RECOVERY":
      // Validates recovery-safe input contract path without claiming real external provider outage
      fixtureObj = {
        input: {
          ...(typeof positive.input === "object" && positive.input !== null ? (positive.input as Record<string, unknown>) : {}),
          recovery_contract_safe: true,
          simulate_fallback_retry: true,
        },
        ...(positive.requested_tool_keys ? { requested_tool_keys: positive.requested_tool_keys } : {}),
      };
      expectedStatus = "SUCCEEDED";
      break;
  }

  return {
    category,
    testKey: `RELEASE_${category}_FIXTURE`,
    fixture: JSON.stringify(fixtureObj, null, 2),
    expectedStatus,
  };
}

/**
 * The three validation contracts deliberately have different input schemas.
 * A generic `query` fixture made EVIDENCE_CHECKER's required `claim` field
 * fail before the shared Runtime could execute it. Keep this as a UI starter:
 * makers can still edit the JSON for every non-catalogue contract.
 */
function validationPositiveFixture(agentKey?: string): Record<string, unknown> {
  const sourceSearch = ["SOURCE_REGISTRY_SEARCH"];
  if (agentKey === "EVIDENCE_CHECKER") {
    return {
      input: { claim: "Periksa kesesuaian klaim internal dengan sumber terverifikasi." },
      requested_tool_keys: sourceSearch,
    };
  }
  if (agentKey === "DAILY_BRIEF" || agentKey === "PERMIT_OVERDUE_MONITOR") {
    return {
      input: { as_of_date: new Date().toISOString().slice(0, 10) },
      requested_tool_keys: sourceSearch,
    };
  }
  return { input: { query: "Buat ringkasan singkat untuk uji positif release." } };
}

export function testCasePayload(form: { testKey: string; category: TestCategory; fixture: string; expectedStatus: string }) {
  const testKey = form.testKey.trim().toUpperCase();
  if (!/^[A-Z][A-Z0-9_]{2,79}$/.test(testKey)) {
    throw new Error("Test key harus memakai huruf kapital, angka, atau underscore (3–80 karakter).");
  }
  if (!["SUCCEEDED", "FAILED", "BLOCKED"].includes(form.expectedStatus)) {
    throw new Error("Expected status tidak valid.");
  }
  return {
    test_key: testKey,
    category: form.category,
    input_fixture: parseJsonObject(form.fixture, "Fixture test"),
    expected_assertions: { status: form.expectedStatus },
  };
}

export function designerPayload(form: { workspaceId: string; requirement: string; agentKey: string; name: string; parentAgentKey: string }) {
  const requirement = form.requirement.trim();
  if (requirement.length < 20) throw new Error("Requirement minimal 20 karakter.");
  const agentKey = form.agentKey.trim().toUpperCase();
  if (agentKey && !/^[A-Z][A-Z0-9_]{2,79}$/.test(agentKey)) {
    throw new Error("Agent key opsional harus memakai huruf kapital, angka, atau underscore.");
  }
  return {
    workspace_id: form.workspaceId,
    requirement,
    ...(agentKey ? { agent_key: agentKey } : {}),
    ...(form.name.trim() ? { name: form.name.trim() } : {}),
    ...(form.parentAgentKey ? { parent_agent_key: form.parentAgentKey } : {}),
  };
}

export function releaseErrorMessage(detail?: string): string {
  const messages: Record<string, string> = {
    "a DRAFT Agent Contract version is required": "Pilih Agent dengan versi DRAFT untuk memulai release request.",
    "maker cannot act as checker": "Maker tidak dapat menjadi Checker pada request yang sama.",
    "positive, negative, regression, security, and recovery tests must pass": "Lima kategori test wajib lulus sebelum review.",
    "a successful Agent Run is required before review": "Minimal satu Agent Run sukses diperlukan sebelum review.",
    "business and technical review approvals are required": "Approval Business dan Technical wajib tersedia.",
    "only the recorded approver can release an approved request": "Hanya Approver yang tercatat yang dapat release.",
    "only the recorded approver can activate a released request": "Hanya Approver yang tercatat yang dapat mengaktifkan Agent.",
    "kill switch is active": "Kill switch aktif; Agent tidak dapat diaktifkan.",
    "clear the active kill switch before rollback": "Bersihkan kill switch secara eksplisit sebelum rollback.",
  };
  return messages[detail ?? ""] ?? "Aksi release ditolak oleh kontrol lifecycle atau separation of duties.";
}

export function latestRunByTestCase(runs: TestRunEvidence[]): Map<string, TestRunEvidence> {
  // API returns runs newest first. Keep the first entry for each test case;
  // constructing a Map directly would overwrite it with an older failure and
  // make a corrected, subsequently passed test look FAILED in the UI.
  const latest = new Map<string, TestRunEvidence>();
  for (const run of runs) {
    if (!latest.has(run.test_case_id)) latest.set(run.test_case_id, run);
  }
  return latest;
}

export function releaseProgress(state: ReleaseState): { current: number; total: number; percent: number } {
  const order: ReleaseState[] = ["DRAFT", "TESTED", "IN_REVIEW", "APPROVED", "RELEASED", "ACTIVE"];
  const current = Math.max(1, order.indexOf(state) + 1);
  return { current, total: order.length, percent: Math.round((current / order.length) * 100) };
}

export function releaseNextAction(detail: ReleaseRequestDetail, roles: string[]): { title: string; reason: string; view: ReleaseWorkspaceView } {
  if (detail.kill_switch_active) return { title: "Verifikasi dan clear Kill Switch", reason: "Agent dihentikan oleh kontrol darurat dan tidak dapat diaktifkan.", view: "safety" };
  if (["DRAFT", "RETURNED"].includes(detail.state)) {
    const latest = latestRunByTestCase(detail.test_runs);
    const incomplete = detail.test_cases.length < releaseTestCategories.length || detail.test_cases.some((testCase) => latest.get(testCase.test_case_id)?.status !== "PASSED");
    if (incomplete) return { title: canCheckRelease(roles) ? "Jalankan evidence test" : "Menunggu Checker independen", reason: "Lima kategori test harus memiliki hasil terbaru PASSED sebelum review.", view: "tests" };
    return { title: canCheckRelease(roles) ? "Kirim evidence untuk review" : "Menunggu Checker mengirim evidence", reason: "Evidence test sudah lengkap dan siap masuk review.", view: "tests" };
  }
  if (detail.state === "TESTED") return { title: "Kirim atau verifikasi review", reason: "Release telah lolos test dan harus masuk gate review manusia.", view: "reviews" };
  if (detail.state === "IN_REVIEW") return { title: canReviewGate(roles) ? "Selesaikan review Anda" : "Menunggu review Business dan Technical", reason: "Kedua gate harus disetujui oleh reviewer independen.", view: "reviews" };
  if (detail.state === "APPROVED") return { title: canApproveRelease(roles) ? "Release versi" : "Menunggu Approver merilis versi", reason: "Approval lengkap; hanya Approver tercatat yang dapat merilis.", view: "reviews" };
  if (detail.state === "RELEASED") return { title: canApproveRelease(roles) ? "Aktifkan Agent" : "Menunggu Approver mengaktifkan Agent", reason: "Versi sudah dirilis tetapi belum aktif.", view: "reviews" };
  if (detail.state === "ACTIVE") return { title: "Pantau runtime dan budget", reason: "Agent aktif; gunakan safety control hanya bila ada dampak operasional.", view: "safety" };
  return { title: "Tinjau riwayat lifecycle", reason: `Release berada pada status ${detail.state}.`, view: "history" };
}

export function mayAmendReleaseDraft(detail: ReleaseRequestDetail, actorId: string): boolean {
  return ["DRAFT", "RETURNED"].includes(detail.state) && detail.maker_user_id === actorId;
}

export function releaseTestReadiness(detail?: ReleaseRequestDetail | null): boolean {
  if (!detail || !detail.test_cases || !detail.test_runs) return false;
  const latestRuns = latestRunByTestCase(detail.test_runs);
  for (const cat of releaseTestCategories) {
    const matchingCases = detail.test_cases.filter((tc) => tc.category === cat);
    if (matchingCases.length === 0) return false;
    const allPassed = matchingCases.every((tc) => {
      const run = latestRuns.get(tc.test_case_id);
      return Boolean(run && run.status === "PASSED");
    });
    if (!allPassed) return false;
  }
  return true;
}

function parseJsonObject(value: string, label: string): Record<string, unknown> {
  try {
    const parsed: unknown = JSON.parse(value);
    if (parsed === null || Array.isArray(parsed) || typeof parsed !== "object") throw new Error();
    return parsed as Record<string, unknown>;
  } catch {
    throw new Error(`${label} harus berupa objek JSON yang valid.`);
  }
}

export interface VersionLike {
  agent_version_id: string;
  semantic_version: string;
  lifecycle_status: string;
}

export function resolveActiveAgentVersion<T extends VersionLike>(agent?: {
  active_version_id?: string | null;
  versions: T[];
} | null): T | undefined {
  if (!agent || !agent.versions) return undefined;
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

export function resolveRollbackTargets<T extends VersionLike>(
  activeVersionId: string | undefined,
  versions: T[],
  backendTargets?: string[]
): string[] {
  if (backendTargets && backendTargets.length > 0) {
    return backendTargets;
  }
  return versions
    .filter(
      (v) =>
        v.agent_version_id !== activeVersionId &&
        ["ACTIVE", "RELEASED", "ROLLED_BACK"].includes(v.lifecycle_status)
    )
    .map((v) => v.semantic_version);
}
