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

export type AuthorityLevel =
  | "REQUESTER"
  | "OPERATOR"
  | "IT_APPROVER"
  | "DIRECTOR_APPROVER"
  | "SYSTEM";

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
  readonly materiality?: MaterialityLevel;
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
  readonly authority_level?: AuthorityLevel;
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

/**
 * Maps a canonical Backend release state to the current active lifecycle stage.
 */
export function getActiveLifecycleStage(
  state: CanonicalReleaseState,
  materiality: MaterialityLevel = "NON_MATERIAL",
): LifecycleStageKey {
  switch (state) {
    case "DRAFT":
    case "REVISION_REQUIRED":
      return "DRAFT";
    case "IMPLEMENTED":
    case "AUTOMATED_ASSURANCE":
      return "AUTOMATED_QA";
    case "AI_REVIEWED":
      return "GENESIS_REVIEW";
    case "READY_FOR_IT":
    case "RETURNED":
    case "REJECTED":
    case "HOLD":
      return "IT_DECISION";
    case "IT_APPROVED":
      return materiality === "MATERIAL" ? "DIRECTOR_DECISION" : "RELEASE";
    case "READY_FOR_DIRECTOR":
    case "DIRECTOR_APPROVED":
      return materiality === "MATERIAL" ? "DIRECTOR_DECISION" : "RELEASE";
    case "RELEASED":
      return "RELEASE";
    case "ACTIVE":
    case "SUSPENDED":
    case "ROLLED_BACK":
    case "BLOCKED":
      return "ACTIVE";
    default:
      return "DRAFT";
  }
}

/**
 * Evaluates allowed actions directly against canonical Backend authority semantics.
 * Backend endpoints:
 * - it-decision: IT_ADMIN / release.decide.it
 * - director-decision: EXECUTIVE / release.decide.director
 * - release: IT_ADMIN / release.manage
 * - activate: IT_ADMIN / release.manage
 * - suspend: IT_ADMIN / release.manage
 * - kill: IT_ADMIN / release.manage
 * - clear-kill: IT_ADMIN / release.manage
 * - rollback: IT_ADMIN / release.manage
 */
export function getAllowedReleaseActions(
  release: GovernedReleaseProjection,
  actor: { roles: readonly string[]; permissions?: readonly string[] },
): readonly CanonicalReleaseAction[] {
  const roles = new Set(actor.roles);
  const permissions = new Set(actor.permissions ?? []);

  const hasItDecide = roles.has("IT_ADMIN") || permissions.has("release.decide.it");
  const hasDirectorDecide = roles.has("EXECUTIVE") || permissions.has("release.decide.director");
  const hasReleaseManage = roles.has("IT_ADMIN") || permissions.has("release.manage");

  const allowed: CanonicalReleaseAction[] = [];

  switch (release.state) {
    case "READY_FOR_IT":
      if (hasItDecide) allowed.push("it-decision");
      break;

    case "IT_APPROVED":
      if (release.materiality === "MATERIAL") {
        // Must wait for Director decision
      } else {
        if (hasReleaseManage) allowed.push("release");
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
      if (hasReleaseManage) {
        if (release.kill_switch_active) {
          allowed.push("clear-kill");
        } else {
          allowed.push("activate");
        }
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
};
