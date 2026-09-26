import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import * as api from "@/lib/api";
import {
  isKnownWorkspaceModule,
  getWorkspaceModuleRoute,
  type CanonicalWorkspaceKey,
  type SharedModuleKey,
} from "@/features/workspace-routing";
import { projectWorkspaceNavigation } from "@/features/workspace-shell/workspace-navigation";
import { ContextualWorkspaceModulePage, type WorkspaceShellIdentity } from "@/features/workspace-shell";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/workspace",
  notFound: vi.fn(),
}));

const WORKSPACES: readonly CanonicalWorkspaceKey[] = [
  "executive",
  "finance",
  "hr",
  "legal",
  "sales",
  "property",
  "it",
];

const WORK_MODULES: readonly SharedModuleKey[] = [
  "projects",
  "tasks",
  "approvals",
  "documents",
  "reports",
  "findings",
];

describe("Shared Work Routing & Navigation Completeness Matrix", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  describe("1. Canonical Route Completeness (7 Workspaces x 6 Modules = 42 Combinations)", () => {
    WORKSPACES.forEach((workspace) => {
      WORK_MODULES.forEach((modKey) => {
        it(`verifies ${workspace} allowlist and canonical route for module "${modKey}"`, () => {
          expect(isKnownWorkspaceModule(workspace, modKey)).toBe(true);

          const route = getWorkspaceModuleRoute(workspace, modKey);
          expect(route).toBe(`/workspace/${workspace}/${modKey}`);
          expect(route).not.toBe("/workspace");
        });
      });
    });
  });

  describe("2. Navigation Projection Completeness (All 7 Workspaces have all 6 Work capabilities)", () => {
    const identities: Record<CanonicalWorkspaceKey, WorkspaceShellIdentity> = {
      executive: {
        workspaceId: "ws_exec_01",
        workspaceKey: "executive",
        workspaceLabel: "Executive Workspace",
        divisionCode: "EXECUTIVE",
        roleLabel: "Direktur",
      },
      finance: {
        workspaceId: "ws_fin_01",
        workspaceKey: "finance",
        workspaceLabel: "Finance Workspace",
        divisionCode: "FINANCE",
        roleLabel: "Staff Keuangan",
      },
      hr: {
        workspaceId: "ws_hr_01",
        workspaceKey: "hr",
        workspaceLabel: "HR Workspace",
        divisionCode: "HR",
        roleLabel: "Staff HR",
      },
      legal: {
        workspaceId: "ws_leg_01",
        workspaceKey: "legal",
        workspaceLabel: "Legal Workspace",
        divisionCode: "LEGAL",
        roleLabel: "Staff Legal",
      },
      sales: {
        workspaceId: "ws_sales_01",
        workspaceKey: "sales",
        workspaceLabel: "Sales Workspace",
        divisionCode: "SALES",
        roleLabel: "Staff Sales",
      },
      property: {
        workspaceId: "ws_prop_01",
        workspaceKey: "property",
        workspaceLabel: "Property Workspace",
        divisionCode: "PROPERTY",
        roleLabel: "Staff Property",
      },
      it: {
        workspaceId: "ws_it_01",
        workspaceKey: "it",
        workspaceLabel: "IT Workspace",
        divisionCode: "IT",
        roleLabel: "Staff IT",
      },
    };

    WORKSPACES.forEach((workspace) => {
      it(`projects all 6 navigable Shared Work items for ${workspace}`, () => {
        const identity = identities[workspace];
        const actor = {
          user_id: `usr_${workspace}`,
          organization_id: "org_01",
          tenant_id: "tenant_01",
          roles: [`${workspace.toUpperCase()}_USER`],
          permissions: [],
          division_codes: [identity.divisionCode ?? ""],
          workspace_ids: [identity.workspaceId],
          issued_at: "",
          expires_at: "",
        };

        const nav = projectWorkspaceNavigation(identity, actor);

        for (const workMod of WORK_MODULES) {
          const item = nav.find((i) => i.key === workMod);
          expect(item, `Module "${workMod}" must be present in ${workspace} navigation`).toBeDefined();
          expect(item?.href).toBe(`/workspace/${workspace}/${workMod}`);
          expect(item?.navigable).toBe(true);
          expect(item?.available).toBe(true); // navigable implies available in nav projection
          expect(item?.availability).toBe("BLOCKED"); // Truthful backend readiness preserved
        }
      });
    });
  });

  describe("3. Fail-Closed Authority Verification (URL does not grant authority)", () => {
    it("denies access when a FINANCE session attempts to access HR workspace routes", async () => {
      vi.spyOn(api, "sessionApiRequest").mockResolvedValue({
        authenticated: true,
        principal: {
          actor: {
            actor_id: "actor_fin_01",
            tenant_id: "tenant_01",
            organization_id: "org_01",
            display_name: "Finance User",
            active: true,
          },
          email: "fin@andara.local",
          workspace_access: [{
            workspace: {
              workspace_id: "ws_fin_01",
              workspace_key: "finance",
              organization_id: "org_01",
              workspace_name: "Finance Holding",
              workspace_type: "BUSINESS",
              division_code: "FINANCE",
              active: true,
            },
            role_refs: ["FINANCE_STAFF"],
            permission_refs: [],
            scope_refs: ["ws_fin_01"],
            data_scope: "WORKSPACE",
            active: true,
          }],
          active_workspace: {
            workspace: {
              workspace_id: "ws_fin_01",
              workspace_key: "finance",
              organization_id: "org_01",
              workspace_name: "Finance Holding",
              workspace_type: "BUSINESS",
              division_code: "FINANCE",
              active: true,
            },
            role_refs: ["FINANCE_STAFF"],
            permission_refs: [],
            scope_refs: ["ws_fin_01"],
            data_scope: "WORKSPACE",
            active: true,
          },
          issued_at: "2026-09-24T00:00:00Z",
          expires_at: "2026-09-25T00:00:00Z",
        },
      });

      render(<ContextualWorkspaceModulePage workspaceKey="hr" module="projects" />);
      expect(await screen.findByText("Bukan Otoritas HR")).toBeInTheDocument();
      expect(screen.queryByText("Portofolio Proyek")).not.toBeInTheDocument();
    });

    it("denies access when an IT session attempts to access Legal workspace routes", async () => {
      vi.spyOn(api, "sessionApiRequest").mockResolvedValue({
        authenticated: true,
        principal: {
          actor: {
            actor_id: "actor_it_01",
            tenant_id: "tenant_01",
            organization_id: "org_01",
            display_name: "IT Engineer",
            active: true,
          },
          email: "it@andara.local",
          workspace_access: [{
            workspace: {
              workspace_id: "ws_it_01",
              workspace_key: "it",
              organization_id: "org_01",
              workspace_name: "Technology Workspace",
              workspace_type: "BUSINESS",
              division_code: "IT",
              active: true,
            },
            role_refs: ["IT_STAFF"],
            permission_refs: [],
            scope_refs: ["ws_it_01"],
            data_scope: "WORKSPACE",
            active: true,
          }],
          active_workspace: {
            workspace: {
              workspace_id: "ws_it_01",
              workspace_key: "it",
              organization_id: "org_01",
              workspace_name: "Technology Workspace",
              workspace_type: "BUSINESS",
              division_code: "IT",
              active: true,
            },
            role_refs: ["IT_STAFF"],
            permission_refs: [],
            scope_refs: ["ws_it_01"],
            data_scope: "WORKSPACE",
            active: true,
          },
          issued_at: "2026-09-24T00:00:00Z",
          expires_at: "2026-09-25T00:00:00Z",
        },
      });

      render(<ContextualWorkspaceModulePage workspaceKey="legal" module="findings" />);
      expect(await screen.findByText("Bukan Otoritas Legal")).toBeInTheDocument();
      expect(screen.queryByText("Temuan & Risiko")).not.toBeInTheDocument();
    });
  });
});
