import { cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { projectSessionContext } from "@/features/session";
import type {
  AuthenticatedPrincipalProjection,
  WorkspaceAccessProjection,
} from "@/lib/contracts";

function access(
  workspaceId: string,
  workspaceName: string,
  role: "WORKSPACE_MEMBER" | "WORKSPACE_LEAD",
): WorkspaceAccessProjection {
  return {
    workspace: {
      workspace_id: workspaceId,
      workspace_key: "property",
      organization_id: "org_andara",
      workspace_name: workspaceName,
      workspace_type: "BUSINESS",
      division_code: "PROPERTY",
      active: true,
    },
    role_refs: [role],
    permission_refs: [],
    scope_refs: [workspaceId],
    data_scope: "WORKSPACE",
    active: true,
  };
}

const alphaAccess = access(
  "workspace_property_alpha",
  "Property Alpha",
  "WORKSPACE_MEMBER",
);
const betaAccess = access(
  "workspace_property_beta",
  "Property Beta",
  "WORKSPACE_LEAD",
);

const principal: AuthenticatedPrincipalProjection = {
  actor: {
    actor_id: "actor_property_owner",
    tenant_id: "tenant_andara",
    organization_id: "org_andara",
    display_name: "Property Actor",
    active: true,
  },
  email: "property.actor@andara.local",
  workspace_access: [alphaAccess, betaAccess],
  active_workspace: betaAccess,
  issued_at: "2026-09-24T00:00:00Z",
  expires_at: "2026-09-25T00:00:00Z",
};

describe("canonical active workspace authority", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("projects roles only from the Backend-selected active membership", () => {
    const context = projectSessionContext(principal);

    expect(context.actor.user_id).toBe("actor_property_owner");
    expect(context.actor.workspace_ids).toEqual([
      "workspace_property_alpha",
      "workspace_property_beta",
    ]);
    expect(context.actor.roles).toEqual(["WORKSPACE_LEAD"]);
    expect(context.actor.scopes).toEqual(["workspace_property_beta"]);
    expect(context.activeWorkspace?.workspace_id).toBe("workspace_property_beta");
    expect(context.activeWorkspace?.name).toBe("Property Beta");
  });

  it("fails closed when active workspace is not set by Backend", () => {
    const unselectedPrincipal: AuthenticatedPrincipalProjection = {
      ...principal,
      active_workspace: null,
    };
    const context = projectSessionContext(unselectedPrincipal);

    expect(context.activeWorkspace).toBeNull();
    expect(context.actor.roles).toEqual([]);
    expect(context.actor.scopes).toEqual([]);
  });
});

