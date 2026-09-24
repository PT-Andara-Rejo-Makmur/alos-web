import { cleanup, render, screen } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { projectSessionContext } from "@/features/session";
import { ProtectedDomainWorkspace } from "@/features/workspace-shell";
import * as api from "@/lib/api";
import type {
  AuthenticatedPrincipalProjection,
  WorkspaceAccessProjection,
} from "@/lib/contracts";

const replace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  usePathname: () => "/workspace/property",
}));

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) =>
    createElement("a", { href }, children),
}));

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
  });

  it("renders Property Beta without searching the authorized workspace array", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValue({
      authenticated: true,
      principal,
    });
    const workspaceList = vi.spyOn(api, "authenticatedApiRequest");

    render(
      <ProtectedDomainWorkspace
        divisionCodes={["PROPERTY"]}
        loadingLabel="Memuat Property…"
        workspaceKeys={["property"]}
      >
        {({ actor, identity }) => (
          <div>
            <span>{identity.workspaceLabel}</span>
            <span>{identity.roleLabel}</span>
            <span>{actor.roles.join(",")}</span>
          </div>
        )}
      </ProtectedDomainWorkspace>,
    );

    expect(await screen.findAllByText("Property Beta")).not.toHaveLength(0);
    expect(screen.queryByText("Property Alpha")).not.toBeInTheDocument();
    expect(screen.getAllByText("Penanggung Jawab Workspace")).not.toHaveLength(0);
    expect(screen.getByText("WORKSPACE_LEAD")).toBeInTheDocument();
    expect(
      workspaceList.mock.calls.some(([path]) => path === "/api/v1/workspaces"),
    ).toBe(false);
  });
});
