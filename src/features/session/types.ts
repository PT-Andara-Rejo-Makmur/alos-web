/** Canonical frontend projection of the authenticated Backend principal. */
export type SessionActor = {
  user_id: string;
  organization_id: string | null;
  roles: string[];
  division_codes: string[];
  workspace_ids: string[];
  issued_at: string | null;
  expires_at: string | null;
};

/** Workspace access already projected and authorized by the Backend. */
export type Workspace = {
  workspace_id: string;
  workspace_key: string;
  name: string;
  division_code: string | null;
  access_level: string;
};

export interface SessionPrincipal {
  readonly user_id?: string;
  readonly actor_id?: string;
  readonly organization_id?: string | null;
  readonly roles?: readonly string[];
  readonly division_codes?: readonly string[];
  readonly workspace_ids?: readonly string[];
  readonly issued_at?: string | null;
  readonly expires_at?: string | null;
}

export interface SessionProjection {
  readonly authenticated: boolean;
  readonly principal?: SessionPrincipal | null;
}
