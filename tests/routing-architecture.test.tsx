import { describe, expect, it } from "vitest";
import {
  WORKSPACE_ROUTES,
  getWorkspaceRoot,
  getWorkspaceModuleRoute,
  getWorkspaceAraRoute,
  getWorkspaceAgentsRoute,
  getGenesisRoute,
  getGovernanceRoute,
  getSharedModuleRoute,
  isKnownWorkspaceModule,
  isKnownGenesisSubmodule,
  isKnownGovernanceSubmodule,
  resolveLegacyRoute,
  getModuleReadiness,
  CANONICAL_WORKSPACE_KEYS,
  type CanonicalWorkspaceKey,
} from "@/features/workspace-routing";
import { projectWorkspaceNavigation } from "@/features/workspace-shell/workspace-navigation";
import type { WorkspaceShellIdentity } from "@/features/workspace-shell/types";
import type { SessionActor, Workspace } from "@/features/session";

describe("ALOS Workspace-Centric Routing Architecture", () => {
  const mockActor = (roles: string[], divisionCode: string, workspaceId: string): SessionActor => ({
    user_id: "usr_test_01",
    organization_id: "org_andara",
    roles,
    division_codes: [divisionCode],
    workspace_ids: [workspaceId],
    issued_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 86400000).toISOString(),
  });

  const mockIdentity = (
    key: CanonicalWorkspaceKey,
    divisionCode: string,
    label: string,
  ): WorkspaceShellIdentity => ({
    workspaceId: `ws_${key}_01`,
    workspaceKey: key,
    workspaceLabel: label,
    roleLabel: "Member",
    divisionCode,
  });

  describe("A. Canonical Route Generation", () => {
    it("generates canonical routes for Finance", () => {
      expect(getWorkspaceModuleRoute("finance", "tasks")).toBe("/workspace/finance/tasks");
      expect(getWorkspaceAraRoute("finance")).toBe("/workspace/finance/ara");
      expect(getWorkspaceAgentsRoute("finance")).toBe("/workspace/finance/agents");
    });

    it("generates canonical routes for HR", () => {
      expect(getWorkspaceModuleRoute("hr", "tasks")).toBe("/workspace/hr/tasks");
      expect(getWorkspaceAraRoute("hr")).toBe("/workspace/hr/ara");
      expect(getWorkspaceAgentsRoute("hr")).toBe("/workspace/hr/agents");
    });

    it("generates canonical routes for Executive", () => {
      expect(getWorkspaceModuleRoute("executive", "divisions")).toBe("/workspace/executive/divisions");
      expect(getWorkspaceModuleRoute("executive", "tasks")).toBe("/workspace/executive/tasks");
      expect(getWorkspaceAraRoute("executive")).toBe("/workspace/executive/ara");
      // Executive does not invent business Agent Workforce
      expect(getWorkspaceAgentsRoute("executive")).toBe("/workspace/executive");
    });

    it("generates canonical routes for IT", () => {
      expect(getWorkspaceAraRoute("it")).toBe("/workspace/it/ara");
      expect(getGenesisRoute()).toBe("/workspace/it/genesis");
      expect(getGenesisRoute("agents")).toBe("/workspace/it/genesis/agents");
      expect(getGenesisRoute("research")).toBe("/workspace/it/genesis/research");
      expect(getGenesisRoute("models-tools")).toBe("/workspace/it/genesis/models-tools");
      expect(getGovernanceRoute()).toBe("/workspace/it/governance");
      expect(getGovernanceRoute("evidence")).toBe("/workspace/it/governance/evidence");
      expect(getWorkspaceAgentsRoute("it")).toBe("/workspace/it/genesis/agents");
    });

    it("generates canonical routes for Legal, Sales, and Property", () => {
      expect(getWorkspaceModuleRoute("legal", "tasks")).toBe("/workspace/legal/tasks");
      expect(getWorkspaceAraRoute("legal")).toBe("/workspace/legal/ara");
      expect(getWorkspaceAgentsRoute("legal")).toBe("/workspace/legal/agents");

      expect(getWorkspaceModuleRoute("sales", "tasks")).toBe("/workspace/sales/tasks");
      expect(getWorkspaceAraRoute("sales")).toBe("/workspace/sales/ara");
      expect(getWorkspaceAgentsRoute("sales")).toBe("/workspace/sales/agents");

      expect(getWorkspaceModuleRoute("property", "tasks")).toBe("/workspace/property/tasks");
      expect(getWorkspaceAraRoute("property")).toBe("/workspace/property/ara");
      expect(getWorkspaceAgentsRoute("property")).toBe("/workspace/property/agents");
    });
  });

  describe("B. No Canonical Navigation Leaking to Legacy Routes", () => {
    const forbiddenPatterns = [
      /^\/ara$/,
      /^\/agents$/,
      /^\/director$/,
      /^\/genesis$/,
      /^\/governance$/,
      /^\/research$/,
      /^\/business$/,
      /^\/business\/(?!settings)/,
      /^\/workspace\/tasks$/,
      /^\/workspace\/projects$/,
      /^\/workspace\/approvals$/,
      /^\/workspace\/documents$/,
      /^\/workspace\/reports$/,
      /^\/workspace\/findings$/,
      /^\/workspace\/ara$/,
      /^\/workspace\/agents$/,
    ];

    CANONICAL_WORKSPACE_KEYS.forEach((key) => {
      it(`verifies no navigation item in ${key} workspace leaks to legacy routes`, () => {
        const divisionCode = key.toUpperCase();
        const roles = key === "executive" ? ["EXECUTIVE"] : key === "it" ? ["IT_ADMIN"] : ["WORKSPACE_LEAD"];
        const identity = mockIdentity(key, divisionCode, `${key} Workspace`);
        const actor = mockActor(roles, divisionCode, `ws_${key}_01`);

        const navItems = projectWorkspaceNavigation(identity, actor);

        navItems.forEach((item) => {
          if (item.href) {
            forbiddenPatterns.forEach((pattern) => {
              expect(
                pattern.test(item.href!),
                `Item ${item.key} in ${key} workspace has forbidden legacy href: ${item.href}`,
              ).toBe(false);
            });
          }
        });
      });
    });
  });

  describe("C. Workspace Authority Safety & URL Independence", () => {
    it("workspace helpers fail safe when given invalid workspace keys", () => {
      expect(getWorkspaceRoot("unknown_key")).toBe(WORKSPACE_ROUTES.resolver);
      expect(getWorkspaceModuleRoute("unknown_key", "tasks")).toBe(WORKSPACE_ROUTES.resolver);
      expect(getWorkspaceAraRoute("unknown_key")).toBe(WORKSPACE_ROUTES.resolver);
      expect(getWorkspaceAgentsRoute("unknown_key")).toBe(WORKSPACE_ROUTES.resolver);
    });

    it("authority remains backed by session activeWorkspace and never inferred from URL pathname", () => {
      // Simulation of HR active workspace context
      const hrWorkspace: Workspace = {
        workspace_id: "ws_hr_01",
        workspace_key: "hr",
        workspace_type: "BUSINESS",
        name: "HR Workspace",
        division_code: "HR",
        access_level: "MEMBER",
      };

      // Even if user visits /workspace/finance/tasks, legacy resolver resolves to active HR workspace
      const resolved = resolveLegacyRoute("/business/tasks", hrWorkspace);
      expect(resolved).toBe("/workspace/hr/tasks");
      expect(resolved).not.toBe("/workspace/finance/tasks");
    });
  });

  describe("D. Legacy Compatibility Redirect Behavior", () => {
    const verifiedFinanceWorkspace: Workspace = {
      workspace_id: "ws_fin_01",
      workspace_key: "finance",
      workspace_type: "BUSINESS",
      name: "Finance Workspace",
      division_code: "FINANCE",
      access_level: "MEMBER",
    };

    const verifiedItWorkspace: Workspace = {
      workspace_id: "ws_it_01",
      workspace_key: "it",
      workspace_type: "BUSINESS",
      name: "IT Workspace",
      division_code: "IT",
      access_level: "ADMIN",
    };

    it("redirects /director to /workspace/executive", () => {
      expect(resolveLegacyRoute("/director")).toBe("/workspace/executive");
    });

    it("redirects /genesis to /workspace/it/genesis", () => {
      expect(resolveLegacyRoute("/genesis")).toBe("/workspace/it/genesis");
    });

    it("redirects /governance to /workspace/it/governance", () => {
      expect(resolveLegacyRoute("/governance")).toBe("/workspace/it/governance");
    });

    it("redirects /research to /workspace/it/genesis/research", () => {
      expect(resolveLegacyRoute("/research")).toBe("/workspace/it/genesis/research");
    });

    it("redirects /ara to verified active workspace ARA route", () => {
      expect(resolveLegacyRoute("/ara", verifiedFinanceWorkspace)).toBe("/workspace/finance/ara");
      expect(resolveLegacyRoute("/workspace/ara", verifiedFinanceWorkspace)).toBe("/workspace/finance/ara");
    });

    it("redirects /agents to contextual business Agent Workforce for business workspaces", () => {
      expect(resolveLegacyRoute("/agents", verifiedFinanceWorkspace)).toBe("/workspace/finance/agents");
      expect(resolveLegacyRoute("/workspace/agents", verifiedFinanceWorkspace)).toBe("/workspace/finance/agents");
    });

    it("redirects /agents to technical GENESIS agents for IT workspace", () => {
      expect(resolveLegacyRoute("/agents", verifiedItWorkspace)).toBe("/workspace/it/genesis/agents");
    });

    it("redirects /business shared work to verified active workspace", () => {
      expect(resolveLegacyRoute("/business/projects", verifiedFinanceWorkspace)).toBe("/workspace/finance/projects");
      expect(resolveLegacyRoute("/business/tasks", verifiedFinanceWorkspace)).toBe("/workspace/finance/tasks");
      expect(resolveLegacyRoute("/business/approvals", verifiedFinanceWorkspace)).toBe("/workspace/finance/approvals");
      expect(resolveLegacyRoute("/business/documents", verifiedFinanceWorkspace)).toBe("/workspace/finance/documents");
      expect(resolveLegacyRoute("/business/reports", verifiedFinanceWorkspace)).toBe("/workspace/finance/reports");
      expect(resolveLegacyRoute("/business/findings", verifiedFinanceWorkspace)).toBe("/workspace/finance/findings");
    });

    it("redirects un-scoped /workspace/* shared routes to verified active workspace", () => {
      expect(resolveLegacyRoute("/workspace/tasks", verifiedFinanceWorkspace)).toBe("/workspace/finance/tasks");
      expect(resolveLegacyRoute("/workspace/projects", verifiedFinanceWorkspace)).toBe("/workspace/finance/projects");
      expect(resolveLegacyRoute("/workspace/approvals", verifiedFinanceWorkspace)).toBe("/workspace/finance/approvals");
    });

    it("redirects /workspace/finance/close to /workspace/finance/month-close", () => {
      expect(resolveLegacyRoute("/workspace/finance/close")).toBe("/workspace/finance/month-close");
    });

    it("fails closed to /workspace resolver when active workspace is unverified", () => {
      expect(resolveLegacyRoute("/ara")).toBe("/workspace");
      expect(resolveLegacyRoute("/agents")).toBe("/workspace");
      expect(resolveLegacyRoute("/business/tasks")).toBe("/workspace");
      expect(resolveLegacyRoute("/workspace/tasks")).toBe("/workspace");
    });
  });

  describe("E. Desktop and Mobile Parity", () => {
    it("ensures mobile header and desktop sidebar use identical canonical roots", () => {
      CANONICAL_WORKSPACE_KEYS.forEach((key) => {
        const root = getWorkspaceRoot(key);
        expect(root).toBe(`/workspace/${key}`);
      });
    });

    it("ensures ARA in topbar and mobile nav resolves to the exact same canonical URI", () => {
      CANONICAL_WORKSPACE_KEYS.forEach((key) => {
        const araRoute = getWorkspaceAraRoute(key);
        expect(araRoute).toBe(`/workspace/${key}/ara`);
      });
    });
  });

  describe("F. Module Readiness Integrity", () => {
    it("maintains BLOCKED status on un-integrated modules without fake success", () => {
      expect(getModuleReadiness("tasks").availability).toBe("BLOCKED");
      expect(getModuleReadiness("projects").availability).toBe("BLOCKED");
      expect(getModuleReadiness("approvals").availability).toBe("BLOCKED");
      expect(getModuleReadiness("documents").availability).toBe("BLOCKED");
      expect(getModuleReadiness("reports").availability).toBe("BLOCKED");
      expect(getModuleReadiness("findings").availability).toBe("BLOCKED");
      expect(getModuleReadiness("ara").availability).toBe("BLOCKED");
      expect(getModuleReadiness("agents").availability).toBe("BLOCKED");
      expect(getModuleReadiness("month-close").availability).toBe("BLOCKED");
      expect(getModuleReadiness("month-close").blockReason).toBe("CONTRACT_PENDING");
      expect(getModuleReadiness("models-tools").availability).toBe("BLOCKED");
      expect(getModuleReadiness("models-tools").blockReason).toBe("MODULE_NOT_IMPLEMENTED");
    });
  });

  describe("G. getSharedModuleRoute Safety", () => {
    it("generates contextual shared module route when given valid workspace key", () => {
      expect(getSharedModuleRoute("finance", "tasks")).toBe("/workspace/finance/tasks");
      expect(getSharedModuleRoute("hr", "approvals")).toBe("/workspace/hr/approvals");
      expect(getSharedModuleRoute("property", "documents")).toBe("/workspace/property/documents");
    });

    it("fails closed to /workspace resolver when workspace key is unknown or invalid", () => {
      expect(getSharedModuleRoute("unknown", "tasks")).toBe("/workspace");
      expect(getSharedModuleRoute("", "tasks")).toBe("/workspace");
    });

    it("never produces an unscoped canonical route like /workspace/tasks", () => {
      const allKeys = ["finance", "hr", "executive", "property", "sales", "legal", "it", "unknown", ""];
      allKeys.forEach((k) => {
        const route = getSharedModuleRoute(k, "tasks");
        expect(route).not.toBe("/workspace/tasks");
      });
    });
  });

  describe("H. Dynamic Module & Submodule Allowlist Validation", () => {
    it("validates known workspace modules and rejects unknown arbitrary modules", () => {
      // Known modules pass
      expect(isKnownWorkspaceModule("finance", "tasks")).toBe(true);
      expect(isKnownWorkspaceModule("finance", "month-close")).toBe(true);
      expect(isKnownWorkspaceModule("finance", "close")).toBe(true);
      expect(isKnownWorkspaceModule("hr", "employees")).toBe(true);
      expect(isKnownWorkspaceModule("executive", "divisions")).toBe(true);
      expect(isKnownWorkspaceModule("property", "payment-certs")).toBe(true);
      expect(isKnownWorkspaceModule("it", "systems")).toBe(true);

      // Unknown modules are rejected
      expect(isKnownWorkspaceModule("finance", "not-a-module")).toBe(false);
      expect(isKnownWorkspaceModule("finance", "random-module")).toBe(false);
      expect(isKnownWorkspaceModule("hr", "not-a-module")).toBe(false);
      expect(isKnownWorkspaceModule("executive", "not-a-module")).toBe(false);
      expect(isKnownWorkspaceModule("property", "random")).toBe(false);
      expect(isKnownWorkspaceModule("unknown-ws", "tasks")).toBe(false);
    });

    it("validates known IT GENESIS submodules and rejects arbitrary submodules", () => {
      expect(isKnownGenesisSubmodule("agents")).toBe(true);
      expect(isKnownGenesisSubmodule("skills")).toBe(true);
      expect(isKnownGenesisSubmodule("research")).toBe(true);
      expect(isKnownGenesisSubmodule("models-tools")).toBe(true);

      expect(isKnownGenesisSubmodule("not-a-module")).toBe(false);
      expect(isKnownGenesisSubmodule("random")).toBe(false);
      expect(isKnownGenesisSubmodule("admin")).toBe(false);
    });

    it("validates known IT Governance submodules and rejects arbitrary submodules", () => {
      expect(isKnownGovernanceSubmodule("evidence")).toBe(true);
      expect(isKnownGovernanceSubmodule("uat")).toBe(true);
      expect(isKnownGovernanceSubmodule("decisions")).toBe(true);

      expect(isKnownGovernanceSubmodule("not-a-module")).toBe(false);
      expect(isKnownGovernanceSubmodule("random")).toBe(false);
      expect(isKnownGovernanceSubmodule("approvals")).toBe(false);
    });
  });

  describe("I. Workspace Navigation Fail-Closed Context Protection", () => {
    it("never defaults unknown workspace context to Finance", () => {
      const unknownIdentity: WorkspaceShellIdentity = {
        workspaceId: "ws_unknown_99",
        workspaceKey: "unknown_workspace",
        workspaceLabel: "Unknown Workspace",
        roleLabel: "Guest",
        divisionCode: null,
      };
      const actor: SessionActor = {
        user_id: "usr_guest",
        organization_id: "org_andara",
        roles: ["WORKSPACE_MEMBER"],
        division_codes: [],
        workspace_ids: ["ws_unknown_99"],
        issued_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 86400000).toISOString(),
      };

      const navItems = projectWorkspaceNavigation(unknownIdentity, actor);

      // Must NOT contain Finance-specific items
      const financeKeys = ["cash", "receivables", "payables", "budget", "reconciliation", "tax", "close"];
      navItems.forEach((item) => {
        expect(financeKeys).not.toContain(item.key);
      });

      // Must fail closed to safe resolver overview
      const overviewItem = navItems.find((item) => item.key === "overview");
      expect(overviewItem).toBeDefined();
    });
  });
});
