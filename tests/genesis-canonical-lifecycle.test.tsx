import { cleanup, render, screen, waitFor, fireEvent } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as fs from "fs";
import * as path from "path";

import * as api from "@/lib/api";
import { canonicalPrincipal } from "./helpers/canonical-session";
import {
  CANONICAL_RELEASE_STATES,
  CANONICAL_STATE_DISPLAY,
  formatCanonicalReleaseState,
  getActiveLifecycleStage,
  getAllowedReleaseActions,
  projectLifecycleStages,
  backendReleaseAdapter,
  type GovernedReleaseProjection,
} from "@/features/releases";
import { GenesisControlPlaneWorkspace } from "@/modules/it/genesis/control-plane";
import WorkspaceItGenesisPage from "@/app/workspace/it/genesis/page";
import { getModuleReadiness } from "@/features/workspace-routing";

const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
};

vi.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
  usePathname: () => "/workspace/it/genesis",
  redirect: vi.fn(),
  notFound: vi.fn(),
}));

describe("GENESIS Canonical Lifecycle & Governance Alignment", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  // =========================================================================
  // 1. TEST — STATE MAPPING & EXPLICIT LIFECYCLE PROJECTION
  // =========================================================================
  describe("1. State Mapping & Explicit Lifecycle Projection (All 17 States)", () => {
    it("maps all 17 canonical states to non-empty Indonesian display labels", () => {
      expect(CANONICAL_RELEASE_STATES).toHaveLength(17);

      for (const state of CANONICAL_RELEASE_STATES) {
        const display = formatCanonicalReleaseState(state);
        expect(display).toBeTruthy();
        expect(display).toBe(CANONICAL_STATE_DISPLAY[state]);
        expect(display).not.toBe("—");
      }
    });

    it("verifies exact Indonesian terminology for all canonical states", () => {
      expect(formatCanonicalReleaseState("DRAFT")).toBe("Draf");
      expect(formatCanonicalReleaseState("IMPLEMENTED")).toBe("Terimplementasi");
      expect(formatCanonicalReleaseState("AUTOMATED_ASSURANCE")).toBe("QA Otomatis");
      expect(formatCanonicalReleaseState("AI_REVIEWED")).toBe("Ditinjau AI");
      expect(formatCanonicalReleaseState("READY_FOR_IT")).toBe("Menunggu Keputusan IT");
      expect(formatCanonicalReleaseState("IT_APPROVED")).toBe("Disetujui IT");
      expect(formatCanonicalReleaseState("READY_FOR_DIRECTOR")).toBe("Menunggu Persetujuan Direktur");
      expect(formatCanonicalReleaseState("DIRECTOR_APPROVED")).toBe("Disetujui Direktur");
      expect(formatCanonicalReleaseState("RELEASED")).toBe("Dirilis");
      expect(formatCanonicalReleaseState("ACTIVE")).toBe("Aktif");
      expect(formatCanonicalReleaseState("REVISION_REQUIRED")).toBe("Perlu Revisi");
      expect(formatCanonicalReleaseState("RETURNED")).toBe("Dikembalikan");
      expect(formatCanonicalReleaseState("REJECTED")).toBe("Ditolak");
      expect(formatCanonicalReleaseState("HOLD")).toBe("Ditahan");
      expect(formatCanonicalReleaseState("BLOCKED")).toBe("Terblokir");
      expect(formatCanonicalReleaseState("SUSPENDED")).toBe("Ditangguhkan");
      expect(formatCanonicalReleaseState("ROLLED_BACK")).toBe("Di-rollback");
    });

    it("projects active stage keys without assuming non-material when materiality is omitted", () => {
      expect(getActiveLifecycleStage("DRAFT")).toBe("DRAFT");
      expect(getActiveLifecycleStage("IMPLEMENTED")).toBe("AUTOMATED_QA");
      expect(getActiveLifecycleStage("AUTOMATED_ASSURANCE")).toBe("GENESIS_REVIEW");
      expect(getActiveLifecycleStage("AI_REVIEWED")).toBeNull();
      expect(getActiveLifecycleStage("READY_FOR_IT")).toBe("IT_DECISION");
      // IT_APPROVED with unknown materiality must return null (unknown next stage, fail closed!)
      expect(getActiveLifecycleStage("IT_APPROVED")).toBeNull();
      expect(getActiveLifecycleStage("IT_APPROVED", null)).toBeNull();
      expect(getActiveLifecycleStage("IT_APPROVED", "NON_MATERIAL")).toBe("RELEASE");
      expect(getActiveLifecycleStage("IT_APPROVED", "MATERIAL")).toBe("DIRECTOR_DECISION");
      expect(getActiveLifecycleStage("READY_FOR_DIRECTOR")).toBe("DIRECTOR_DECISION");
      expect(getActiveLifecycleStage("DIRECTOR_APPROVED")).toBe("RELEASE");
      expect(getActiveLifecycleStage("RELEASED")).toBe("RELEASE");
      expect(getActiveLifecycleStage("ACTIVE")).toBe("ACTIVE");
      expect(getActiveLifecycleStage("SUSPENDED")).toBe("ACTIVE");
      expect(getActiveLifecycleStage("ROLLED_BACK")).toBe("ACTIVE");
      // Branching / terminal states do not assume IT decision
      expect(getActiveLifecycleStage("RETURNED")).toBeNull();
      expect(getActiveLifecycleStage("REJECTED")).toBeNull();
      expect(getActiveLifecycleStage("HOLD")).toBeNull();
    });

    it("projects truthful stage statuses for terminal and deviation states without index completion assumption", () => {
      // REJECTED: must not assert IT or Director authority when not provided by Backend
      const rejectedProj = projectLifecycleStages("REJECTED");
      expect(rejectedProj.isTerminalOrDeviation).toBe(true);
      expect(rejectedProj.stageStatuses.IT_DECISION).not.toBe("REJECTED");
      expect(rejectedProj.stageStatuses.DIRECTOR_DECISION).not.toBe("REJECTED");
      expect(rejectedProj.stageStatuses.IT_DECISION).toBe("UNKNOWN");
      expect(rejectedProj.stageStatuses.DIRECTOR_DECISION).toBe("UNKNOWN");
      expect(rejectedProj.stageStatuses.RELEASE).toBe("PENDING");
      expect(rejectedProj.stageStatuses.ACTIVE).toBe("PENDING");
      expect(rejectedProj.activeStageLabel).toBe("Ditolak");
      expect(rejectedProj.deviationNotice).toContain("tidak tersedia pada projection rilis Backend");

      // RETURNED: must not assume IT returned
      const returnedProj = projectLifecycleStages("RETURNED");
      expect(returnedProj.isTerminalOrDeviation).toBe(true);
      expect(returnedProj.stageStatuses.IT_DECISION).toBe("UNKNOWN");
      expect(returnedProj.stageStatuses.DIRECTOR_DECISION).toBe("UNKNOWN");
      expect(returnedProj.stageStatuses.DRAFT).toBe("DEVIATION");
      expect(returnedProj.activeStageLabel).toBe("Dikembalikan");
      expect(returnedProj.deviationNotice).toContain("tidak tersedia pada projection rilis Backend");

      // HOLD: must not assume IT hold
      const holdProj = projectLifecycleStages("HOLD");
      expect(holdProj.isTerminalOrDeviation).toBe(true);
      expect(holdProj.stageStatuses.IT_DECISION).not.toBe("ON_HOLD");
      expect(holdProj.stageStatuses.DIRECTOR_DECISION).not.toBe("ON_HOLD");
      expect(holdProj.stageStatuses.IT_DECISION).toBe("UNKNOWN");
      expect(holdProj.stageStatuses.DIRECTOR_DECISION).toBe("UNKNOWN");
      expect(holdProj.activeStageLabel).toBe("Ditahan");
      expect(holdProj.deviationNotice).toContain("tidak tersedia pada projection rilis Backend");

      // BLOCKED
      const blockedProj = projectLifecycleStages("BLOCKED");
      expect(blockedProj.isTerminalOrDeviation).toBe(true);
      expect(blockedProj.stageStatuses.DRAFT).toBe("BLOCKED");
      expect(blockedProj.stageStatuses.ACTIVE).toBe("PENDING");
      expect(blockedProj.activeStageLabel).toContain("Terblokir");

      // SUSPENDED with kill switch active
      const suspendedKill = projectLifecycleStages("SUSPENDED", "NON_MATERIAL", true);
      expect(suspendedKill.isTerminalOrDeviation).toBe(true);
      expect(suspendedKill.stageStatuses.ACTIVE).toBe("SUSPENDED");
      expect(suspendedKill.activeStageLabel).toBe("Ditangguhkan (Kill Switch Aktif)");

      // SUSPENDED without kill switch
      const suspendedNormal = projectLifecycleStages("SUSPENDED", "NON_MATERIAL", false);
      expect(suspendedNormal.activeStageLabel).toBe("Ditangguhkan");

      // ROLLED_BACK
      const rolledBackProj = projectLifecycleStages("ROLLED_BACK");
      expect(rolledBackProj.isTerminalOrDeviation).toBe(true);
      expect(rolledBackProj.stageStatuses.ACTIVE).toBe("ROLLED_BACK");
      expect(rolledBackProj.activeStageLabel).toContain("Di-rollback");
    });

    it("projects AUTOMATED_ASSURANCE and AI_REVIEWED semantics accurately", () => {
      // AUTOMATED_ASSURANCE: QA Otomatis completed, Review GENESIS is current
      const autoAssurance = projectLifecycleStages("AUTOMATED_ASSURANCE");
      expect(autoAssurance.stageStatuses.AUTOMATED_QA).toBe("COMPLETED");
      expect(autoAssurance.stageStatuses.GENESIS_REVIEW).toBe("CURRENT");
      expect(autoAssurance.activeStageKey).toBe("GENESIS_REVIEW");
      expect(autoAssurance.activeStageLabel).toBe("QA Otomatis Selesai (Menunggu Review GENESIS)");
      expect(autoAssurance.activeStageLabel).not.toContain("Berjalan");

      // AI_REVIEWED: Review GENESIS completed, IT Decision is pending (not current)
      const aiReviewed = projectLifecycleStages("AI_REVIEWED");
      expect(aiReviewed.stageStatuses.GENESIS_REVIEW).toBe("COMPLETED");
      expect(aiReviewed.stageStatuses.IT_DECISION).toBe("PENDING");
      expect(aiReviewed.activeStageKey).toBeNull();
      expect(aiReviewed.activeStageLabel).toBe("Ditinjau AI (Menunggu Penyerahan ke IT)");
    });

    it("projects REQUIREMENT and FACTORY as UNKNOWN on release inspection without lineage", () => {
      // Independently inspected release without authoritative lineage evidence
      const noLineage = projectLifecycleStages("READY_FOR_IT");
      expect(noLineage.stageStatuses.REQUIREMENT).toBe("UNKNOWN");
      expect(noLineage.stageStatuses.FACTORY).toBe("UNKNOWN");

      // When authoritative lineage is confirmed
      const withLineage = projectLifecycleStages("READY_FOR_IT", null, false, true);
      expect(withLineage.stageStatuses.REQUIREMENT).toBe("COMPLETED");
      expect(withLineage.stageStatuses.FACTORY).toBe("COMPLETED");
    });
  });

  // =========================================================================
  // 2. TEST — AUTHORITY SEMANTICS: ROLE AND PERMISSION (NOT OR)
  // =========================================================================
  describe("2. Authority Semantics (role AND permission mandatory)", () => {
    const releaseReadyIt: GovernedReleaseProjection = {
      release_id: "rel_1",
      review_id: "rev_1",
      subject_id: "agent_1",
      subject_version: "1.0.0",
      state: "READY_FOR_IT",
      correlation_id: "corr_1",
      kill_switch_active: false,
      rollback_target_release_id: null,
      ever_released: false,
    };

    it("requires BOTH IT_ADMIN role AND release.decide.it permission for it-decision", () => {
      // Role only -> NO ACTION
      expect(getAllowedReleaseActions(releaseReadyIt, { roles: ["IT_ADMIN"], permissions: [] })).toEqual([]);
      // Permission only -> NO ACTION
      expect(getAllowedReleaseActions(releaseReadyIt, { roles: [], permissions: ["release.decide.it"] })).toEqual([]);
      // Wrong role with permission -> NO ACTION
      expect(getAllowedReleaseActions(releaseReadyIt, { roles: ["EXECUTIVE"], permissions: ["release.decide.it"] })).toEqual([]);
      // Both -> ALLOWED
      expect(
        getAllowedReleaseActions(releaseReadyIt, { roles: ["IT_ADMIN"], permissions: ["release.decide.it"] }),
      ).toEqual(["it-decision"]);
    });

    it("requires BOTH EXECUTIVE role AND release.decide.director permission for director-decision", () => {
      const releaseReadyDir: GovernedReleaseProjection = {
        ...releaseReadyIt,
        state: "READY_FOR_DIRECTOR",
      };

      // Role only -> NO ACTION
      expect(getAllowedReleaseActions(releaseReadyDir, { roles: ["EXECUTIVE"], permissions: [] })).toEqual([]);
      // Permission only -> NO ACTION
      expect(getAllowedReleaseActions(releaseReadyDir, { roles: [], permissions: ["release.decide.director"] })).toEqual([]);
      // IT role with director permission -> NO ACTION
      expect(getAllowedReleaseActions(releaseReadyDir, { roles: ["IT_ADMIN"], permissions: ["release.decide.director"] })).toEqual([]);
      // Both -> ALLOWED
      expect(
        getAllowedReleaseActions(releaseReadyDir, { roles: ["EXECUTIVE"], permissions: ["release.decide.director"] }),
      ).toEqual(["director-decision"]);
    });

    it("requires BOTH IT_ADMIN role AND release.manage permission for release management actions", () => {
      const releaseActive: GovernedReleaseProjection = {
        ...releaseReadyIt,
        state: "ACTIVE",
        ever_released: true,
      };

      // Role only -> NO ACTION
      expect(getAllowedReleaseActions(releaseActive, { roles: ["IT_ADMIN"], permissions: [] })).toEqual([]);
      // Permission only -> NO ACTION
      expect(getAllowedReleaseActions(releaseActive, { roles: [], permissions: ["release.manage"] })).toEqual([]);
      // Both -> ALLOWED
      expect(
        getAllowedReleaseActions(releaseActive, { roles: ["IT_ADMIN"], permissions: ["release.manage"] }),
      ).toEqual(["suspend", "kill", "rollback"]);
    });

    it("handles SUSPENDED actions fail-closed based strictly on kill switch and authority", () => {
      const releaseSuspendedNormal: GovernedReleaseProjection = {
        ...releaseReadyIt,
        state: "SUSPENDED",
        ever_released: true,
        kill_switch_active: false,
      };

      const releaseSuspendedKill: GovernedReleaseProjection = {
        ...releaseSuspendedNormal,
        kill_switch_active: true,
      };

      const itActor = { roles: ["IT_ADMIN"], permissions: ["release.manage"] };
      const actorRoleOnly = { roles: ["IT_ADMIN"], permissions: [] };
      const actorPermOnly = { roles: [], permissions: ["release.manage"] };

      // SUSPENDED + kill_switch=false -> NO ACTION (never offer activate, no invented resume)
      expect(getAllowedReleaseActions(releaseSuspendedNormal, itActor)).toEqual([]);

      // SUSPENDED + kill_switch=true -> ["clear-kill"] ONLY with IT_ADMIN AND release.manage
      expect(getAllowedReleaseActions(releaseSuspendedKill, itActor)).toEqual(["clear-kill"]);
      expect(getAllowedReleaseActions(releaseSuspendedKill, actorRoleOnly)).toEqual([]);
      expect(getAllowedReleaseActions(releaseSuspendedKill, actorPermOnly)).toEqual([]);
    });
  });

  // =========================================================================
  // 3. TEST — MATERIALITY FAIL-CLOSED & UNKNOWN MATERIALITY BEHAVIOR
  // =========================================================================
  describe("3. Materiality Fail-Closed Behavior", () => {
    it("fails closed on IT_APPROVED when materiality is unknown / undefined", () => {
      const releaseItApprovedUnknownMateriality: GovernedReleaseProjection = {
        release_id: "rel_unknown",
        review_id: "rev_1",
        subject_id: "agent_1",
        subject_version: "1.0.0",
        state: "IT_APPROVED",
        correlation_id: "corr_1",
        kill_switch_active: false,
        rollback_target_release_id: null,
        ever_released: false,
        // materiality is undefined/missing from Backend
      };

      const itActor = { roles: ["IT_ADMIN"], permissions: ["release.manage", "release.decide.it"] };

      // MANDATORY FAIL-CLOSED: No release action allowed when materiality is unknown!
      expect(getAllowedReleaseActions(releaseItApprovedUnknownMateriality, itActor)).toEqual([]);
    });

    it("allows release action on IT_APPROVED ONLY when materiality is authoritatively NON_MATERIAL", () => {
      const releaseNonMaterial: GovernedReleaseProjection = {
        release_id: "rel_nm",
        review_id: "rev_1",
        subject_id: "agent_1",
        subject_version: "1.0.0",
        state: "IT_APPROVED",
        materiality: "NON_MATERIAL",
        correlation_id: "corr_1",
        kill_switch_active: false,
        rollback_target_release_id: null,
        ever_released: false,
      };

      const itActor = { roles: ["IT_ADMIN"], permissions: ["release.manage"] };
      expect(getAllowedReleaseActions(releaseNonMaterial, itActor)).toEqual(["release"]);
    });

    it("does NOT allow release action on IT_APPROVED when materiality is MATERIAL", () => {
      const releaseMaterial: GovernedReleaseProjection = {
        release_id: "rel_mat",
        review_id: "rev_1",
        subject_id: "agent_1",
        subject_version: "1.0.0",
        state: "IT_APPROVED",
        materiality: "MATERIAL",
        correlation_id: "corr_1",
        kill_switch_active: false,
        rollback_target_release_id: null,
        ever_released: false,
      };

      const itActor = { roles: ["IT_ADMIN"], permissions: ["release.manage"] };
      expect(getAllowedReleaseActions(releaseMaterial, itActor)).toEqual([]);
    });

    it("allows release on DIRECTOR_APPROVED for IT_ADMIN with release.manage", () => {
      const releaseDirectorApproved: GovernedReleaseProjection = {
        release_id: "rel_dir_app",
        review_id: "rev_1",
        subject_id: "agent_1",
        subject_version: "1.0.0",
        state: "DIRECTOR_APPROVED",
        materiality: "MATERIAL",
        correlation_id: "corr_1",
        kill_switch_active: false,
        rollback_target_release_id: null,
        ever_released: false,
      };

      const itActor = { roles: ["IT_ADMIN"], permissions: ["release.manage"] };
      expect(getAllowedReleaseActions(releaseDirectorApproved, itActor)).toEqual(["release"]);
    });
  });

  // =========================================================================
  // 4. TEST — ACTION PAYLOAD (NO INVENTED / CONFLICTING FIELDS)
  // =========================================================================
  describe("4. Action Payload Invariants (No authority_level, No DIRECTOR_APPROVER)", () => {
    it("calls POST it-decision with decision_id, outcome, rationale and NO authority_level", async () => {
      const spy = vi.spyOn(api, "authenticatedApiRequest").mockResolvedValue({
        release_id: "rel_1",
        review_id: "rev_1",
        subject_id: "agent_1",
        subject_version: "1.0.0",
        state: "IT_APPROVED",
        correlation_id: "corr_1",
        kill_switch_active: false,
        rollback_target_release_id: null,
        ever_released: false,
      });

      await backendReleaseAdapter.executeAction("rel_1", "it-decision", {
        decision_id: "dec_test_123",
        outcome: "APPROVED",
        rationale: "Hasil pengujian otomatis dan arsitektur valid.",
      });

      expect(spy).toHaveBeenCalledWith("/api/v1/releases/rel_1/actions/it-decision", {
        method: "POST",
        body: {
          decision_id: "dec_test_123",
          outcome: "APPROVED",
          rationale: "Hasil pengujian otomatis dan arsitektur valid.",
        },
      });

      const sentBody = spy.mock.calls[0][1]?.body as Record<string, unknown>;
      expect(sentBody).not.toHaveProperty("authority_level");
      expect(sentBody).not.toHaveProperty("actor_id");
      expect(sentBody).not.toHaveProperty("tenant_id");
      expect(sentBody).not.toHaveProperty("workspace_id");
    });

    it("calls POST director-decision without DIRECTOR_APPROVER or authority_level", async () => {
      const spy = vi.spyOn(api, "authenticatedApiRequest").mockResolvedValue({
        release_id: "rel_1",
        review_id: "rev_1",
        subject_id: "agent_1",
        subject_version: "1.0.0",
        state: "DIRECTOR_APPROVED",
        correlation_id: "corr_1",
        kill_switch_active: false,
        rollback_target_release_id: null,
        ever_released: false,
      });

      await backendReleaseAdapter.executeAction("rel_1", "director-decision", {
        decision_id: "dec_dir_456",
        outcome: "APPROVED",
        rationale: "Persetujuan Direktur untuk operasional material.",
      });

      expect(spy).toHaveBeenCalledWith("/api/v1/releases/rel_1/actions/director-decision", {
        method: "POST",
        body: {
          decision_id: "dec_dir_456",
          outcome: "APPROVED",
          rationale: "Persetujuan Direktur untuk operasional material.",
        },
      });

      const sentBody = spy.mock.calls[0][1]?.body as Record<string, unknown>;
      expect(sentBody).not.toHaveProperty("authority_level");
      expect(JSON.stringify(sentBody)).not.toContain("DIRECTOR_APPROVER");
    });
  });

  // =========================================================================
  // 5. TEST — DATA HONESTY & NO EVIDENCE FABRICATION
  // =========================================================================
  describe("5. Data Honesty & Zero Evidence Fabrication", () => {
    it("renders actual Backend response shape and never synthesizes urn:alos:review-package", async () => {
      // Matches EXACT Backend _response() shape (materiality & evidence_uri are omitted)
      const canonicalBackendResponse = {
        release_id: "rel_live_99",
        review_id: "rev_audit_88",
        subject_id: "agent_recon",
        subject_version: "1.2.0",
        state: "READY_FOR_IT",
        correlation_id: "corr_xyz_77",
        kill_switch_active: false,
        rollback_target_release_id: null,
        ever_released: false,
      };

      vi.spyOn(api, "authenticatedApiRequest").mockResolvedValue(canonicalBackendResponse);

      render(
        <GenesisControlPlaneWorkspace
          actor={{
            user_id: "usr_it",
            organization_id: "org_1",
            tenant_id: "ten_1",
            workspace_ids: ["ws_it"],
            roles: ["IT_ADMIN"],
            permissions: ["release.manage", "release.decide.it"],
            division_codes: ["IT"],
            issued_at: "",
            expires_at: "",
          }}
        />,
      );

      const input = screen.getByLabelText(/ID Rilis/i);
      fireEvent.change(input, { target: { value: "rel_live_99" } });

      const inspectBtn = screen.getByRole("button", { name: /Inspeksi Rilis/i });
      fireEvent.click(inspectBtn);

      await waitFor(() => {
        expect(screen.getByText("rel_live_99")).toBeInTheDocument();
        expect(screen.getByText("rev_audit_88")).toBeInTheDocument();
      });

      // Assert review_id is rendered
      expect(screen.getByText("rev_audit_88")).toBeInTheDocument();

      // Invariant: review_id != evidence_uri. Fabricated URN must NEVER appear!
      expect(document.body.textContent).not.toContain("urn:alos:review-package:rev_audit_88");

      // Materialitas must show BELUM TERSEDIA with helper
      expect(screen.getByText("Materialitas rilis tidak disertakan pada projection Backend saat ini.")).toBeInTheDocument();
      expect(document.body.textContent).not.toContain("NON_MATERIAL (Cukup Otoritas IT)");

      // Bukti review must show BELUM TERSEDIA with helper
      expect(screen.getByText("Referensi bukti review tidak tersedia pada projection rilis Backend.")).toBeInTheDocument();
    });

    it("renders fail-closed notice on IT_APPROVED when materiality is not exposed", async () => {
      vi.spyOn(api, "authenticatedApiRequest").mockResolvedValue({
        release_id: "rel_it_app",
        review_id: "rev_1",
        subject_id: "agent_recon",
        subject_version: "1.0.0",
        state: "IT_APPROVED",
        correlation_id: "corr_1",
        kill_switch_active: false,
        rollback_target_release_id: null,
        ever_released: false,
        // materiality omitted!
      });

      render(
        <GenesisControlPlaneWorkspace
          actor={{
            user_id: "usr_it",
            organization_id: "org_1",
            tenant_id: "ten_1",
            workspace_ids: ["ws_it"],
            roles: ["IT_ADMIN"],
            permissions: ["release.manage"],
            division_codes: ["IT"],
            issued_at: "",
            expires_at: "",
          }}
        />,
      );

      const input = screen.getByLabelText(/ID Rilis/i);
      fireEvent.change(input, { target: { value: "rel_it_app" } });
      fireEvent.click(screen.getByRole("button", { name: /Inspeksi Rilis/i }));

      await waitFor(() => {
        expect(screen.getByText("Menunggu Informasi Otoritas")).toBeInTheDocument();
      });

      expect(
        screen.getByText(/Action lanjutan tidak dapat ditentukan secara aman karena materialitas rilis belum tersedia/i),
      ).toBeInTheDocument();

      // Release button must NOT be present
      expect(screen.queryByRole("button", { name: /Publikasikan Rilis/i })).not.toBeInTheDocument();
    });
  });

  // =========================================================================
  // 6. TEST — ARCHITECTURE & LEGACY GUARDS
  // =========================================================================
  describe("6. Architecture & Legacy Purge Guards", () => {
    it("scans alos-web ensuring zero direct calls to genesis-ai, model APIs, or MCP", () => {
      const srcDir = path.resolve(__dirname, "../src");
      const prohibitedPatterns = [
        /https?:\/\/.*genesis.*internal/i,
        /https?:\/\/localhost:(8001|8002|8080|9000)/,
        /api\.openai\.com/i,
        /api\.anthropic\.com/i,
        /generativelanguage\.googleapis\.com/i,
        /\/mcp\//i,
      ];

      function scanDir(dir: string): string[] {
        const violations: string[] = [];
        const files = fs.readdirSync(dir);
        for (const file of files) {
          const fullPath = path.join(dir, file);
          const stat = fs.statSync(fullPath);
          if (stat.isDirectory()) {
            violations.push(...scanDir(fullPath));
          } else if (/\.(ts|tsx)$/.test(file)) {
            const content = fs.readFileSync(fullPath, "utf-8");
            for (const pattern of prohibitedPatterns) {
              if (pattern.test(content)) {
                violations.push(`${fullPath} matches prohibited pattern: ${pattern.toString()}`);
              }
            }
          }
        }
        return violations;
      }

      const violations = scanDir(srcDir);
      expect(violations).toEqual([]);
    });

    it("ensures obsolete endpoints and authority strings are purged from canonical lifecycle", () => {
      const lifecycleFilePath = path.resolve(__dirname, "../src/features/releases/canonical-lifecycle.ts");
      const content = fs.readFileSync(lifecycleFilePath, "utf-8");

      expect(content).not.toContain("/api/v1/release-requests");
      expect(content).not.toContain("/api/v1/genesis/agent-requests");
      expect(content).not.toContain("DIRECTOR_APPROVER");
      expect(content).not.toContain("IT_APPROVER");
    });

    it("verifies ProtectedDomainWorkspace fails closed for non-IT roles", async () => {
      vi.spyOn(api, "sessionApiRequest").mockResolvedValue({
        authenticated: true,
        principal: canonicalPrincipal({
          actorId: "usr_finance",
          divisionCode: "FINANCE",
          workspaceId: "ws_fin",
          workspaceKey: "finance",
          workspaceName: "Finance Workspace",
          roles: ["WORKSPACE_MEMBER"],
        }),
      });

      render(<WorkspaceItGenesisPage />);

      await waitFor(() => {
        expect(screen.getByText("Bukan Otoritas IT / GENESIS")).toBeInTheDocument();
      });
      expect(screen.queryByRole("heading", { name: "Pusat Kendali GENESIS", level: 1 })).not.toBeInTheDocument();
    });

    it("verifies control-plane readiness is BLOCKED / CONTRACT_PENDING", () => {
      const readiness = getModuleReadiness("control-plane");
      expect(readiness).toEqual({
        availability: "BLOCKED",
        blockReason: "CONTRACT_PENDING",
      });
    });
  });

  // =========================================================================
  // 7. TEST — FACTORY SUBMISSION HONESTY
  // =========================================================================
  describe("7. Factory Requirement Submission Honesty", () => {
    it("handles Factory Requirement submission and displays backend decision honestly", async () => {
      vi.spyOn(api, "authenticatedApiRequest").mockResolvedValue({
        correlation_id: "corr_fac_1",
        decision: "CREATE",
        reason: "Belum ada kapabilitas rekonsiliasi yang sesuai katalog.",
        existing_capability_refs: [],
        capability_draft: {
          correlation_id: "corr_fac_1",
          capability_id: "cap_recon_01",
          version: "0.1.0",
          name: "Rekonsiliasi Bank",
          purpose: "Otomasi rekonsiliasi mutasi rekening bank harian.",
          owner: "usr_it",
          capability_type: "WORKFLOW",
          output_state: "DRAFT",
          lifecycle_state: "DRAFT",
          scope_refs: ["finance:recon"],
          tool_ids: [],
          permission_refs: [],
          prohibited_actions: ["Direct database mutation"],
          risk_level: "MEDIUM",
          evidence_requirements: [],
          test_requirements: [],
        },
        agent_draft: null,
        registry_result: {
          state: "DRAFT",
          registered_refs: [
            {
              subject_type: "CAPABILITY",
              identifier: "cap_recon_01",
              version: "0.1.0",
              state: "DRAFT",
            },
          ],
        },
      });

      render(
        <GenesisControlPlaneWorkspace
          actor={{
            user_id: "usr_it",
            organization_id: "org_1",
            tenant_id: "ten_1",
            workspace_ids: ["ws_it"],
            roles: ["IT_ADMIN"],
            division_codes: ["IT"],
            issued_at: "",
            expires_at: "",
          }}
        />,
      );

      const textarea = screen.getByLabelText(/Pernyataan Kebutuhan/i);
      fireEvent.change(textarea, {
        target: { value: "Otomasi rekonsiliasi pembayaran sewa properti terhadap mutasi rekening koran harian." },
      });

      const submitBtn = screen.getByRole("button", { name: /Analisis Kebutuhan via Factory/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText("Hasil Analisis Pabrikasi Backend")).toBeInTheDocument();
        expect(screen.getByText("CREATE (Buat Draf Baru)")).toBeInTheDocument();
        expect(screen.getByText("Belum ada kapabilitas rekonsiliasi yang sesuai katalog.")).toBeInTheDocument();
        expect(screen.getByText("cap_recon_01")).toBeInTheDocument();
      });
    });
  });
});
