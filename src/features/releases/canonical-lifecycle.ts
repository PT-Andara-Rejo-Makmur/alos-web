/**
 * Canonical Release Lifecycle Model & API Adapter for ALOS GENESIS.
 *
 * Source of truth:
 * - alos-contracts: schemas/release/release-state.schema.json
 * - alos-backend: alos.releases.service (ReleaseState, GovernedRelease)
 * - alos-backend: alos.api.public.release_routes
 */

import { authenticatedApiRequest } from "@/lib/api";

export const CANONICAL_RELEASE_STATES = [
  "DRAFT",
  "IMPLEMENTED",
  "AUTOMATED_ASSURANCE",
  "AI_REVIEWED",
  "READY_FOR_IT",
  "IT_APPROVED",
  "READY_FOR_DIRECTOR",
  "DIRECTOR_APPROVED",
  "RELEASED",
  "ACTIVE",
  "REVISION_REQUIRED",
  "RETURNED",
  "REJECTED",
  "HOLD",
  "BLOCKED",
  "SUSPENDED",
  "ROLLED_BACK",
] as const;

export type CanonicalReleaseState = (typeof CANONICAL_RELEASE_STATES)[number];

export type MaterialityLevel = "NON_MATERIAL" | "MATERIAL";

export type DecisionOutcome = "APPROVED" | "RETURNED" | "REJECTED" | "HOLD";

export type CanonicalReleaseAction =
  | "it-decision"
  | "director-decision"
  | "release"
  | "activate"
  | "suspend"
  | "kill"
  | "clear-kill"
  | "rollback";

export interface GovernedReleaseProjection {
  readonly release_id: string;
  readonly review_id: string;
  readonly subject_id: string;
  readonly subject_version: string;
  readonly state: CanonicalReleaseState;
  readonly correlation_id: string;
  readonly kill_switch_active: boolean;
  readonly rollback_target_release_id: string | null;
  readonly ever_released: boolean;
  readonly materiality?: MaterialityLevel | null;
}

export interface CreateReleasePayload {
  readonly release_id: string;
  readonly review_id: string;
  readonly subject_id: string;
  readonly subject_version: string;
  readonly materiality: MaterialityLevel;
}

export interface DecisionActionPayload {
  readonly decision_id: string;
  readonly outcome: DecisionOutcome;
  readonly rationale: string;
}

export interface ReasonActionPayload {
  readonly reason: string;
}

export interface RollbackActionPayload {
  readonly target_release_id: string;
  readonly reason: string;
}

export type ReleaseActionPayload =
  | DecisionActionPayload
  | ReasonActionPayload
  | RollbackActionPayload
  | Record<string, unknown>;

/**
 * Display labels in Bahasa Indonesia. Canonical enum keys remain unchanged.
 */
export const CANONICAL_STATE_DISPLAY: Record<CanonicalReleaseState, string> = {
  DRAFT: "Draf",
  IMPLEMENTED: "Terimplementasi",
  AUTOMATED_ASSURANCE: "QA Otomatis",
  AI_REVIEWED: "Ditinjau AI",
  READY_FOR_IT: "Menunggu Keputusan IT",
  IT_APPROVED: "Disetujui IT",
  READY_FOR_DIRECTOR: "Menunggu Persetujuan Direktur",
  DIRECTOR_APPROVED: "Disetujui Direktur",
  RELEASED: "Dirilis",
  ACTIVE: "Aktif",
  REVISION_REQUIRED: "Perlu Revisi",
  RETURNED: "Dikembalikan",
  REJECTED: "Ditolak",
  HOLD: "Ditahan",
  BLOCKED: "Terblokir",
  SUSPENDED: "Ditangguhkan",
  ROLLED_BACK: "Di-rollback",
};

export function formatCanonicalReleaseState(state: string | null | undefined): string {
  if (!state) return "—";
  return CANONICAL_STATE_DISPLAY[state as CanonicalReleaseState] ?? state;
}

export type LifecycleStageKey =
  | "REQUIREMENT"
  | "FACTORY"
  | "DRAFT"
  | "AUTOMATED_QA"
  | "GENESIS_REVIEW"
  | "IT_DECISION"
  | "DIRECTOR_DECISION"
  | "RELEASE"
  | "ACTIVE";

export interface LifecycleStageDescriptor {
  readonly key: LifecycleStageKey;
  readonly label: string;
  readonly order: number;
}

