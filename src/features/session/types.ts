import type {
  AuthenticatedPrincipalProjection,
  WorkspaceAccessProjection,
} from "@/lib/contracts";

/** Presentation projection derived from the Backend-authorized active membership. */
export type SessionActor = {
  user_id: string;
  organization_id: string;
  roles: string[];
  permissions?: string[];
  scopes?: string[];
  division_codes: string[];
  workspace_ids: string[];
  issued_at: string;
  expires_at: string;
};

/** Compatibility presentation shape; authority remains the canonical access projection. */
export type Workspace = {
  workspace_id: string;
  workspace_key: string;
  name: string;
  workspace_type?: WorkspaceAccessProjection["workspace"]["workspace_type"];
  division_code: string | null;
  access_level: string;
  role_refs?: readonly string[];
  permission_refs?: readonly string[];
  scope_refs?: readonly string[];
};

export type SessionPrincipal = AuthenticatedPrincipalProjection;

/** Canonical Web session context. Active authority is the Backend projection only. */
export interface SessionContext {
  readonly principal: SessionPrincipal | LegacySessionPrincipal;
  readonly actor: SessionActor;
  readonly activeWorkspace: Workspace | null;
}

export interface LegacySessionPrincipal {
  readonly actor_id?: string;
  readonly user_id?: string;
  readonly organization_id?: string | null;
  readonly roles?: readonly string[];
  readonly division_codes?: readonly string[];
  readonly workspace_ids?: readonly string[];
  readonly issued_at?: string | null;
  readonly expires_at?: string | null;
}

export interface SessionProjection {
  readonly authenticated: boolean;
  readonly principal?: AuthenticatedPrincipalProjection | LegacySessionPrincipal | null;
}
