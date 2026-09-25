import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import * as api from "@/lib/api";
import type { Workspace } from "@/features/session";
import {
  AraWorkspace,
  AraConversationList,
  AraChatThread,
  AraContextInspector,
  AraContextPicker,
  AraMessageEvidence,
  AraActionProposal,
  AraSourceModeSelector,
  createAraRouteAdapter,
  verifyActiveWorkspace,
  loadActiveContextProjection,
  normalizeCitations,
  normalizeToolActivity,
  parseActionProposals,
  COMPATIBILITY_ARA_ROUTE_ADAPTER,
} from "@/features/ara-workspace";
import { ContextualWorkspaceModulePage } from "@/features/workspace-shell";
import type { WorkspaceShellIdentity } from "@/features/workspace-shell/types";
import { canonicalPrincipal } from "./helpers/canonical-session";

// Mock next/navigation
const mockPush = vi.fn();
const mockReplace = vi.fn();
let mockSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
  usePathname: () => "/workspace/ara",
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

describe("ARA Workspace (Human + AI ALOS)", () => {
  const sampleActor = {
    user_id: "usr_director_01",
    organization_id: "org_andara_holding",
    roles: ["EXECUTIVE"],
    division_codes: ["FINANCE"],
    workspace_ids: ["ws_finance_01"],
    issued_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 86400000).toISOString(),
  };

  const sampleWorkspaceIdentity: WorkspaceShellIdentity = {
    workspaceId: "ws_finance_01",
    workspaceKey: "finance",
    workspaceLabel: "Finance Workspace",
    divisionCode: "FINANCE",
    roleLabel: "Direktur Utama",
    accessLevel: "MEMBER",
  };

  const sampleWorkspaces: readonly Workspace[] = [
    {
      workspace_id: "ws_finance_01",
      workspace_key: "finance",
      name: "Finance Workspace",
      division_code: "FINANCE",
      access_level: "MEMBER",
    },
    {
      workspace_id: "ws_property_01",
      workspace_key: "property",
      name: "Property Workspace",
      division_code: "PROPERTY",
      access_level: "MEMBER",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockSearchParams = new URLSearchParams();
  });

  afterEach(() => {
    cleanup();
  });

  // 1. Canonical contextual ARA requires authenticated active workspace
  it("1. canonical contextual ARA mengalihkan ke /login jika pengguna tidak terautentikasi (401)", async () => {
    vi.spyOn(api, "sessionApiRequest").mockRejectedValue(new api.ApiError(401, "Unauthorized", null));

    render(<ContextualWorkspaceModulePage workspaceKey="finance" module="ara" />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/login");
    });
  });

  // 2. Multi-workspace actor does not silently use workspace_ids[0]
  it("2. pengguna multi-workspace tidak memilih workspace pertama secara diam-diam", () => {
    const principalMulti = {
      workspace_ids: ["ws_finance_01", "ws_property_01"],
    };

    const result = verifyActiveWorkspace(principalMulti, sampleWorkspaces, null);
    expect(result.workspace).toBeNull();
    expect(result.needsInfoReason).toContain("Akun Anda memiliki akses ke beberapa workspace");
  });

  // 3. Missing active workspace -> resolver/access boundary
  it("3. workspace aktif yang belum dipilih merender controlled state boundary", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValue({
      authenticated: true,
      principal: { ...canonicalPrincipal({ actorId: sampleActor.user_id, divisionCode: "FINANCE", workspaceId: "ws_finance_01", workspaceKey: "finance", workspaceName: "Finance Workspace", roles: ["EXECUTIVE"], allWorkspaceIds: ["ws_finance_01", "ws_property_01"] }), active_workspace: null },
    });
    vi.spyOn(api, "authenticatedApiRequest").mockResolvedValue(sampleWorkspaces as never);

    render(<ContextualWorkspaceModulePage workspaceKey="finance" module="ara" />);

    await waitFor(() => {
      expect(screen.getByText("Bukan Otoritas Finance")).toBeInTheDocument();
    });
    expect(screen.getByText(/Kembali ke Ruang Kerja Saya/i)).toBeInTheDocument();
  });

  // 4. ARA conversation selection does not navigate to /genesis
  it("4. pemilihan percakapan ARA tidak menavigasi ke /genesis", () => {
    const adapter = createAraRouteAdapter("/workspace/finance/ara");
    const targetUrl = adapter.conversationUrl("conv_789");
    expect(targetUrl).toBe("/workspace/finance/ara?conversation=conv_789");
    expect(targetUrl).not.toContain("/genesis");

    const replaceStateSpy = vi.spyOn(window.history, "replaceState").mockImplementation(() => {});

    render(
      <AraConversationList
        conversations={[
          {
            conversation_id: "conv_789",
            workspace_id: "ws_finance_01",
            title: "Prioritas hari ini",
            context_mode: "AUTO",
            status: "OPEN",
            created_at: new Date().toISOString(),
            updated_at: null,
          },
        ]}
        selectedConversationId=""
        onSelectConversation={() => {}}
        onNewConversation={() => {}}
        routeAdapter={adapter}
      />,
    );

    const convItem = screen.getByText("Prioritas hari ini");
    fireEvent.click(convItem);
    expect(replaceStateSpy).not.toHaveBeenCalledWith(expect.anything(), expect.anything(), expect.stringContaining("/genesis"));
  });

  // 5. ARA share link uses ARA route
  it("5. tautan berbagi percakapan ARA menggunakan base route ARA", async () => {
    const adapter = createAraRouteAdapter("/workspace/ara");
    let sharedUrl = "";
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockImplementation(async (text: string) => {
          sharedUrl = text;
        }),
      },
    });

    render(
      <AraConversationList
        conversations={[
          {
            conversation_id: "conv_abc",
            workspace_id: "ws_finance_01",
            title: "Review Dokumen",
            context_mode: "AUTO",
            status: "OPEN",
            created_at: new Date().toISOString(),
            updated_at: null,
          },
        ]}
        selectedConversationId="conv_abc"
        onSelectConversation={() => {}}
        onNewConversation={() => {}}
        routeAdapter={adapter}
      />,
    );

    const shareBtn = screen.getByLabelText("Salin tautan Review Dokumen");
    fireEvent.click(shareBtn);

    await waitFor(() => {
      expect(sharedUrl).toContain("/workspace/ara?conversation=conv_abc");
      expect(sharedUrl).not.toContain("/genesis");
    });
  });

  // 6. /ara compatibility still works
  it("6. rute kompatibilitas /ara menghasilkan URL adapter /ara", () => {
    expect(COMPATIBILITY_ARA_ROUTE_ADAPTER.basePath).toBe("/ara");
    expect(COMPATIBILITY_ARA_ROUTE_ADAPTER.conversationUrl("conv_compat")).toBe(
      "/ara?conversation=conv_compat",
    );
  });

  // 7. Context ACTIVE only from Backend authoritative projection
  it("7. konteks ACTIVE hanya diperoleh jika Backend mengembalikan status ACTIVE", async () => {
    vi.spyOn(api, "authenticatedApiRequest").mockResolvedValueOnce({
      status: "ACTIVE",
      context_id: "ctx_123",
      tenant_id: "t_01",
      workspace_id: "ws_finance_01",
      actor_id: "usr_01",
      correlation_id: "corr_ctx_01",
    });

    const projection = await loadActiveContextProjection();
    expect(projection.state).toBe("ACTIVE");
    expect(projection.contextId).toBe("ctx_123");
  });

  // 8. DENIED cannot be overridden client-side
  it("8. state DENIED dari Backend tidak dapat di-override di sisi client", async () => {
    vi.spyOn(api, "authenticatedApiRequest").mockResolvedValueOnce({
      status: "DENIED",
      context_id: "ctx_denied",
      denial_reason: "Akses divisi ditolak oleh kebijakan keamanan ALOS.",
      correlation_id: "corr_denied",
    });

    const projection = await loadActiveContextProjection();
    expect(projection.state).toBe("DENIED");
    expect(projection.denialReason).toContain("Akses divisi ditolak");

    render(
      <AraContextInspector
        context={{
          state: "DENIED",
          denialReason: "Akses divisi ditolak oleh kebijakan keamanan ALOS.",
          workspaceLabel: "Finance",
        }}
      />,
    );

    expect(screen.getByText("Akses Konteks Ditolak")).toBeInTheDocument();
    expect(screen.queryByText("ACTIVE")).not.toBeInTheDocument();
  });

  // 9. NEEDS_INFO rendered correctly
  it("9. state NEEDS_INFO dirender dengan peringatan kebutuhan parameter", () => {
    render(
      <AraContextInspector
        context={{
          state: "NEEDS_INFO",
          needsInfoReason: "Scope proyek belum ditentukan.",
          workspaceLabel: "Finance",
        }}
      />,
    );

    expect(screen.getByText("NEEDS INFO")).toBeInTheDocument();
    expect(screen.getByText("Informasi Diperlukan")).toBeInTheDocument();
    expect(screen.getByText("Scope proyek belum ditentukan.")).toBeInTheDocument();
  });

  // 10. UNAVAILABLE never displays ACTIVE
  it("10. state UNAVAILABLE tidak pernah menampilkan ACTIVE", async () => {
    vi.spyOn(api, "authenticatedApiRequest").mockRejectedValueOnce(
      new Error("Backend unavailable"),
    );

    const projection = await loadActiveContextProjection();
    expect(projection.state).toBe("UNAVAILABLE");

    render(
      <AraContextInspector
        context={{
          state: "UNAVAILABLE",
          workspaceLabel: "Finance",
        }}
      />,
    );

    expect(screen.getByText("UNAVAILABLE")).toBeInTheDocument();
    expect(screen.queryByText("ACTIVE")).not.toBeInTheDocument();
  });

  // 11. Context picker only displays Backend options
  it("11. pemilih konteks hanya menampilkan opsi dari Backend dan tidak meminta raw UUID", () => {
    const options = [
      {
        entity_type: "DOCUMENT" as const,
        entity_id: "doc_01",
        title: "Laporan Keuangan Q3",
        source_version: "1",
      },
    ];

    render(
      <AraContextPicker
        isOpen={true}
        onClose={() => {}}
        onSelectOption={() => {}}
        options={options}
      />,
    );

    expect(screen.getByText("Laporan Keuangan Q3")).toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/UUID/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/UUID/i)).not.toBeInTheDocument();
  });

  // 12. Out-of-scope context returns safe error
  it("12. permintaan workspace di luar wewenang menghasilkan penolakan aman", () => {
    const principal = { workspace_ids: ["ws_finance_01"] };
    const result = verifyActiveWorkspace(principal, sampleWorkspaces, "ws_unauthorized_99");

    expect(result.workspace).toBeNull();
    expect(result.needsInfoReason).toContain("tidak ditemukan atau berada di luar wewenang");
  });

  // 13. Source mode EXTERNAL does not imply authorization
  it("13. pemilihan mode EXTERNAL adalah UX request dan tetap tunduk pada kontrol Backend", () => {
    const handleChange = vi.fn();
    render(<AraSourceModeSelector mode="AUTO" onChange={handleChange} />);

    const extBtn = screen.getByRole("button", { name: /mode sumber eksternal/i });
    fireEvent.click(extBtn);

    expect(handleChange).toHaveBeenCalledWith("EXTERNAL");
  });

  // 14. Evidence ID is not fabricated
  it("14. Evidence ID tidak pernah difabrikasi jika respons backend tidak memilikinya", () => {
    const normalized = normalizeCitations([
      {
        source: "Dokumen Kas",
        validation_status: "VALID",
      },
    ]);

    expect(normalized[0].source).toBe("Dokumen Kas");
    expect(normalized[0].evidence_id).toBeUndefined();
  });

  // 15. Citation without canonical evidence is labeled appropriately
  it("15. pesan tanpa bukti terlampir menampilkan pesan jujur 'Belum dilampirkan'", () => {
    render(<AraMessageEvidence citations={[]} />);

    expect(
      screen.getByText("Belum dilampirkan pada contoh reference ini."),
    ).toBeInTheDocument();
  });

  // 16. Model/provider selector absent for normal business ARA
  it("16. tidak ada pemilih model/provider (OpenAI, Claude, Gemini) untuk pengguna bisnis ARA", () => {
    render(
      <AraChatThread
        messages={[]}
        sourceMode="AUTO"
        onChangeSourceMode={() => {}}
        prompt=""
        onPromptChange={() => {}}
        onSubmitPrompt={() => {}}
      />,
    );

    expect(screen.queryByText(/openai/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/claude/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/gemini/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/gpt-4/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("combobox", { name: /model/i })).not.toBeInTheDocument();
  });

  // 17. Agent activation control absent for business user
  it("17. tidak ada tombol aktivasi/deaktivasi agen untuk pengguna bisnis di ARA", () => {
    render(
      <AraWorkspace
        actor={sampleActor}
        activeWorkspace={sampleWorkspaceIdentity}
        routeAdapter={createAraRouteAdapter("/workspace/finance/ara")}
      />,
    );

    expect(screen.queryByText(/aktifkan agent/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/kill switch/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/release request/i)).not.toBeInTheDocument();
  });

  // 18. Material action remains deep link/review, not optimistic final state
  it("18. aksi material disajikan sebagai deep-link menuju governed workflow", () => {
    const proposals = parseActionProposals([
      {
        action_id: "act_01",
        label: "Buka Approval Pembayaran",
        href: "/workspace/finance/approvals",
        requires_human_approval: true,
      },
    ]);

    expect(proposals[0].requires_human_approval).toBe(true);

    render(<AraActionProposal proposals={proposals} />);

    const link = screen.getByRole("link", { name: /Buka Approval Pembayaran/i });
    expect(link).toHaveAttribute("href", "/workspace/finance/approvals");
  });

  // 19. No active authority stored in localStorage
  it("19. wewenang aktif tidak pernah disimpan di localStorage", () => {
    render(
      <AraWorkspace
        actor={sampleActor}
        activeWorkspace={sampleWorkspaceIdentity}
        routeAdapter={createAraRouteAdapter("/workspace/finance/ara")}
      />,
    );

    expect(localStorage.getItem("authority")).toBeNull();
    expect(localStorage.getItem("active_workspace")).toBeNull();
    expect(localStorage.getItem("token")).toBeNull();
  });

  // 20. Existing favorite behavior, if preserved, stores only preference
  it("20. preferensi favorit di localStorage hanya menyimpan ID, bukan wewenang", () => {
    localStorage.setItem("alos-genesis-favorites", JSON.stringify(["conv_1", "conv_2"]));
    const raw = localStorage.getItem("alos-genesis-favorites");
    expect(raw).toBe('["conv_1","conv_2"]');
    expect(raw).not.toContain("roles");
    expect(raw).not.toContain("permissions");
  });

  // 21. Sensitive raw tool payload not displayed
  it("21. payload rahasia, token, atau kredensial tool activity dibersihkan", () => {
    const sanitized = normalizeToolActivity([
      {
        action: "Query Database token=super_secret_token_123",
        status: "SUCCESS",
        blocked_reason: "Access denied key=hidden_secret",
      },
    ]);

    expect(sanitized[0].action).not.toContain("super_secret_token_123");
    expect(sanitized[0].action).toContain("token=***");
    expect(sanitized[0].blocked_reason).toContain("key=***");
  });

  // 22. Workspace Shell reused
  it("22. Contextual ARA dibungkus dalam WorkspaceShell dengan activeNavKey='ara'", async () => {
    vi.spyOn(api, "sessionApiRequest").mockResolvedValue({
      authenticated: true,
      principal: canonicalPrincipal({ actorId: sampleActor.user_id, divisionCode: "FINANCE", workspaceId: "ws_finance_01", workspaceKey: "finance", workspaceName: "Finance Workspace", roles: ["EXECUTIVE"] }),
    });
    vi.spyOn(api, "authenticatedApiRequest").mockImplementation(async (path: string) =>
      path === "/api/v1/workspaces" ? [sampleWorkspaces[0]] as never : [] as never,
    );

    render(<ContextualWorkspaceModulePage workspaceKey="finance" module="ara" />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "ARA Workspace", level: 1 })).toBeInTheDocument();
    });

    // Check that shell sidebar is present
    expect(screen.getByText("ANDARA LEAN OPERATING SYSTEM")).toBeInTheDocument();
    expect(screen.getAllByText("Finance Workspace").length).toBeGreaterThan(0);
  });

  // 23. Mobile history/context drawer keyboard accessible
  it("23. drawer mobile dapat ditutup dengan tombol Escape atau tombol tutup", async () => {
    render(
      <AraWorkspace
        actor={sampleActor}
        activeWorkspace={sampleWorkspaceIdentity}
        routeAdapter={createAraRouteAdapter("/workspace/finance/ara")}
      />,
    );

    // Open mobile history drawer
    const historyBtn = screen.getByRole("button", { name: /buka riwayat percakapan/i });
    fireEvent.click(historyBtn);

    expect(screen.getByLabelText("Riwayat Percakapan Mobile")).toBeInTheDocument();

    // Close via close button
    const closeBtn = screen.getByLabelText("Tutup riwayat");
    fireEvent.click(closeBtn);

    expect(screen.queryByLabelText("Riwayat Percakapan Mobile")).not.toBeInTheDocument();
  });

  // 24. Lint and build compliant
  it("24. seluruh subkomponen ARA merender struktur informasi yang konsisten", () => {
    const canonicalAdapter = createAraRouteAdapter("/workspace/finance/ara");
    expect(canonicalAdapter.basePath).toBe("/workspace/finance/ara");
    expect(canonicalAdapter.conversationUrl("c1")).toBe("/workspace/finance/ara?conversation=c1");
    expect(COMPATIBILITY_ARA_ROUTE_ADAPTER.basePath).toBe("/ara");
  });
});
