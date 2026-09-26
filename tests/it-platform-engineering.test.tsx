import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { projectWorkspaceNavigation } from "@/features/workspace-shell/workspace-navigation";
import { getModuleReadiness } from "@/features/workspace-routing";
import { renderItWorkspaceModule } from "@/modules/it";

describe("IT Platform Environments & Engineering Modules", () => {
  beforeEach(() => {
    cleanup();
  });

  afterEach(() => {
    cleanup();
  });

  describe("Navigation projection & readiness decoupling", () => {
    it("projects environments and engineering modules with navigable: true and available: false", () => {
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
        { key: "environments", href: "/workspace/it/environments", group: "ALOS_PLATFORM" },
        { key: "repositories", href: "/workspace/it/repositories", group: "ENGINEERING" },
        { key: "cicd", href: "/workspace/it/cicd", group: "ENGINEERING" },
        { key: "releases", href: "/workspace/it/releases", group: "ENGINEERING" },
        { key: "tech-debt", href: "/workspace/it/tech-debt", group: "ENGINEERING" },
      ];

      for (const target of targetModules) {
        const item = nav.find((i) => i.key === target.key);
        expect(item).toBeDefined();
        expect(item?.href).toBe(target.href);
        expect(item?.group).toBe(target.group);
        expect(item?.navigable).toBe(true);
        const readiness = getModuleReadiness(target.key);
        expect(item?.availability).toBe(readiness.availability);
        expect(item?.blockReason).toBe(readiness.blockReason);
      }
    });
  });

  describe("Environments Workspace", () => {
    it("renders honest source-not-connected state and empty table", () => {
      render(renderItWorkspaceModule("environments"));

      expect(screen.getByRole("heading", { name: "Environments", level: 1 })).toBeInTheDocument();
      expect(
        screen.getByText("Sumber inventaris environment dari Backend belum terhubung."),
      ).toBeInTheDocument();
      expect(screen.queryByText(/healthy/i)).not.toBeInTheDocument();
    });
  });

  describe("Repositories Workspace", () => {
    it("renders honest source-not-connected state and empty table without fake repos", () => {
      render(renderItWorkspaceModule("repositories"));

      expect(screen.getByRole("heading", { name: "Repositories", level: 1 })).toBeInTheDocument();
      expect(
        screen.getByText("Sumber inventaris repositori dari Backend belum terhubung."),
      ).toBeInTheDocument();
      expect(screen.queryByText("alos-web")).not.toBeInTheDocument();
    });
  });

  describe("CI/CD Workspace", () => {
    it("renders honest pipeline runs empty state without fake builds", () => {
      render(renderItWorkspaceModule("cicd"));

      expect(screen.getByRole("heading", { name: "CI/CD", level: 1 })).toBeInTheDocument();
      expect(
        screen.getByText("Sumber telemetri CI/CD dari Backend belum terhubung."),
      ).toBeInTheDocument();
      expect(screen.queryByText(/build #/i)).not.toBeInTheDocument();
    });
  });

  describe("Releases Workspace", () => {
    it("renders honest release registry empty state without fake releases", () => {
      render(renderItWorkspaceModule("releases"));

      expect(screen.getByRole("heading", { name: "Releases", level: 1 })).toBeInTheDocument();
      expect(
        screen.getByText("Sumber siklus rilis dari Backend belum terhubung."),
      ).toBeInTheDocument();
      expect(screen.queryByText(/v1\./i)).not.toBeInTheDocument();
    });
  });

  describe("Technical Debt Workspace", () => {
    it("renders honest tech debt register empty state without fake items", () => {
      render(renderItWorkspaceModule("tech-debt"));

      expect(screen.getByRole("heading", { name: "Technical Debt", level: 1 })).toBeInTheDocument();
      expect(
        screen.getByText("Sumber registri technical debt belum terhubung."),
      ).toBeInTheDocument();
    });
  });
});
