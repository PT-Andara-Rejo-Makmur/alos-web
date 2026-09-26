export type DataScope =
  | "COMPANY"
  | "ORGANIZATIONAL_UNIT"
  | "WORKSPACE"
  | "PROJECT"
  | "OWN_ASSIGNED";

export interface WorkspaceOption {
  readonly workspace_id: string;
  readonly workspace_key: string;
  readonly workspace_name: string;
  readonly workspace_type?: string;
  readonly active?: boolean;
}

export interface Membership {
  readonly workspace: WorkspaceOption;
  readonly role_refs: string[];
  readonly permission_refs: string[];
  readonly scope_refs: string[];
  readonly data_scope: DataScope;
}

export interface DraftMembership extends Membership {
  readonly original_workspace_id: string | null;
}

export interface Account {
  readonly actor_id: string;
  readonly display_name: string;
  readonly email: string;
  readonly active: boolean;
  readonly workspace_access: Membership[];
}

export interface IdentityAccessData {
  readonly accounts: Account[];
  readonly assignableRoles: string[];
  readonly workspaces: WorkspaceOption[];
}
