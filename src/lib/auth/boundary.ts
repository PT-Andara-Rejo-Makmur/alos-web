/**
 * Authentication material is supplied by the Backend-facing deployment boundary.
 * This package intentionally stores no token and makes no authorization decision.
 */
export interface AuthProjection {
  readonly authenticated: boolean;
  readonly actorLabel?: string;
}
