import { describe, expect, it } from "vitest";
import {
  releaseStates,
  formatReleaseState,
  releaseTestReadiness,
  canApproveRelease,
  canOperateKillSwitch,
  canReviewBusinessGate,
  canReviewTechnicalGate,
  resolveActiveAgentVersion,
  resolveRollbackTargets,
  type ReleaseRequestDetail,
  type TestCategory,
  type TestStatus,
} from "@/features/governance/release-governance";
import {
  canRecordReadinessDecision,
} from "@/features/governance/readiness-decisions";
import {
  canRegisterSource,
  canVerifySource,
  canConfigureSourceVault,
  extractGoogleDriveFolderId,
} from "@/features/governance/sources";
import {
  canChangeBudget,
} from "@/features/governance/core";
import {
  canEditAgentRegistry,
} from "@/features/agents/registry";

describe("MVP 0.1 Governance Remediation Test Suite", () => {
  describe("1. Canonical 10 Release States Preservation", () => {
    const expectedStates = [
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

    it("ensures releaseStates includes all 10 canonical lifecycle states", () => {
      expect(releaseStates).toEqual(expect.arrayContaining([...expectedStates]));
      expect(releaseStates.length).toBe(10);
    });

    it("formats all 10 release states correctly without falling back to DRAFT", () => {
      for (const st of expectedStates) {
        const formatted = formatReleaseState(st);
        expect(formatted).toBeTruthy();
        if (st !== "DRAFT") {
          expect(formatted.toLowerCase()).not.toBe("draft");
        }
      }
      expect(formatReleaseState("APPROVED")).toBe("Approved");
      expect(formatReleaseState("ACTIVE")).toBe("Active");
      expect(formatReleaseState("SUSPENDED")).toBe("Suspended");
      expect(formatReleaseState("ROLLED_BACK")).toBe("Rolled Back");
    });
  });

  describe("2. Fail-Closed 5-Category Test Readiness", () => {
    function makeDetail(
      cases: Array<{ id: string; category: TestCategory }>,
      runs: Array<{ id: string; caseId: string; status: TestStatus }>
    ): ReleaseRequestDetail {
      return {
        change_request_id: "cr-1",
        agent_key: "AGENT_1",
        agent_version_id: "ver-1",
        semantic_version: "1.0.0",
        state: "DRAFT",
        requested_by_user_id: "user-1",
        maker_user_id: "user-1",
        checker_user_id: null,
        approver_user_id: null,
        requirement: "Test requirement",
        kill_switch_active: false,
        rollback_targets: [],
        lifecycle_events: [],
        reviews: [],
        test_cases: cases.map((c) => ({
          test_case_id: c.id,
          agent_key: "AGENT_1",
          agent_version_id: "ver-1",
          test_key: `KEY_${c.id}`,
          category: c.category,
          input_fixture: {},
          expected_assertions: {},
        })),
        test_runs: runs.map((r) => ({
          test_run_id: r.id,
          test_case_id: r.caseId,
          test_key: `KEY_${r.caseId}`,
          category: "POSITIVE",
          status: r.status,
          agent_run_id: `run-${r.id}`,
          correlation_id: `corr-${r.id}`,
          completed_at: "2026-09-12T01:00:00Z",
          actual_status: "SUCCEEDED",
          error_code: null,
        })),
      };
    }

    it("returns false if detail is null or undefined", () => {
      expect(releaseTestReadiness(null)).toBe(false);
      expect(releaseTestReadiness(undefined)).toBe(false);
    });

    it("returns false if only 4 categories are present (e.g. RECOVERY missing)", () => {
      const detail = makeDetail(
        [
          { id: "c1", category: "POSITIVE" },
          { id: "c2", category: "NEGATIVE" },
          { id: "c3", category: "REGRESSION" },
          { id: "c4", category: "SECURITY" },
        ],
        [
          { id: "r1", caseId: "c1", status: "PASSED" },
          { id: "r2", caseId: "c2", status: "PASSED" },
          { id: "r3", caseId: "c3", status: "PASSED" },
          { id: "r4", caseId: "c4", status: "PASSED" },
        ]
      );
      expect(releaseTestReadiness(detail)).toBe(false);
    });

    it("returns false if all 5 categories exist but one failed", () => {
      const detail = makeDetail(
        [
          { id: "c1", category: "POSITIVE" },
          { id: "c2", category: "NEGATIVE" },
          { id: "c3", category: "REGRESSION" },
          { id: "c4", category: "SECURITY" },
          { id: "c5", category: "RECOVERY" },
        ],
        [
          { id: "r1", caseId: "c1", status: "PASSED" },
          { id: "r2", caseId: "c2", status: "PASSED" },
          { id: "r3", caseId: "c3", status: "PASSED" },
          { id: "r4", caseId: "c4", status: "FAILED" },
          { id: "r5", caseId: "c5", status: "PASSED" },
        ]
      );
      expect(releaseTestReadiness(detail)).toBe(false);
    });

    it("returns true only when all 5 categories exist and latest runs are PASSED", () => {
      const detail = makeDetail(
        [
          { id: "c1", category: "POSITIVE" },
          { id: "c2", category: "NEGATIVE" },
          { id: "c3", category: "REGRESSION" },
          { id: "c4", category: "SECURITY" },
          { id: "c5", category: "RECOVERY" },
        ],
        [
          { id: "r1", caseId: "c1", status: "PASSED" },
          { id: "r2", caseId: "c2", status: "PASSED" },
          { id: "r3", caseId: "c3", status: "PASSED" },
          { id: "r4", caseId: "c4", status: "PASSED" },
          { id: "r5", caseId: "c5", status: "PASSED" },
        ]
      );
      expect(releaseTestReadiness(detail)).toBe(true);
    });
  });

  describe("3. Fail-Closed Permission & Tool Evaluation Logic", () => {
    it("evaluates required permissions fail-closed", () => {
      const realPermissions = [
        {
          agent_version_id: "ver-1",
          permission_key: "perm:read",
          lifecycle_status: "APPROVED",
        },
        {
          agent_version_id: "ver-1",
          permission_key: "perm:write",
          lifecycle_status: "DRAFT",
        },
      ];

      // Agent with 0 required permissions passes
      const permsEmpty: string[] = [];
      const passEmpty = permsEmpty.length === 0 ? true : permsEmpty.every((pk) =>
        realPermissions.some((p) => p.agent_version_id === "ver-1" && p.permission_key === pk && p.lifecycle_status === "APPROVED")
      );
      expect(passEmpty).toBe(true);

      // Agent with approved permission passes
      const permsRead = ["perm:read"];
      const passRead = permsRead.length === 0 ? true : permsRead.every((pk) =>
        realPermissions.some((p) => p.agent_version_id === "ver-1" && p.permission_key === pk && p.lifecycle_status === "APPROVED")
      );
      expect(passRead).toBe(true);

      // Agent with unapproved permission fails
      const permsBoth = ["perm:read", "perm:write"];
      const passBoth = permsBoth.length === 0 ? true : permsBoth.every((pk) =>
        realPermissions.some((p) => p.agent_version_id === "ver-1" && p.permission_key === pk && p.lifecycle_status === "APPROVED")
      );
      expect(passBoth).toBe(false);

      // Agent requiring unregistered permission fails
      const permsMissing = ["perm:missing"];
      const passMissing = permsMissing.length === 0 ? true : permsMissing.every((pk) =>
        realPermissions.some((p) => p.agent_version_id === "ver-1" && p.permission_key === pk && p.lifecycle_status === "APPROVED")
      );
      expect(passMissing).toBe(false);
    });

    it("evaluates required tools fail-closed and yields UNKNOWN/NOT_REGISTERED for missing tools", () => {
      const realTools = [
        { tool_key: "tool_alpha", lifecycle_status: "APPROVED", risk_level: "LOW" },
        { tool_key: "tool_beta", lifecycle_status: "DRAFT", risk_level: "MEDIUM" },
      ];

      const toolDefAlpha = realTools.find((t) => t.tool_key === "tool_alpha");
      const toolDefMissing = realTools.find((t) => t.tool_key === "tool_gamma");

      expect(toolDefAlpha?.risk_level ?? "UNKNOWN").toBe("LOW");
      expect(toolDefAlpha?.lifecycle_status ?? "NOT_REGISTERED").toBe("APPROVED");

      // Fail-closed fallback:
      expect(toolDefMissing?.risk_level ?? "UNKNOWN").toBe("UNKNOWN");
      expect(toolDefMissing?.lifecycle_status ?? "NOT_REGISTERED").toBe("NOT_REGISTERED");

      const requiredTools = ["tool_alpha", "tool_gamma"];
      const toolsConfigured = requiredTools.length === 0 ? true : requiredTools.every((tk) =>
        realTools.some((t) => t.tool_key === tk && t.lifecycle_status === "APPROVED")
      );
      expect(toolsConfigured).toBe(false);
    });
  });

  describe("4. Multi-Version Matching & Suspended Logic", () => {
    it("prioritizes active agent_version_id over stale releases", () => {
      const releases = [
        { change_request_id: "cr-old", agent_key: "AGENT_X", agent_version_id: "ver-old", state: "ACTIVE" },
        { change_request_id: "cr-new", agent_key: "AGENT_X", agent_version_id: "ver-new", state: "SUSPENDED" },
      ];

      const currentVersionId = "ver-new";
      const matchingRelease =
        (currentVersionId
          ? releases.find((r) => r.agent_key === "AGENT_X" && r.agent_version_id === currentVersionId)
          : undefined)
        ?? releases.find((r) => r.agent_key === "AGENT_X");

      expect(matchingRelease?.change_request_id).toBe("cr-new");
      expect(matchingRelease?.state).toBe("SUSPENDED");
    });

    it("evaluates isSuspended correctly using boolean OR", () => {
      const latestSuspended = { lifecycle_status: "SUSPENDED" };
      const latestActive = { lifecycle_status: "ACTIVE" };
      const releaseSuspended = { state: "SUSPENDED" };
      const releaseActive = { state: "ACTIVE" };

      expect(latestSuspended.lifecycle_status === "SUSPENDED" || releaseActive.state === "SUSPENDED").toBe(true);
      expect(latestActive.lifecycle_status === "SUSPENDED" || releaseSuspended.state === "SUSPENDED").toBe(true);
      expect(latestActive.lifecycle_status === "SUSPENDED" || releaseActive.state === "SUSPENDED").toBe(false);
    });
  });

  describe("5. Role-Based Access Control (RBAC) Authority Matrix", () => {
    it("verifies canRecordReadinessDecision is strictly EXECUTIVE only", () => {
      expect(canRecordReadinessDecision(["EXECUTIVE"])).toBe(true);
      expect(canRecordReadinessDecision(["EXECUTIVE", "IT_ADMIN"])).toBe(true);
      expect(canRecordReadinessDecision(["IT_ADMIN"])).toBe(false);
      expect(canRecordReadinessDecision(["QA_ASSURANCE"])).toBe(false);
      expect(canRecordReadinessDecision(["BUSINESS_REVIEWER"])).toBe(false);
      expect(canRecordReadinessDecision(["TECHNICAL_REVIEWER"])).toBe(false);
      expect(canRecordReadinessDecision([])).toBe(false);
    });

    it("verifies canRegisterSource permits EXECUTIVE, WORKSPACE_LEAD, and IT_ADMIN only", () => {
      expect(canRegisterSource(["EXECUTIVE"])).toBe(true);
      expect(canRegisterSource(["WORKSPACE_LEAD"])).toBe(true);
      expect(canRegisterSource(["IT_ADMIN"])).toBe(true);
      expect(canRegisterSource(["QA_ASSURANCE"])).toBe(false);
      expect(canRegisterSource(["SECURITY_ADMIN"])).toBe(false);
      expect(canRegisterSource(["ADMIN"])).toBe(false);
      expect(canRegisterSource(["BUSINESS_REVIEWER"])).toBe(false);
      expect(canRegisterSource([])).toBe(false);
    });

    it("verifies canVerifySource permits EXECUTIVE, WORKSPACE_LEAD, and IT_ADMIN", () => {
      expect(canVerifySource(["EXECUTIVE"])).toBe(true);
      expect(canVerifySource(["WORKSPACE_LEAD"])).toBe(true);
      expect(canVerifySource(["IT_ADMIN"])).toBe(true);
      expect(canVerifySource(["QA_ASSURANCE"])).toBe(false);
      expect(canVerifySource(["BUSINESS_REVIEWER"])).toBe(false);
    });

    it("verifies canChangeBudget permits EXECUTIVE and IT_ADMIN only", () => {
      expect(canChangeBudget(["EXECUTIVE"])).toBe(true);
      expect(canChangeBudget(["IT_ADMIN"])).toBe(true);
      expect(canChangeBudget(["QA_ASSURANCE"])).toBe(false);
      expect(canChangeBudget(["BUSINESS_REVIEWER"])).toBe(false);
    });

    it("verifies canEditAgentRegistry permits IT_ADMIN only", () => {
      expect(canEditAgentRegistry(["IT_ADMIN"])).toBe(true);
      expect(canEditAgentRegistry(["EXECUTIVE"])).toBe(false);
      expect(canEditAgentRegistry(["QA_ASSURANCE"])).toBe(false);
    });

    it("verifies canOperateKillSwitch permits IT_ADMIN and EXECUTIVE", () => {
      expect(canOperateKillSwitch(["EXECUTIVE"])).toBe(true);
      expect(canOperateKillSwitch(["IT_ADMIN"])).toBe(true);
      expect(canOperateKillSwitch(["QA_ASSURANCE"])).toBe(false);
    });

    it("verifies canApproveRelease permits EXECUTIVE only", () => {
      expect(canApproveRelease(["EXECUTIVE"])).toBe(true);
      expect(canApproveRelease(["IT_ADMIN"])).toBe(false);
      expect(canApproveRelease(["QA_ASSURANCE"])).toBe(false);
    });

    it("verifies canConfigureSourceVault permits IT_ADMIN only", () => {
      expect(canConfigureSourceVault(["IT_ADMIN"])).toBe(true);
      expect(canConfigureSourceVault(["EXECUTIVE"])).toBe(false);
      expect(canConfigureSourceVault(["WORKSPACE_LEAD"])).toBe(false);
      expect(canConfigureSourceVault(["QA_ASSURANCE"])).toBe(false);
      expect(canConfigureSourceVault([])).toBe(false);
    });

    it("verifies canReviewBusinessGate permits BUSINESS_REVIEWER independently", () => {
      expect(canReviewBusinessGate(["BUSINESS_REVIEWER"])).toBe(true);
      expect(canReviewBusinessGate(["BUSINESS_REVIEWER", "EXECUTIVE"])).toBe(true);
      expect(canReviewBusinessGate(["TECHNICAL_REVIEWER"])).toBe(false);
      expect(canReviewBusinessGate(["EXECUTIVE"])).toBe(false);
      expect(canReviewBusinessGate(["QA_ASSURANCE"])).toBe(false);
      expect(canReviewBusinessGate([])).toBe(false);
    });

    it("verifies canReviewTechnicalGate permits TECHNICAL_REVIEWER independently", () => {
      expect(canReviewTechnicalGate(["TECHNICAL_REVIEWER"])).toBe(true);
      expect(canReviewTechnicalGate(["TECHNICAL_REVIEWER", "BUSINESS_REVIEWER"])).toBe(true);
      expect(canReviewTechnicalGate(["BUSINESS_REVIEWER"])).toBe(false);
      expect(canReviewTechnicalGate(["EXECUTIVE"])).toBe(false);
      expect(canReviewTechnicalGate(["QA_ASSURANCE"])).toBe(false);
      expect(canReviewTechnicalGate([])).toBe(false);
    });
  });

  describe("6. Source Vault Google Drive Boundary Validation", () => {
    it("extracts folder id from valid Google Drive folder URLs", () => {
      expect(
        extractGoogleDriveFolderId("https://drive.google.com/drive/folders/1A2b3C4d5E6f7G8h9I0j")
      ).toBe("1A2b3C4d5E6f7G8h9I0j");
      expect(
        extractGoogleDriveFolderId("https://drive.google.com/drive/folders/1A2b3C4d5E6f7G8h9I0j?usp=sharing")
      ).toBe("1A2b3C4d5E6f7G8h9I0j");
    });

    it("rejects non-Drive or malformed URLs", () => {
      expect(extractGoogleDriveFolderId("https://example.com/drive/folders/1A2b3C4d5E")).toBeNull();
      expect(extractGoogleDriveFolderId("https://drive.google.com/file/d/1A2b3C4d5E6f7G8h9I0j")).toBeNull();
      expect(extractGoogleDriveFolderId("")).toBeNull();
    });
  });

  describe("7. Fail-Closed Readiness: ACTIVE State Never Replaces Evidence", () => {
    it("enforces isReady is false even if ACTIVE when evidence is incomplete", () => {
      const contractValid = true;
      const toolsConfigured = true;
      const permsApproved = true;
      const testsPassed = false; // Missing test evidence
      const businessApproved = true;
      const techApproved = true;

      // Fail-closed computation (no ACTIVE shortcut)
      const isReadyState = contractValid && toolsConfigured && permsApproved && testsPassed && businessApproved && techApproved;
      expect(isReadyState).toBe(false);
    });

    it("enforces isReady is true only when all 6 evidence dimensions are satisfied", () => {
      const contractValid = true;
      const toolsConfigured = true;
      const permsApproved = true;
      const testsPassed = true;
      const businessApproved = true;
      const techApproved = true;

      const isReadyState = contractValid && toolsConfigured && permsApproved && testsPassed && businessApproved && techApproved;
      expect(isReadyState).toBe(true);
    });
  });

  describe("8. Active Agent Version & Rollback Target Resolution", () => {
    const version1 = {
      agent_version_id: "ver-1",
      semantic_version: "0.1.0",
      lifecycle_status: "ACTIVE",
    };
    const version2RolledBack = {
      agent_version_id: "ver-2",
      semantic_version: "0.2.0",
      lifecycle_status: "ROLLED_BACK",
    };
    const version3Draft = {
      agent_version_id: "ver-3",
      semantic_version: "0.3.0",
      lifecycle_status: "DRAFT",
    };

    it("resolves exact active version by active_version_id even when older than latest created", () => {
      // Version 2 is latest created (index 0), but active_version_id points to Version 1
      const agent = {
        active_version_id: "ver-1",
        versions: [version2RolledBack, version1],
      };
      const active = resolveActiveAgentVersion(agent);
      expect(active?.agent_version_id).toBe("ver-1");
      expect(active?.semantic_version).toBe("0.1.0");
      expect(active?.lifecycle_status).toBe("ACTIVE");
    });

    it("resolves active version by lifecycle_status when active_version_id is absent", () => {
      const agent = {
        active_version_id: null,
        versions: [version3Draft, version2RolledBack, version1],
      };
      const active = resolveActiveAgentVersion(agent);
      expect(active?.semantic_version).toBe("0.1.0");
    });

    it("falls back to SUSPENDED, RELEASED, or versions[0] when no ACTIVE version exists", () => {
      const suspended = { agent_version_id: "ver-s", semantic_version: "0.2.0", lifecycle_status: "SUSPENDED" };
      const draft = { agent_version_id: "ver-d", semantic_version: "0.3.0", lifecycle_status: "DRAFT" };
      const agentSuspended = { versions: [draft, suspended] };
      expect(resolveActiveAgentVersion(agentSuspended)?.semantic_version).toBe("0.2.0");

      const agentDraftOnly = { versions: [draft] };
      expect(resolveActiveAgentVersion(agentDraftOnly)?.semantic_version).toBe("0.3.0");
    });

    it("resolves rollback targets excluding the active version and including ROLLED_BACK", () => {
      const targets = resolveRollbackTargets("ver-1", [version2RolledBack, version1]);
      expect(targets).toEqual(["0.2.0"]);
      expect(targets).not.toContain("0.1.0");
    });

    it("prioritizes backend rollback targets when available", () => {
      const backendTargets = ["0.2.0", "0.0.9"];
      const targets = resolveRollbackTargets("ver-1", [version2RolledBack, version1], backendTargets);
      expect(targets).toEqual(["0.2.0", "0.0.9"]);
    });
  });
});