export const CANONICAL_LIFECYCLE_STAGES: readonly LifecycleStageDescriptor[] = [
  { key: "REQUIREMENT", label: "Requirement", order: 1 },
  { key: "FACTORY", label: "Factory", order: 2 },
  { key: "DRAFT", label: "Draf", order: 3 },
  { key: "AUTOMATED_QA", label: "QA Otomatis", order: 4 },
  { key: "GENESIS_REVIEW", label: "Review GENESIS", order: 5 },
  { key: "IT_DECISION", label: "Keputusan IT", order: 6 },
  { key: "DIRECTOR_DECISION", label: "Persetujuan Direktur", order: 7 },
  { key: "RELEASE", label: "Rilis", order: 8 },
  { key: "ACTIVE", label: "Aktif", order: 9 },
];

export type StageDisplayStatus =
  | "COMPLETED"
  | "CURRENT"
  | "PENDING"
  | "SKIPPED"
  | "DEVIATION"
  | "REJECTED"
  | "ON_HOLD"
  | "BLOCKED"
  | "SUSPENDED"
  | "ROLLED_BACK"
  | "UNKNOWN";

export interface LifecycleProjection {
  readonly activeStageKey: LifecycleStageKey | null;
  readonly activeStageLabel: string;
  readonly stageStatuses: Record<LifecycleStageKey, StageDisplayStatus>;
  readonly isTerminalOrDeviation: boolean;
  readonly deviationNotice?: string;
}

/**
 * Projects a canonical Backend release state into an explicit, truthful UI stage representation.
 * NEVER assumes preceding stages are successfully completed when a terminal or deviation state is active.
 */
