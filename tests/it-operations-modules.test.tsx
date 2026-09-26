import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { projectWorkspaceNavigation } from "@/features/workspace-shell/workspace-navigation";
import { getModuleReadiness } from "@/features/workspace-routing";
import { renderItWorkspaceModule } from "@/modules/it";

describe("IT Operations Modules - Incidents, Security, Backup & DR", () => {
  beforeEach(() => {
    cleanup();
  });

  afterEach(() => {
    cleanup();
  });

  describe("Navigation projection & readiness decoupling", () => {
    it("projects operations modules with navigable: true and truthful availability", () => {
      const nav = projectWorkspaceNavigation(
        {
          workspaceId: "ws_it_01",
          workspaceKey: "it",
          workspaceLabel: "IT Workspace",
          divisionCode: "IT",
          roleLabel: "Administrator IT",
        },
        {
          user_id: "usr_it_admin",
          organization_id: "org_01",
          tenant_id: "tenant_01",
          roles: ["IT_ADMIN"],
          division_codes: ["IT"],
          workspace_ids: ["ws_it_01"],
          issued_at: "",
          expires_at: "",
        },
      );

      const targetModules = [
        { key: "incidents", href: "/workspace/it/incidents" },
        { key: "security", href: "/workspace/it/security" },
        { key: "backup", href: "/workspace/it/backup" },
      ];

      for (const target of targetModules) {
        const item = nav.find((i) => i.key === target.key);
        expect(item).toBeDefined();
        expect(item?.href).toBe(target.href);
        expect(item?.group).toBe("OPERATIONS");
        expect(item?.navigable).toBe(true);
        const readiness = getModuleReadiness(target.key);
        expect(item?.availability).toBe(readiness.availability);
        expect(item?.blockReason).toBe(readiness.blockReason);
      }
    });
  });

  describe("Incidents Workspace", () => {
    it("renders honest not-connected state and avoids claiming 0 incidents", () => {
      render(renderItWorkspaceModule("incidents"));

      expect(screen.getByRole("heading", { name: "Incidents", level: 1 })).toBeInTheDocument();
      expect(screen.getByText("No incident source connected.")).toBeInTheDocument();
      expect(screen.queryByText(/0 incidents/i)).not.toBeInTheDocument();
    });
  });

  describe("Security Workspace", () => {
    it("renders honest not-connected state and avoids claiming 100% compliant or secure", () => {
      render(renderItWorkspaceModule("security"));

      expect(screen.getByRole("heading", { name: "Security", level: 1 })).toBeInTheDocument();
      expect(screen.getByText("No security finding source connected.")).toBeInTheDocument();
      expect(screen.queryByText(/no vulnerabilities/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/100% compliant/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/^secure$/i)).not.toBeInTheDocument();
    });
  });

  describe("Backup & DR Workspace", () => {
    it("renders honest not-connected state and avoids claiming backup success", () => {
      render(renderItWorkspaceModule("backup"));

      expect(screen.getByRole("heading", { name: "Backup & DR", level: 1 })).toBeInTheDocument();
      expect(
        screen.getByText("No backend backup evidence source connected."),
      ).toBeInTheDocument();
      expect(
        screen.getByText("No restore test evidence source connected."),
      ).toBeInTheDocument();
      expect(screen.queryByText(/backup success/i)).not.toBeInTheDocument();
    });
  });
});
