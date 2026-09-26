import { Suspense } from "react";
import { act, render } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import FinanceModuleRoute from "@/app/workspace/finance/[module]/page";
import WorkspaceItGenesisSubmodulePage from "@/app/workspace/it/genesis/[submodule]/page";
import WorkspaceItGovernanceSubmodulePage from "@/app/workspace/it/governance/[submodule]/page";

const redirectMock = vi.fn();
const notFoundMock = vi.fn();

vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    redirectMock(url);
    throw new Error(`REDIRECT:${url}`);
  },
  notFound: () => {
    notFoundMock();
    throw new Error("NOT_FOUND");
  },
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/workspace",
}));

vi.mock("@/features/workspace-shell", () => ({
  ContextualWorkspaceModulePage: ({ module, workspaceKey }: { module: string; workspaceKey: string }) => (
    <div data-testid="mock-contextual-page" data-module={module} data-workspace={workspaceKey} />
  ),
  ProtectedDomainWorkspace: ({ children }: { children: (ctx: { actor: unknown; identity: unknown }) => React.ReactNode }) => (
    <div data-testid="mock-protected-workspace">
      {typeof children === "function" ? children({ actor: {}, identity: {} }) : children}
    </div>
  ),
}));

describe("Dynamic Module Route Lowercase Enforcement", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Finance [module] page", () => {
    it("redirects uppercase /workspace/finance/TASKS to lowercase canonical /workspace/finance/tasks", async () => {
      await expect(
        FinanceModuleRoute({ params: Promise.resolve({ module: "TASKS" }) }),
      ).rejects.toThrow("REDIRECT:/workspace/finance/tasks");

      expect(redirectMock).toHaveBeenCalledWith("/workspace/finance/tasks");
    });

    it("redirects mixed-case /workspace/finance/Month-Close to lowercase canonical /workspace/finance/month-close", async () => {
      await expect(
        FinanceModuleRoute({ params: Promise.resolve({ module: "Month-Close" }) }),
      ).rejects.toThrow("REDIRECT:/workspace/finance/month-close");

      expect(redirectMock).toHaveBeenCalledWith("/workspace/finance/month-close");
    });

    it("canonicalizes /workspace/finance/close to /workspace/finance/month-close", async () => {
      await expect(
        FinanceModuleRoute({ params: Promise.resolve({ module: "close" }) }),
      ).rejects.toThrow("REDIRECT:/workspace/finance/month-close");

      expect(redirectMock).toHaveBeenCalledWith("/workspace/finance/month-close");
    });

    it("canonicalizes mixed-case /workspace/finance/CLOSE directly to /workspace/finance/month-close", async () => {
      await expect(
        FinanceModuleRoute({ params: Promise.resolve({ module: "CLOSE" }) }),
      ).rejects.toThrow("REDIRECT:/workspace/finance/month-close");

      expect(redirectMock).toHaveBeenCalledWith("/workspace/finance/month-close");
    });

    it("triggers notFound for unknown modules", async () => {
      await expect(
        FinanceModuleRoute({ params: Promise.resolve({ module: "unknown-module" }) }),
      ).rejects.toThrow("NOT_FOUND");

      expect(notFoundMock).toHaveBeenCalled();
    });

    it("renders ContextualWorkspaceModulePage when module is lowercase canonical", async () => {
      const result = await FinanceModuleRoute({ params: Promise.resolve({ module: "tasks" }) });
      expect(result).toBeDefined();
      expect(result.props.module).toBe("tasks");
      expect(result.props.workspaceKey).toBe("finance");
    });
  });

  describe("IT GENESIS [submodule] page", () => {
    it("redirects uppercase /workspace/it/genesis/RESEARCH to lowercase canonical", async () => {
      const resolvedPromise = Promise.resolve({ submodule: "RESEARCH" });
      await expect(
        act(async () => {
          render(
            <Suspense fallback={<div>Loading</div>}>
              <WorkspaceItGenesisSubmodulePage params={resolvedPromise} />
            </Suspense>,
          );
        }),
      ).rejects.toThrow("REDIRECT:/workspace/it/genesis/research");

      expect(redirectMock).toHaveBeenCalledWith("/workspace/it/genesis/research");
    });

    it("redirects uppercase /workspace/it/genesis/AGENTS to lowercase canonical", async () => {
      const resolvedPromise = Promise.resolve({ submodule: "AGENTS" });
      await expect(
        act(async () => {
          render(
            <Suspense fallback={<div>Loading</div>}>
              <WorkspaceItGenesisSubmodulePage params={resolvedPromise} />
            </Suspense>,
          );
        }),
      ).rejects.toThrow("REDIRECT:/workspace/it/genesis/agents");

      expect(redirectMock).toHaveBeenCalledWith("/workspace/it/genesis/agents");
    });

    it("triggers notFound for unknown genesis submodules", async () => {
      const resolvedPromise = Promise.resolve({ submodule: "unknown-submodule" });
      await expect(
        act(async () => {
          render(
            <Suspense fallback={<div>Loading</div>}>
              <WorkspaceItGenesisSubmodulePage params={resolvedPromise} />
            </Suspense>,
          );
        }),
      ).rejects.toThrow("NOT_FOUND");

      expect(notFoundMock).toHaveBeenCalled();
    });
  });

  describe("IT Governance [submodule] page", () => {
    it("redirects uppercase /workspace/it/governance/EVIDENCE to lowercase canonical", async () => {
      const resolvedPromise = Promise.resolve({ submodule: "EVIDENCE" });
      await expect(
        act(async () => {
          render(
            <Suspense fallback={<div>Loading</div>}>
              <WorkspaceItGovernanceSubmodulePage params={resolvedPromise} />
            </Suspense>,
          );
        }),
      ).rejects.toThrow("REDIRECT:/workspace/it/governance/evidence");

      expect(redirectMock).toHaveBeenCalledWith("/workspace/it/governance/evidence");
    });

    it("redirects uppercase /workspace/it/governance/DECISIONS to lowercase canonical", async () => {
      const resolvedPromise = Promise.resolve({ submodule: "DECISIONS" });
      await expect(
        act(async () => {
          render(
            <Suspense fallback={<div>Loading</div>}>
              <WorkspaceItGovernanceSubmodulePage params={resolvedPromise} />
            </Suspense>,
          );
        }),
      ).rejects.toThrow("REDIRECT:/workspace/it/governance/decisions");

      expect(redirectMock).toHaveBeenCalledWith("/workspace/it/governance/decisions");
    });

    it("triggers notFound for unknown governance submodules", async () => {
      const resolvedPromise = Promise.resolve({ submodule: "unknown-submodule" });
      await expect(
        act(async () => {
          render(
            <Suspense fallback={<div>Loading</div>}>
              <WorkspaceItGovernanceSubmodulePage params={resolvedPromise} />
            </Suspense>,
          );
        }),
      ).rejects.toThrow("NOT_FOUND");

      expect(notFoundMock).toHaveBeenCalled();
    });
  });
});