export function projectLifecycleStages(
  state: CanonicalReleaseState,
  materiality?: MaterialityLevel | null,
  killSwitchActive?: boolean,
  hasAuthoritativeLineage: boolean = false,
): LifecycleProjection {
  const lineageStatus: StageDisplayStatus = hasAuthoritativeLineage ? "COMPLETED" : "UNKNOWN";

  const postReleaseDirectorStatus: StageDisplayStatus =
    materiality === "NON_MATERIAL"
      ? "SKIPPED"
      : materiality === "MATERIAL"
        ? "COMPLETED"
        : "UNKNOWN";

  const basePending: Record<LifecycleStageKey, StageDisplayStatus> = {
    REQUIREMENT: lineageStatus,
    FACTORY: lineageStatus,
    DRAFT: "PENDING",
    AUTOMATED_QA: "PENDING",
    GENESIS_REVIEW: "PENDING",
    IT_DECISION: "PENDING",
    DIRECTOR_DECISION: "PENDING",
    RELEASE: "PENDING",
    ACTIVE: "PENDING",
  };

  switch (state) {
    case "DRAFT":
      return {
        activeStageKey: "DRAFT",
        activeStageLabel: "Draf Komponen",
        stageStatuses: {
          ...basePending,
          DRAFT: "CURRENT",
        },
        isTerminalOrDeviation: false,
      };

    case "IMPLEMENTED":
      return {
        activeStageKey: "AUTOMATED_QA",
        activeStageLabel: "Terimplementasi (Menunggu QA)",
        stageStatuses: {
          ...basePending,
          DRAFT: "COMPLETED",
          AUTOMATED_QA: "CURRENT",
        },
        isTerminalOrDeviation: false,
      };

    case "AUTOMATED_ASSURANCE":
      return {
        activeStageKey: "GENESIS_REVIEW",
        activeStageLabel: "QA Otomatis Selesai (Menunggu Review GENESIS)",
        stageStatuses: {
          ...basePending,
          DRAFT: "COMPLETED",
          AUTOMATED_QA: "COMPLETED",
          GENESIS_REVIEW: "CURRENT",
        },
        isTerminalOrDeviation: false,
      };

    case "AI_REVIEWED":
      return {
        activeStageKey: null,
        activeStageLabel: "Ditinjau AI (Menunggu Penyerahan ke IT)",
        stageStatuses: {
          ...basePending,
          DRAFT: "COMPLETED",
          AUTOMATED_QA: "COMPLETED",
          GENESIS_REVIEW: "COMPLETED",
          IT_DECISION: "PENDING",
        },
        isTerminalOrDeviation: false,
      };

    case "READY_FOR_IT":
      return {
        activeStageKey: "IT_DECISION",
        activeStageLabel: "Menunggu Keputusan IT",
        stageStatuses: {
          ...basePending,
          DRAFT: "COMPLETED",
          AUTOMATED_QA: "COMPLETED",
          GENESIS_REVIEW: "COMPLETED",
          IT_DECISION: "CURRENT",
        },
        isTerminalOrDeviation: false,
      };

    case "IT_APPROVED":
      if (materiality === "NON_MATERIAL") {
        return {
          activeStageKey: "RELEASE",
          activeStageLabel: "Disetujui IT (Siap Rilis)",
          stageStatuses: {
            ...basePending,
            DRAFT: "COMPLETED",
            AUTOMATED_QA: "COMPLETED",
            GENESIS_REVIEW: "COMPLETED",
            IT_DECISION: "COMPLETED",
            DIRECTOR_DECISION: "SKIPPED",
            RELEASE: "CURRENT",
          },
          isTerminalOrDeviation: false,
        };
      }
      if (materiality === "MATERIAL") {
        return {
          activeStageKey: "DIRECTOR_DECISION",
          activeStageLabel: "Disetujui IT (Wajib Persetujuan Direktur)",
          stageStatuses: {
            ...basePending,
            DRAFT: "COMPLETED",
            AUTOMATED_QA: "COMPLETED",
            GENESIS_REVIEW: "COMPLETED",
            IT_DECISION: "COMPLETED",
            DIRECTOR_DECISION: "CURRENT",
          },
          isTerminalOrDeviation: false,
        };
      }
      // Fail closed when materiality is not provided by Backend
      return {
        activeStageKey: null,
        activeStageLabel: "Disetujui IT (Menunggu Informasi Otoritas / Materialitas)",
        stageStatuses: {
          ...basePending,
          DRAFT: "COMPLETED",
          AUTOMATED_QA: "COMPLETED",
          GENESIS_REVIEW: "COMPLETED",
          IT_DECISION: "COMPLETED",
          DIRECTOR_DECISION: "UNKNOWN",
          RELEASE: "UNKNOWN",
        },
        isTerminalOrDeviation: false,
        deviationNotice:
          "Tahap lanjutan menunggu projection materialitas atau transisi Director dari Backend.",
      };

    case "READY_FOR_DIRECTOR":
      return {
        activeStageKey: "DIRECTOR_DECISION",
        activeStageLabel: "Menunggu Persetujuan Direktur",
        stageStatuses: {
          ...basePending,
          DRAFT: "COMPLETED",
          AUTOMATED_QA: "COMPLETED",
          GENESIS_REVIEW: "COMPLETED",
          IT_DECISION: "COMPLETED",
          DIRECTOR_DECISION: "CURRENT",
        },
        isTerminalOrDeviation: false,
      };

    case "DIRECTOR_APPROVED":
      return {
        activeStageKey: "RELEASE",
        activeStageLabel: "Disetujui Direktur (Siap Rilis)",
        stageStatuses: {
          ...basePending,
          DRAFT: "COMPLETED",
          AUTOMATED_QA: "COMPLETED",
          GENESIS_REVIEW: "COMPLETED",
          IT_DECISION: "COMPLETED",
          DIRECTOR_DECISION: "COMPLETED",
          RELEASE: "CURRENT",
        },
        isTerminalOrDeviation: false,
      };

    case "RELEASED":
      return {
        activeStageKey: "ACTIVE",
        activeStageLabel: "Dirilis — Menunggu Aktivasi",
        stageStatuses: {
          ...basePending,
          DRAFT: "COMPLETED",
          AUTOMATED_QA: "COMPLETED",
          GENESIS_REVIEW: "COMPLETED",
          IT_DECISION: "COMPLETED",
          DIRECTOR_DECISION: postReleaseDirectorStatus,
          RELEASE: "COMPLETED",
          ACTIVE: "CURRENT",
        },
        isTerminalOrDeviation: false,
      };

    case "ACTIVE":
      return {
        activeStageKey: "ACTIVE",
        activeStageLabel: "Aktif di Lingkungan Produksi",
        stageStatuses: {
          ...basePending,
          DRAFT: "COMPLETED",
          AUTOMATED_QA: "COMPLETED",
          GENESIS_REVIEW: "COMPLETED",
          IT_DECISION: "COMPLETED",
          DIRECTOR_DECISION: postReleaseDirectorStatus,
          RELEASE: "COMPLETED",
          ACTIVE: "COMPLETED",
        },
        isTerminalOrDeviation: false,
      };

    case "REVISION_REQUIRED":
      return {
        activeStageKey: "DRAFT",
        activeStageLabel: "Perlu Revisi Teknis",
        stageStatuses: {
          ...basePending,
          DRAFT: "DEVIATION",
        },
        isTerminalOrDeviation: true,
        deviationNotice: "Komponen memerlukan perbaikan teknis sebelum dapat diproses kembali.",
      };

    case "RETURNED":
      return {
        activeStageKey: null,
        activeStageLabel: "Dikembalikan",
        stageStatuses: {
          ...basePending,
          DRAFT: "DEVIATION",
          AUTOMATED_QA: "COMPLETED",
          GENESIS_REVIEW: "COMPLETED",
          IT_DECISION: "UNKNOWN",
          DIRECTOR_DECISION: "UNKNOWN",
        },
        isTerminalOrDeviation: true,
        deviationNotice:
          "Rilis dikembalikan untuk revisi. Tahap dan otoritas keputusan tidak tersedia pada projection rilis Backend.",
      };

    case "REJECTED":
      return {
        activeStageKey: null,
        activeStageLabel: "Ditolak",
        stageStatuses: {
          ...basePending,
          DRAFT: "COMPLETED",
          AUTOMATED_QA: "COMPLETED",
          GENESIS_REVIEW: "COMPLETED",
          IT_DECISION: "UNKNOWN",
          DIRECTOR_DECISION: "UNKNOWN",
        },
        isTerminalOrDeviation: true,
        deviationNotice:
          "Rilis ditolak secara definitif. Tahap dan otoritas keputusan tidak tersedia pada projection rilis Backend.",
      };

    case "HOLD":
      return {
        activeStageKey: null,
        activeStageLabel: "Ditahan",
        stageStatuses: {
          ...basePending,
          DRAFT: "COMPLETED",
          AUTOMATED_QA: "COMPLETED",
          GENESIS_REVIEW: "COMPLETED",
          IT_DECISION: "UNKNOWN",
          DIRECTOR_DECISION: "UNKNOWN",
        },
        isTerminalOrDeviation: true,
        deviationNotice:
          "Evaluasi rilis sedang ditahan. Tahap dan otoritas keputusan tidak tersedia pada projection rilis Backend.",
      };

    case "BLOCKED":
      return {
        activeStageKey: null,
        activeStageLabel: "Terblokir Kendala Operasional / Integrasi",
        stageStatuses: {
          ...basePending,
          DRAFT: "BLOCKED",
        },
        isTerminalOrDeviation: true,
        deviationNotice: "Rilis terblokir dependensi eksternal atau kendala integrasi.",
      };

    case "SUSPENDED":
      return {
        activeStageKey: "ACTIVE",
        activeStageLabel: killSwitchActive ? "Ditangguhkan (Kill Switch Aktif)" : "Ditangguhkan",
        stageStatuses: {
          ...basePending,
          DRAFT: "COMPLETED",
          AUTOMATED_QA: "COMPLETED",
          GENESIS_REVIEW: "COMPLETED",
          IT_DECISION: "COMPLETED",
          DIRECTOR_DECISION: postReleaseDirectorStatus,
          RELEASE: "COMPLETED",
          ACTIVE: "SUSPENDED",
        },
        isTerminalOrDeviation: true,
        deviationNotice: killSwitchActive
          ? "Rilis dinonaktifkan darurat oleh sakelar pemutus (kill switch)."
          : "Rilis dinonaktifkan sementara dari lingkungan operasional.",
      };

    case "ROLLED_BACK":
      return {
        activeStageKey: "ACTIVE",
        activeStageLabel: "Di-rollback ke Versi Sebelumnya",
        stageStatuses: {
          ...basePending,
          DRAFT: "COMPLETED",
          AUTOMATED_QA: "COMPLETED",
          GENESIS_REVIEW: "COMPLETED",
          IT_DECISION: "COMPLETED",
          DIRECTOR_DECISION: postReleaseDirectorStatus,
          RELEASE: "COMPLETED",
          ACTIVE: "ROLLED_BACK",
        },
        isTerminalOrDeviation: true,
        deviationNotice: "Operasional rilis telah dikembalikan ke versi rilis sebelumnya.",
      };

    default:
      return {
        activeStageKey: null,
        activeStageLabel: "State Tidak Dikenal",
        stageStatuses: basePending,
        isTerminalOrDeviation: true,
      };
  }
}

