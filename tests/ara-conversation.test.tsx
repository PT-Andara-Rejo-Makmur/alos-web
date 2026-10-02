import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AraConversation } from "@/features/ara/ara-conversation";
import { araApi } from "@/features/ara/api";
import { ApiError } from "@/lib/api";
import type { AraAuthorityProjection, AraMessageProjection, AraResponseProjection, AraThreadProjection } from "@/lib/contracts";

const authority: AraAuthorityProjection = { tenant_id: "tenant_test", organization_id: "org_test", workspace_id: "workspace_test", actor_id: "actor_test", status: "ACTIVE", maximum_data_classification: "INTERNAL", scope_refs: ["scope.test"], allowed_tool_ids: ["sales.lead.list"], allowed_capability_ids: ["business.question_answering"], execution_budget: {max_tokens: 12000}, runtime_mode: "DETERMINISTIC_TEST", production_provider_connected: false };
const thread: AraThreadProjection = { tenant_id: "tenant_test", organization_id: "org_test", workspace_id: "workspace_test", actor_id: "actor_test", thread_id: "thread_test", title: "Percakapan saya", status: "ACTIVE", created_at: "2026-10-02T00:00:00Z", updated_at: "2026-10-02T00:00:00Z" };
const message = (kind: AraResponseProjection["response_type"]): AraMessageProjection => ({ message_id: "message_test", thread_id: thread.thread_id, role: "ASSISTANT", content: "Data canonical", run_id: "run_test", correlation_id: "corr_test", created_at: thread.created_at,
  response: { response_type: kind, answer: "Data canonical", sources: [], failed_sources: [], limitations: [] } });

