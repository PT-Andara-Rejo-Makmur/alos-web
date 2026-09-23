import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import * as api from "@/lib/api";
import type { Run } from "@/features/governance/core";
import type { SessionActor, Workspace } from "@/features/session";
import type { GenesisActiveAgent } from "@/features/genesis-workspace/types";
import {
  AgentWorkforce,
  AgentWorkforcePage,
  AgentWorkforceBanner,
  AgentWorkforceSummary,
  AgentWorkforceCard,
  AgentWorkforceList,
  AgentWorkforceActivity,
  AgentWorkforceAuthority,
  verifyActiveWorkspace,
  loadBusinessAgentWorkforce,
  loadScopedRunSummary,
  canActorAccessGenesis,
  formatRunTimestamp,
} from "@/features/agent-workforce";
import type { BusinessAgentWorkforceItem } from "@/features/agent-workforce";
import type { WorkspaceShellIdentity } from "@/features/workspace-shell/types";
import { projectWorkspaceNavigation } from "@/features/workspace-shell/workspace-navigation";

// Mock next/navigation
const mockPush = vi.fn();
const mockReplace = vi.fn();
let mockSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
  usePathname: () => "/workspace/agents",
  useSearchParams: () => mockSearchParams,
}));

// Mock next/image
vi.mock("next/image", () => ({
  default: ({
    alt,
    src,
    ...props
  }: React.ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean; priority?: boolean }) => {
    void props;
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={typeof src === "string" ? src : ""} alt={alt || ""} />;
  },
}));