/**
 * Maps a canonical Backend release state to the current active lifecycle stage key if determinable.
 * Does NOT assume non-material when materiality is omitted.
 */
export function getActiveLifecycleStage(
  state: CanonicalReleaseState,
  materiality?: MaterialityLevel | null,
): LifecycleStageKey | null {
  return projectLifecycleStages(state, materiality).activeStageKey;
}

/**
 * Evaluates allowed actions strictly against canonical Backend authority semantics.
 * Backend authority requires:
 * - it-decision: IT_ADMIN AND release.decide.it
 * - director-decision: EXECUTIVE AND release.decide.director
 * - release/activate/suspend/kill/clear-kill/rollback: IT_ADMIN AND release.manage
 *
 * Materiality fail-closed invariant:
 * - IT_APPROVED only allows "release" if materiality is authoritatively confirmed as "NON_MATERIAL".
 * - If materiality is missing / unknown, NO action is allowed.
 *
 * Runtime suspension invariant:
 * - SUSPENDED with kill_switch_active=true allows "clear-kill" (if IT_ADMIN AND release.manage).
 * - SUSPENDED with kill_switch_active=false allows NO ACTION (fail closed, no invented resume).
 */
export function getAllowedReleaseActions(
  release: GovernedReleaseProjection,
  actor: { roles: readonly string[]; permissions?: readonly string[] },
): readonly CanonicalReleaseAction[] {
  const roles = new Set(actor.roles);
  const permissions = new Set(actor.permissions ?? []);

  const hasItDecide = roles.has("IT_ADMIN") && permissions.has("release.decide.it");
  const hasDirectorDecide = roles.has("EXECUTIVE") && permissions.has("release.decide.director");
  const hasReleaseManage = roles.has("IT_ADMIN") && permissions.has("release.manage");

  const allowed: CanonicalReleaseAction[] = [];

  switch (release.state) {
    case "READY_FOR_IT":
      if (hasItDecide) allowed.push("it-decision");
      break;

    case "IT_APPROVED":
      // FAIL CLOSED: Only allow release if Backend authoritatively confirms NON_MATERIAL!
      // If materiality is null, undefined, or missing, NO mutation is allowed.
      if (release.materiality === "NON_MATERIAL" && hasReleaseManage) {
        allowed.push("release");
      }
      break;

    case "READY_FOR_DIRECTOR":
      if (hasDirectorDecide) allowed.push("director-decision");
      break;

    case "DIRECTOR_APPROVED":
      if (hasReleaseManage) allowed.push("release");
      break;

    case "RELEASED":
      if (hasReleaseManage) allowed.push("activate");
      break;

    case "ACTIVE":
      if (hasReleaseManage) {
        allowed.push("suspend");
        allowed.push("kill");
        allowed.push("rollback");
      }
      break;

    case "SUSPENDED":
      // FAIL CLOSED: Only clear-kill is permitted when kill switch was activated.
      // Normal suspension has no public resume endpoint; never offer activate!
      if (hasReleaseManage && release.kill_switch_active) {
        allowed.push("clear-kill");
      }
      break;

    default:
      break;
  }

  return allowed;
}

