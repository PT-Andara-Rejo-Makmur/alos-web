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

export interface SessionProjection {
  readonly authenticated: boolean;
  readonly principal?: AuthenticatedPrincipalProjection | null;
}