describe("ARA conversation", () => {
  beforeEach(() => { vi.spyOn(araApi, "threads").mockResolvedValue([thread]); vi.spyOn(araApi, "messages").mockResolvedValue([]); });
  afterEach(() => { cleanup(); vi.restoreAllMocks(); });

  it.each([["ANSWER", "Jawaban"], ["DENIED", "Kewenangan ditolak"], ["NEEDS_INFO", "Perlu informasi"], ["NEEDS_REVIEW", "Perlu tinjauan manusia"], ["FAILED", "Gagal"]] as const)("renders %s distinctly and restores persisted history", async (kind, label) => {
    vi.mocked(araApi.messages).mockResolvedValue([message(kind)]);
    const { unmount } = render(<AraConversation authority={authority} workspaceName="Sales" />);
    expect(await screen.findByText(label, { selector: "strong" })).toBeInTheDocument();
    unmount(); render(<AraConversation authority={authority} workspaceName="Sales" />);
    expect(await screen.findByText(label, { selector: "strong" })).toBeInTheDocument();
    expect(screen.getByText("Data canonical")).toBeInTheDocument();
  });

  it("creates a thread and sends only the minimal request", async () => {
    vi.mocked(araApi.threads).mockResolvedValue([]);
    vi.spyOn(araApi, "create").mockResolvedValue(thread);
    const send = vi.spyOn(araApi, "send").mockResolvedValue({ thread_id: thread.thread_id, run_id: "run_test", correlation_id: "corr_test", status: "COMPLETED", runtime_mode: "DETERMINISTIC_TEST", created_at: thread.created_at, response: message("ANSWER").response });
    render(<AraConversation authority={authority} workspaceName="Sales" />);
    await waitFor(() => expect(screen.getByRole("textbox")).toBeEnabled());
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "Tampilkan lead Sales" } });
    fireEvent.click(screen.getByRole("button", { name: "Kirim pesan" }));
    await waitFor(() => expect(send).toHaveBeenCalledWith("thread_test", {message: "Tampilkan lead Sales"}));
    expect(await screen.findByRole("button", { name: /Percakapan saya/ })).toBeInTheDocument();
  });

  it("shows actual loading without streaming and an honest unavailable error", async () => {
    let reject!: (reason: unknown) => void;
    vi.spyOn(araApi, "send").mockImplementation(() => new Promise((_, fail) => { reject = fail; }));
    render(<AraConversation authority={authority} workspaceName="Sales" />);
    await waitFor(() => expect(screen.getByRole("textbox")).toBeEnabled());
    fireEvent.change(screen.getByRole("textbox"), {target: {value: "Lead Sales"}});
    fireEvent.click(screen.getByRole("button", {name: "Kirim pesan"}));
    expect(await screen.findByRole("status")).toHaveTextContent("Membaca data dan memeriksa sumber");
    reject(new ApiError(503, "unavailable", "corr_test"));
    expect(await screen.findByRole("alert")).toHaveTextContent("Layanan ARA belum tersedia");
    expect(screen.queryByText("Data canonical")).not.toBeInTheDocument();
  });

  it("displays source lineage without model-generated links", async () => {
    const sourced = message("ANSWER");
    const response = sourced.response!;
    vi.mocked(araApi.messages).mockResolvedValue([{...sourced, response: {...response, sources: [{tool_call_id: "toolcall_test", tool_id: "sales.lead.list", domain: "sales", freshness: "CURRENT", source_ref: "source_test", evidence_ref: {evidence_id: "evidence_test", source_id: "source_test", uri: "urn:alos:test", captured_at: thread.created_at, content_hash: `sha256:${"a".repeat(64)}`}}]}}]);
    render(<AraConversation authority={authority} workspaceName="Sales" />);
    expect(await screen.findByText("Sumber dan bukti (1)")).toBeInTheDocument();
    expect(screen.getByText("Bukti: evidence_test")).toBeInTheDocument();
    expect(screen.getByText(`sha256:${"a".repeat(64)}`)).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("clears old history after workspace remount", async () => {
    vi.mocked(araApi.messages).mockResolvedValue([message("ANSWER")]);
    const view = render(<AraConversation key="workspace_test" authority={authority} workspaceName="Sales" />);
    expect(await screen.findByText("Data canonical")).toBeInTheDocument();
    vi.mocked(araApi.threads).mockResolvedValue([]);
    view.rerender(<AraConversation key="workspace_other" authority={{...authority, workspace_id: "workspace_other"}} workspaceName="Finance" />);
    await waitFor(() => expect(screen.queryByText("Data canonical")).not.toBeInTheDocument());
    expect(await screen.findByText("Ruang kerja aktif: Finance")).toBeInTheDocument();
  });

  it("requests cancellation using the actual persisted run identity", async () => {
    let finish!: () => void;
    vi.spyOn(araApi, "send").mockImplementation(() => new Promise(resolve => {
      finish = () => resolve({ thread_id: thread.thread_id, run_id: "run_test", correlation_id: "corr_test", status: "CANCELLED", runtime_mode: "DETERMINISTIC_TEST", created_at: thread.created_at });
    }));
    const cancel = vi.spyOn(araApi, "cancel").mockResolvedValue({ thread_id: thread.thread_id, run_id: "run_test", correlation_id: "corr_test", status: "CANCEL_REQUESTED", runtime_mode: "DETERMINISTIC_TEST", created_at: thread.created_at });
    render(<AraConversation authority={authority} workspaceName="Sales" />);
    await waitFor(() => expect(screen.getByRole("textbox")).toBeEnabled());
    vi.mocked(araApi.messages).mockResolvedValue([{...message("ANSWER"), role: "USER", response: undefined}]);
    fireEvent.change(screen.getByRole("textbox"), {target: {value: "Lead Sales"}});
    fireEvent.click(screen.getByRole("button", {name: "Kirim pesan"}));
    fireEvent.click(await screen.findByRole("button", {name: "Batalkan run"}));
    await waitFor(() => expect(cancel).toHaveBeenCalledWith("thread_test", "run_test"));
    expect(await screen.findByRole("alert")).toHaveTextContent("Pembatalan diminta");
    finish();
    await waitFor(() => expect(screen.queryByRole("button", {name: "Batalkan run"})).not.toBeInTheDocument());
  });
});