describe("ALOS Agent Workforce (Business-Facing View)", () => {
  const sampleActor: SessionActor = {
    user_id: "usr_finance_mgr_01",
    organization_id: "org_andara_holding",
    roles: ["FINANCE_MANAGER"],
    division_codes: ["FINANCE"],
    workspace_ids: ["ws_finance_holding"],
    issued_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 86400000).toISOString(),
  };

  const sampleDirectorActor: SessionActor = {
    user_id: "usr_director_01",
    organization_id: "org_andara_holding",
    roles: ["EXECUTIVE"],
    division_codes: ["FINANCE", "HR"],
    workspace_ids: ["ws_finance_holding", "ws_hr_holding"],
    issued_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 86400000).toISOString(),
  };

  const sampleWorkspaceIdentity: WorkspaceShellIdentity = {
    workspaceId: "ws_finance_holding",
    workspaceKey: "finance",
    workspaceLabel: "Finance Workspace",
    divisionCode: "FINANCE",
    roleLabel: "Finance Manager",
    accessLevel: "MEMBER",
  };

  const sampleWorkspaces: readonly Workspace[] = [
    {
      workspace_id: "ws_finance_holding",
      workspace_key: "finance",
      name: "Finance Workspace",
      division_code: "FINANCE",
      access_level: "MEMBER",
    },
    {
      workspace_id: "ws_hr_holding",
      workspace_key: "hr",
      name: "HR Workspace",
      division_code: "HR",
      access_level: "MEMBER",
    },
  ];

  const sampleGenesisAgents: GenesisActiveAgent[] = [
    {
      agent_key: "finance-reconciliation-agent",
      name: "Finance Reconciliation",
      semantic_version: "1.2.0",
      purpose: "Rekonsiliasi arus kas dan transaksi invoice vendor.",
      risk_level: "MEDIUM",
      division_scope: ["FINANCE"],
      capability_keys: ["finance_reconciliation", "variance_analysis"],
    },
    {
      agent_key: "budget-cashflow-agent",
      name: "Budget & Cashflow",
      semantic_version: "2.0.1",
      purpose: "Forecast dan variance analysis anggaran bulanan.",
      risk_level: "LOW",
      division_scope: ["FINANCE"],
      capability_keys: ["cashflow_forecast"],
    },
  ];

  const sampleRuns: Run[] = [
    {
      agent_run_id: "run-001",
      agent_key: "finance-reconciliation-agent",
      semantic_version: "1.2.0",
      status: "SUCCEEDED",
      correlation_id: "corr-111",
      created_at: "2026-09-23T08:30:00Z",
      completed_at: "2026-09-23T08:31:00Z",
      provider: "internal-governed",
      model: "alos-safe-model",
      input_tokens: 120,
      output_tokens: 450,
      latency_milliseconds: 890,
      estimated_cost_usd: "0.01",
    },
    {
      agent_run_id: "run-002",
      agent_key: "budget-cashflow-agent",
      semantic_version: "2.0.1",
      status: "BLOCKED",
      correlation_id: "corr-222",
      created_at: "2026-09-23T09:15:00Z",
      completed_at: "2026-09-23T09:15:30Z",
      provider: "internal-governed",
      model: "alos-safe-model",
      input_tokens: 90,
      output_tokens: 0,
      latency_milliseconds: 320,
      estimated_cost_usd: "0.00",
      block_reason: "Governed policy gate triggered",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams();
  });

  afterEach(() => {
    cleanup();
  });

  // Test 1: Active workspace verification for single workspace actor
  it("verifies single workspace actor automatically", () => {
    const res = verifyActiveWorkspace(sampleActor, sampleWorkspaces);
    expect(res.workspace).toBeDefined();
    expect(res.workspace?.workspace_id).toBe("ws_finance_holding");
    expect(res.needsInfoReason).toBeNull();
  });

  // Test 2: Multi-workspace actor fails closed without implicit [0]
  it("fails closed (NEEDS_INFO) for multi-workspace actor without explicit requested ID", () => {
    const res = verifyActiveWorkspace(sampleDirectorActor, sampleWorkspaces);
    expect(res.workspace).toBeNull();
    expect(res.needsInfoReason).toContain("Pengguna memiliki beberapa workspace");
  });

  // Test 3: Multi-workspace actor succeeds when requested workspace is authorized
  it("resolves multi-workspace actor when requested workspace is authorized", () => {
    const res = verifyActiveWorkspace(sampleDirectorActor, sampleWorkspaces, "ws_hr_holding");
    expect(res.workspace).toBeDefined();
    expect(res.workspace?.workspace_id).toBe("ws_hr_holding");
    expect(res.needsInfoReason).toBeNull();
  });

  // Test 4: Rejects unauthorized requested workspace ID
  it("rejects unauthorized requested workspace ID", () => {
    const res = verifyActiveWorkspace(sampleActor, sampleWorkspaces, "ws_unauthorized");
    expect(res.workspace).toBeNull();
    expect(res.needsInfoReason).toContain("tidak diizinkan");
  });

  // Test 5: loadBusinessAgentWorkforce calls /api/v1/genesis/active-agents with verified workspace
  it("loads business agent workforce from backend active-agents endpoint", async () => {
    const spy = vi.spyOn(api, "apiRequest").mockResolvedValueOnce(sampleGenesisAgents);

    const items = await loadBusinessAgentWorkforce("ws_finance_holding");
    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/genesis/active-agents?workspace_id=ws_finance_holding"),
    );
    expect(items).toHaveLength(2);
    expect(items[0].name).toBe("Finance Reconciliation");
    expect(items[0].availability).toBe("AVAILABLE");
    expect(items[0].humanReviewRequired).toBe(true);
  });

  // Test 6: Zero-fabrication - Agent not returned by backend is not rendered
  it("returns empty array when backend active-agents returns empty (zero-fabrication)", async () => {
    vi.spyOn(api, "apiRequest").mockResolvedValueOnce([]);

    const items = await loadBusinessAgentWorkforce("ws_finance_holding");
    expect(items).toEqual([]);
  });

  // Test 7: Strategic catalog is not used as production fallback on backend failure
  it("does not populate fallback catalog when backend call fails", async () => {
    vi.spyOn(api, "apiRequest").mockRejectedValueOnce(new Error("Network failed"));

    await expect(loadBusinessAgentWorkforce("ws_finance_holding")).rejects.toThrow("Network failed");
  });

  // Test 8: Business card hides raw model, provider, tokens, and schemas
  it("renders business card without exposing raw technical internals", () => {
    const item: BusinessAgentWorkforceItem = {
      agentKey: "finance-reconciliation-agent",
      name: "Finance Reconciliation",
      version: "1.2.0",
      purpose: "Rekonsiliasi transaksi",
      riskLevel: "MEDIUM",
      capabilityKeys: ["reconciliation"],
      divisionScope: ["FINANCE"],
      availability: "AVAILABLE",
      humanReviewRequired: true,
    };

    render(<AgentWorkforceCard item={item} />);

    expect(screen.getByText("Finance Reconciliation")).toBeInTheDocument();
    expect(screen.getByText("Rekonsiliasi transaksi")).toBeInTheDocument();
    expect(screen.getByText("reconciliation")).toBeInTheDocument();
    expect(screen.getByText("Human review required")).toBeInTheDocument();

    // Verify raw technical terms are absent
    expect(screen.queryByText(/gpt|claude|gemini|deepseek/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/tokens|prompt|temperature/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/kill switch|rollback|suspend/i)).not.toBeInTheDocument();
  });

  // Test 9: No Activate / Release / Kill Switch buttons on card
  it("does not contain control-plane action buttons on agent card", () => {
    const item: BusinessAgentWorkforceItem = {
      agentKey: "finance-agent",
      name: "Finance Agent",
      version: "1.0.0",
      purpose: "Analysis",
      riskLevel: "LOW",
      capabilityKeys: ["reconcile"],
      divisionScope: ["FINANCE"],
      availability: "AVAILABLE",
      humanReviewRequired: true,
    };

    render(<AgentWorkforceCard item={item} />);

    expect(screen.queryByRole("button", { name: /activate/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /release/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /rollback/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /kill switch/i })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /gunakan kapabilitas finance agent via ara/i })).toBeInTheDocument();
  });

  // Test 10: CTA Gunakan via ARA navigates to /workspace/ara
  it("links Gunakan via ARA to /workspace/ara", () => {
    const item: BusinessAgentWorkforceItem = {
      agentKey: "finance-agent",
      name: "Finance Agent",
      version: "1.0.0",
      purpose: "Analysis",
      riskLevel: "LOW",
      capabilityKeys: ["reconcile"],
      divisionScope: ["FINANCE"],
      availability: "AVAILABLE",
      humanReviewRequired: true,
    };

    render(<AgentWorkforceCard item={item} />);
    const araLink = screen.getByRole("link", { name: /gunakan kapabilitas finance agent via ara/i });
    expect(araLink).toHaveAttribute("href", "/workspace/ara");
  });

  // Test 11: Gunakan via ARA triggers custom callback if provided
  it("calls onUseViaAra callback if supplied", () => {
    const handleUse = vi.fn();
    const item: BusinessAgentWorkforceItem = {
      agentKey: "finance-agent",
      name: "Finance Agent",
      version: "1.0.0",
      purpose: "Analysis",
      riskLevel: "LOW",
      capabilityKeys: ["reconcile"],
      divisionScope: ["FINANCE"],
      availability: "AVAILABLE",
      humanReviewRequired: true,
    };

    render(<AgentWorkforceCard item={item} onUseViaAra={handleUse} />);
    const araBtn = screen.getByRole("button", { name: /gunakan kapabilitas finance agent via ara/i });
    fireEvent.click(araBtn);
    expect(handleUse).toHaveBeenCalledWith(item);
  });

  // Test 12: loadScopedRunSummary tallies runs and formats correctly
  it("loads and tallies scoped run summary", async () => {
    vi.spyOn(api, "apiRequest").mockResolvedValueOnce(sampleRuns);

    const summary = await loadScopedRunSummary("ws_finance_holding");
    expect(summary.totalCount).toBe(2);
    expect(summary.succeededCount).toBe(1);
    expect(summary.blockedCount).toBe(1);
    expect(summary.failedCount).toBe(0);
    expect(summary.latestRunAt).toBe("2026-09-23T09:15:30Z");
  });

  // Test 13: Blocked run is not treated as fatal failure or success
  it("renders blocked run as controlled governance state, not fatal crash", () => {
    render(
      <AgentWorkforceActivity
        summary={{
          latestRunAt: "2026-09-23T09:15:30Z",
          succeededCount: 3,
          blockedCount: 2,
          failedCount: 0,
          totalCount: 5,
        }}
      />,
    );

    expect(screen.getByText("Scoped Runs")).toBeInTheDocument();
    expect(screen.getByText("2 (kontrol)")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  // Test 14: Empty run summary renders em-dash —
  it("renders em-dash when no runs are present", () => {
    render(
      <AgentWorkforceActivity
        summary={{
          latestRunAt: null,
          succeededCount: 0,
          blockedCount: 0,
          failedCount: 0,
          totalCount: 0,
        }}
      />,
    );

    const dashes = screen.getAllByText("—");
    expect(dashes.length).toBeGreaterThanOrEqual(3);
  });

  // Test 15: canActorAccessGenesis returns true only for authorized roles
  it("authorizes GENESIS access for Director and IT Lead, but not standard member", () => {
    expect(canActorAccessGenesis(["EXECUTIVE"])).toBe(true);
    expect(canActorAccessGenesis(["IT_ADMIN"])).toBe(true);
    expect(canActorAccessGenesis(["QA_ASSURANCE"])).toBe(true);
    expect(canActorAccessGenesis(["FINANCE_STAFF"])).toBe(false);
    expect(canActorAccessGenesis(["MEMBER"])).toBe(false);
  });

  // Test 16: Authority boundary shows GENESIS link only to authorized actor
  it("renders GENESIS control plane link only for authorized roles", () => {
    // Non-authorized user
    const { unmount } = render(<AgentWorkforceAuthority actorRoles={["MEMBER"]} />);
    expect(screen.queryByText(/detail teknis → genesis/i)).not.toBeInTheDocument();
    unmount();

    // Authorized Director
    render(<AgentWorkforceAuthority actorRoles={["EXECUTIVE"]} />);
    expect(screen.getByText(/detail teknis → genesis/i)).toBeInTheDocument();
  });

  // Test 17: AgentWorkforceSummary displays 4 status cards
  it("renders AgentWorkforceSummary with 4 status cards", () => {
    render(<AgentWorkforceSummary />);
    expect(screen.getByText("Registry Scope")).toBeInTheDocument();
    expect(screen.getByText("Workspace aktif")).toBeInTheDocument();
    expect(screen.getByText("Availability")).toBeInTheDocument();
    expect(screen.getByText("Backend verified")).toBeInTheDocument();
    expect(screen.getByText("Recent Activity")).toBeInTheDocument();
    expect(screen.getByText("Scoped runs")).toBeInTheDocument();
    expect(screen.getByText("Human Gate")).toBeInTheDocument();
    expect(screen.getByText("Tetap wajib")).toBeInTheDocument();
  });

  // Test 18: AgentWorkforceBanner renders with deep link to ARA
  it("renders AgentWorkforceBanner with link to /workspace/ara", () => {
    render(<AgentWorkforceBanner />);
    expect(screen.getByText("BUSINESS-FACING WORKFORCE")).toBeInTheDocument();
    const link = screen.getByRole("link", { name: /buka ara untuk bekerja dengan agent/i });
    expect(link).toHaveAttribute("href", "/workspace/ara");
  });

  // Test 19: Full AgentWorkforce component loads and renders agents and activity
  it("renders full AgentWorkforce component with loaded data", async () => {
    vi.spyOn(api, "apiRequest").mockImplementation(async (path: string) => {
      if (path.includes("/active-agents")) return sampleGenesisAgents;
      if (path.includes("/runs")) return sampleRuns;
      return [];
    });

    render(
      <AgentWorkforce
        actor={sampleActor}
        activeWorkspace={sampleWorkspaceIdentity}
      />,
    );

    // Initial loading
    expect(screen.getByText(/memuat agent workforce/i)).toBeInTheDocument();

    // Wait for loaded items
    await waitFor(() => {
      expect(screen.getByText("Finance Reconciliation")).toBeInTheDocument();
      expect(screen.getByText("Budget & Cashflow")).toBeInTheDocument();
    });

    expect(screen.getByText("AI bekerja, manusia berwenang")).toBeInTheDocument();
  });

  // Test 20: AgentWorkforcePage shows NEEDS_INFO when multi-workspace is unselected
  it("renders NEEDS_INFO state when workspace resolution is required", async () => {
    vi.spyOn(api, "apiRequest").mockImplementation(async (path: string) => {
      if (path.includes("whoami")) return sampleDirectorActor;
      if (path.includes("workspaces")) return sampleWorkspaces;
      return [];
    });

    render(<AgentWorkforcePage />);

    await waitFor(() => {
      expect(screen.getByText("Workspace Aktif Belum Dipilih")).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /kembali ke pemilih workspace/i })).toHaveAttribute(
        "href",
        "/workspace",
      );
    });
  });

  // Test 21: Workspace navigation AI group points to /workspace/agents
  it("projects Agent Workforce navigation href to /workspace/agents for business workspaces", () => {
    const navItems = projectWorkspaceNavigation(sampleWorkspaceIdentity, sampleActor);
    const agentItem = navItems.find((item) => item.key === "agents");
    expect(agentItem).toBeDefined();
    expect(agentItem?.href).toBeNull();
    expect(agentItem?.group).toBe("AI");
  });

  // Test 22: AgentWorkforceList handles standalone states
  it("renders AgentWorkforceList in loading, error, and empty states", () => {
    const { rerender } = render(
      <AgentWorkforceList
        workspaceName="Finance"
        items={[]}
        status="LOADING"
      />,
    );
    expect(screen.getByText("Memuat Agent Workforce…")).toBeInTheDocument();

    rerender(
      <AgentWorkforceList
        workspaceName="Finance"
        items={[]}
        status="ERROR"
        errorMessage="Koneksi terputus"
      />,
    );
    expect(screen.getByText("Koneksi terputus")).toBeInTheDocument();

    rerender(
      <AgentWorkforceList
        workspaceName="Finance"
        items={[]}
        status="EMPTY"
      />,
    );
    expect(screen.getByText("Belum Ada Capability AI")).toBeInTheDocument();
  });

  // Test 23: Timestamp formatter
  it("formats timestamp safely", () => {
    expect(formatRunTimestamp(null)).toBe("—");
    expect(formatRunTimestamp("invalid-date")).toBe("—");
    const formatted = formatRunTimestamp("2026-09-23T10:15:00Z");
    expect(formatted).not.toBe("—");
    expect(typeof formatted).toBe("string");
  });
});