/**
 * Canonical Backend Release API Client
 */
export const backendReleaseAdapter = {
  /**
   * POST /api/v1/releases
   */
  async create(payload: CreateReleasePayload): Promise<GovernedReleaseProjection> {
    return await authenticatedApiRequest<GovernedReleaseProjection>("/api/v1/releases", {
      method: "POST",
      body: payload,
    });
  },

  /**
   * GET /api/v1/releases/{release_id}
   */
  async get(releaseId: string): Promise<GovernedReleaseProjection> {
    return await authenticatedApiRequest<GovernedReleaseProjection>(
      `/api/v1/releases/${encodeURIComponent(releaseId)}`,
    );
  },

  /**
   * POST /api/v1/releases/{release_id}/actions/{action}
   */
  async executeAction(
    releaseId: string,
    action: CanonicalReleaseAction,
    payload: ReleaseActionPayload = {},
  ): Promise<GovernedReleaseProjection> {
    return await authenticatedApiRequest<GovernedReleaseProjection>(
      `/api/v1/releases/${encodeURIComponent(releaseId)}/actions/${action}`,
      {
        method: "POST",
        body: payload,
      },
    );
  },

  /**
   * Convenience wrapper for submitting IT Decision
   */
  async submitItDecision(
    releaseId: string,
    data: { decision_id?: string; outcome: DecisionOutcome; rationale: string },
  ): Promise<GovernedReleaseProjection> {
    const decision_id =
      data.decision_id ||
      (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `dec_${Date.now()}`);
    return this.executeAction(releaseId, "it-decision", {
      decision_id,
      outcome: data.outcome,
      rationale: data.rationale,
    });
  },

  /**
   * Convenience wrapper for submitting Director Decision
   */
  async submitDirectorDecision(
    releaseId: string,
    data: { decision_id?: string; outcome: DecisionOutcome; rationale: string },
  ): Promise<GovernedReleaseProjection> {
    const decision_id =
      data.decision_id ||
      (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `dec_${Date.now()}`);
    return this.executeAction(releaseId, "director-decision", {
      decision_id,
      outcome: data.outcome,
      rationale: data.rationale,
    });
  },
};
