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
  backendReleaseAdapter,
  type GovernedReleaseProjection,
} from "@/features/releases";
import { GenesisControlPlaneWorkspace } from "@/modules/it/genesis/control-plane";
import WorkspaceItGenesisPage from "@/app/workspace/it/genesis/page";

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
  // 1. TEST — STATE MAPPING
  // =========================================================================
  describe("1. State Mapping (All 17 Canonical Backend States)", () => {
    it("maps all 17 canonical states to non-empty Indonesian display labels", () => {
      expect(CANONICAL_RELEASE_STATES).toHaveLength(17);

      for (const state of CANONICAL_RELEASE_STATES) {
        const display = formatCanonicalReleaseState(state);
        expect(display).toBeTruthy();
        expect(display).toBe(CANONICAL_STATE_DISPLAY[state]);
        // Display must not be raw unmapped string
        expect(display).not.toBe("—");
      }
    });

    it("verifies exact Indonesian terminology for key canonical states", () => {
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

    it("maps Backend release states to correct lifecycle stages", () => {
      expect(getActiveLifecycleStage("DRAFT")).toBe("DRAFT");
      expect(getActiveLifecycleStage("REVISION_REQUIRED")).toBe("DRAFT");
      expect(getActiveLifecycleStage("IMPLEMENTED")).toBe("AUTOMATED_QA");
      expect(getActiveLifecycleStage("AUTOMATED_ASSURANCE")).toBe("AUTOMATED_QA");
      expect(getActiveLifecycleStage("AI_REVIEWED")).toBe("GENESIS_REVIEW");
      expect(getActiveLifecycleStage("READY_FOR_IT")).toBe("IT_DECISION");
      expect(getActiveLifecycleStage("HOLD")).toBe("IT_DECISION");
      expect(getActiveLifecycleStage("RELEASED")).toBe("RELEASE");
      expect(getActiveLifecycleStage("ACTIVE")).toBe("ACTIVE");
      expect(getActiveLifecycleStage("SUSPENDED")).toBe("ACTIVE");
      expect(getActiveLifecycleStage("ROLLED_BACK")).toBe("ACTIVE");
    });

    it("maps allowed actions accurately from Backend authority without local guessing", () => {
      const itActor = { roles: ["IT_ADMIN"], permissions: ["release.manage", "release.decide.it"] };
      const executiveActor = { roles: ["EXECUTIVE"], permissions: ["release.decide.director"] };
      const unprivilegedActor = { roles: ["WORKSPACE_MEMBER"] };

      const releaseReadyForIt: GovernedReleaseProjection = {
        release_id: "rel-1",
        review_id: "rev-1",
        subject_id: "agent-1",
        subject_version: "1.0.0",
        state: "READY_FOR_IT",
        correlation_id: "corr-1",
        kill_switch_active: false,
        rollback_target_release_id: null,
        ever_released: false,
      };

      expect(getAllowedReleaseActions(releaseReadyForIt, itActor)).toEqual(["it-decision"]);
      expect(getAllowedReleaseActions(releaseReadyForIt, executiveActor)).toEqual([]);
      expect(getAllowedReleaseActions(releaseReadyForIt, unprivilegedActor)).toEqual([]);

      const releaseActive: GovernedReleaseProjection = {
        ...releaseReadyForIt,
        state: "ACTIVE",
        ever_released: true,
      };

      expect(getAllowedReleaseActions(releaseActive, itActor)).toEqual(["suspend", "kill", "rollback"]);
      expect(getAllowedReleaseActions(releaseActive, executiveActor)).toEqual([]);

      const releaseSuspendedKill: GovernedReleaseProjection = {
        ...releaseActive,
        state: "SUSPENDED",
        kill_switch_active: true,
      };

      expect(getAllowedReleaseActions(releaseSuspendedKill, itActor)).toEqual(["clear-kill"]);
    });
  });

  // =========================================================================
  // 2. TEST — ACTION MAPPING (HTTP METHOD, PATH, BODY)
  // =========================================================================
  describe("2. Action Mapping to Canonical Backend Endpoints", () => {
    it("calls POST /api/v1/releases with exact canonical payload", async () => {
      const spy = vi.spyOn(api, "authenticatedApiRequest").mockResolvedValue({
        release_id: "rel_123",
        review_id: "rev_123",
        subject_id: "agent_recon",
        subject_version: "1.0.0",
        state: "DRAFT",
        correlation_id: "corr_123",
        kill_switch_active: false,
        rollback_target_release_id: null,
        ever_released: false,
      });

      const result = await backendReleaseAdapter.create({
        release_id: "rel_123",
        review_id: "rev_123",
        subject_id: "agent_recon",
        subject_version: "1.0.0",
        materiality: "NON_MATERIAL",
      });

      expect(spy).toHaveBeenCalledWith("/api/v1/releases", {
        method: "POST",
        body: {
          release_id: "rel_123",
          review_id: "rev_123",
          subject_id: "agent_recon",
          subject_version: "1.0.0",
          materiality: "NON_MATERIAL",
        },
      });
      expect(result.state).toBe("DRAFT");
    });

    it("calls GET /api/v1/releases/{release_id} with encoded path", async () => {
      const spy = vi.spyOn(api, "authenticatedApiRequest").mockResolvedValue({
        release_id: "rel/test#1",
        review_id: "rev_1",
        subject_id: "sub_1",
        subject_version: "1.0.0",
        state: "READY_FOR_IT",
        correlation_id: "corr_1",
        kill_switch_active: false,
        rollback_target_release_id: null,
        ever_released: false,
      });

      await backendReleaseAdapter.get("rel/test#1");
      expect(spy).toHaveBeenCalledWith("/api/v1/releases/rel%2Ftest%231");
    });

    it("calls POST /api/v1/releases/{release_id}/actions/{action} with correct payload for it-decision", async () => {
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
        decision_id: "dec_1",
        outcome: "APPROVED",
        rationale: "Memenuhi seluruh standar pengujian teknis",
        authority_level: "IT_APPROVER",
      });

      expect(spy).toHaveBeenCalledWith("/api/v1/releases/rel_1/actions/it-decision", {
        method: "POST",
        body: {
          decision_id: "dec_1",
          outcome: "APPROVED",
          rationale: "Memenuhi seluruh standar pengujian teknis",
          authority_level: "IT_APPROVER",
        },
      });
    });

    it("calls POST /api/v1/releases/{release_id}/actions/release without invented body", async () => {
      const spy = vi.spyOn(api, "authenticatedApiRequest").mockResolvedValue({
        release_id: "rel_1",
        review_id: "rev_1",
        subject_id: "agent_1",
        subject_version: "1.0.0",
        state: "RELEASED",
        correlation_id: "corr_1",
        kill_switch_active: false,
        rollback_target_release_id: null,
        ever_released: true,
      });

      await backendReleaseAdapter.executeAction("rel_1", "release");

      expect(spy).toHaveBeenCalledWith("/api/v1/releases/rel_1/actions/release", {
        method: "POST",
        body: {},
      });
    });
  });

  // =========================================================================
  // 3. TEST — MATERIALITY
  // =========================================================================
  describe("3. Materiality Behavior (NON_MATERIAL vs MATERIAL)", () => {
    it("non-material release does not require Director decision and progresses IT_APPROVED -> RELEASE", () => {
      const nonMaterialStage = getActiveLifecycleStage("IT_APPROVED", "NON_MATERIAL");
      expect(nonMaterialStage).toBe("RELEASE");

      const releaseNonMaterial: GovernedReleaseProjection = {
        release_id: "rel_nm",
        review_id: "rev_1",
        subject_id: "agent_nm",
        subject_version: "1.0.0",
        state: "IT_APPROVED",
        materiality: "NON_MATERIAL",
        correlation_id: "c1",
        kill_switch_active: false,
        rollback_target_release_id: null,
        ever_released: false,
      };

      const itActor = { roles: ["IT_ADMIN"], permissions: ["release.manage"] };
      const actions = getAllowedReleaseActions(releaseNonMaterial, itActor);
      expect(actions).toContain("release");
      expect(actions).not.toContain("director-decision");
    });

    it("material release requires Director decision before release", () => {
      const materialStage = getActiveLifecycleStage("IT_APPROVED", "MATERIAL");
      expect(materialStage).toBe("DIRECTOR_DECISION");

      const releaseMaterial: GovernedReleaseProjection = {
        release_id: "rel_m",
        review_id: "rev_2",
        subject_id: "agent_m",
        subject_version: "1.0.0",
        state: "IT_APPROVED",
        materiality: "MATERIAL",
        correlation_id: "c2",
        kill_switch_active: false,
        rollback_target_release_id: null,
        ever_released: false,
      };

      const itActor = { roles: ["IT_ADMIN"], permissions: ["release.manage"] };
      // IT cannot release a MATERIAL release in IT_APPROVED state until Director approves!
      expect(getAllowedReleaseActions(releaseMaterial, itActor)).toEqual([]);

      const releaseReadyDirector: GovernedReleaseProjection = {
        ...releaseMaterial,
        state: "READY_FOR_DIRECTOR",
      };

      const execActor = { roles: ["EXECUTIVE"], permissions: ["release.decide.director"] };
      expect(getAllowedReleaseActions(releaseReadyDirector, execActor)).toEqual(["director-decision"]);

      const releaseDirectorApproved: GovernedReleaseProjection = {
        ...releaseMaterial,
        state: "DIRECTOR_APPROVED",
      };
      // Once DIRECTOR_APPROVED, IT_ADMIN can execute release
      expect(getAllowedReleaseActions(releaseDirectorApproved, itActor)).toEqual(["release"]);
    });
  });

  // =========================================================================
  // 4. TEST — AUTHORITY & FAIL-CLOSED
  // =========================================================================
  describe("4. Authority Boundary & Fail-Closed Checks", () => {
    it("fails closed when actor lacks required roles / permissions for release actions", () => {
      const release: GovernedReleaseProjection = {
        release_id: "rel_auth",
        review_id: "rev_auth",
        subject_id: "agent_auth",
        subject_version: "1.0.0",
        state: "READY_FOR_IT",
        correlation_id: "c_auth",
        kill_switch_active: false,
        rollback_target_release_id: null,
        ever_released: false,
      };

      // General user or sales role cannot take IT decision
      const randomUser = { roles: ["SALES_OFFICER"], permissions: ["sales.manage"] };
      expect(getAllowedReleaseActions(release, randomUser)).toEqual([]);

      // Guest / unauthenticated actor
      expect(getAllowedReleaseActions(release, { roles: [] })).toEqual([]);
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
  });

  // =========================================================================
  // 5. TEST — ARCHITECTURE GUARD: NO DIRECT GENESIS CALLS
  // =========================================================================
  describe("5. Architecture Guard: Zero Direct genesis-ai / Model Provider / MCP Calls", () => {
    it("scans all alos-web source files ensuring no direct genesis-ai service or model endpoints are called", () => {
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
  });

  // =========================================================================
  // 6. TEST — LEGACY PURGE GUARD
  // =========================================================================
  describe("6. Legacy Purge Guard", () => {
    it("ensures known obsolete endpoints are not referenced in the canonical lifecycle", () => {
      const srcDir = path.resolve(__dirname, "../src/features/releases");
      const files = fs.readdirSync(srcDir);
      for (const file of files) {
        const fullPath = path.join(srcDir, file);
        const content = fs.readFileSync(fullPath, "utf-8");
        expect(content).not.toContain("/api/v1/release-requests");
        expect(content).not.toContain("/api/v1/genesis/agent-requests");
      }
    });

    it("verifies module-readiness reflects honest blocked status on technical modules", async () => {
      const { getModuleReadiness } = await import("@/features/workspace-routing");
      expect(getModuleReadiness("skills")).toEqual({
        availability: "BLOCKED",
        blockReason: "MODULE_NOT_IMPLEMENTED",
      });
      expect(getModuleReadiness("models-tools")).toEqual({
        availability: "BLOCKED",
        blockReason: "MODULE_NOT_IMPLEMENTED",
      });
    });
  });

  // =========================================================================
  // 7. TEST — LANGUAGE & DATA HONESTY
  // =========================================================================
  describe("7. Language & Data Honesty", () => {
    it("renders honest fallback for null or missing values", () => {
      expect(formatCanonicalReleaseState(null)).toBe("—");
      expect(formatCanonicalReleaseState(undefined)).toBe("—");
      expect(formatCanonicalReleaseState("")).toBe("—");
    });

    it("renders GenesisControlPlaneWorkspace with honest initial state", async () => {
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

      expect(screen.getByRole("heading", { name: "Pusat Kendali GENESIS", level: 1 })).toBeInTheDocument();
      expect(screen.getByText("Belum Ada Rilis yang Diinspeksi")).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: "Registri Teknis", level: 2 })).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: "Referensi Tata Kelola", level: 2 })).toBeInTheDocument();
    });

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
