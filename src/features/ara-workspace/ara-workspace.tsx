"use client";

import { useEffect, useState } from "react";
import { History, Layers, X } from "lucide-react";

import { apiRequest, withQuery } from "@/lib/api";
import { normalizeGenesisError } from "@/features/mvp1/lib/genesis-workspace";

import { AraChatThread } from "./ara-chat-thread";
import { AraContextInspector } from "./ara-context-inspector";
import { AraContextPicker } from "./ara-context-picker";
import { AraConversationList } from "./ara-conversation-list";
import { DEFAULT_ARA_ROUTE_ADAPTER } from "./ara-route-adapter";
import {
  loadActiveContextProjection,
  normalizeCitations,
  parseActionProposals,
  parseAssistantMessageSections,
} from "./ara-workspace-projection";
import type {
  AraActiveContext,
  AraContextOption,
  AraConversation,
  AraMessage,
  AraSourceMode,
  AraWorkspaceProps,
} from "./types";
import styles from "./ara-workspace.module.css";

type MobileDrawerType = "NONE" | "HISTORY" | "CONTEXT";

export function AraWorkspace({
  activeWorkspace,
  routeAdapter = DEFAULT_ARA_ROUTE_ADAPTER,
  initialConversationId,
  initialQuery = "",
}: AraWorkspaceProps) {
  const [conversations, setConversations] = useState<readonly AraConversation[]>([]);
  const [conversationId, setConversationId] = useState<string>(initialConversationId || "");
  const [messages, setMessages] = useState<readonly AraMessage[]>([]);
  const [sourceMode, setSourceMode] = useState<AraSourceMode>("AUTO");
  const [prompt, setPrompt] = useState<string>(initialQuery);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isCreatingConv, setIsCreatingConv] = useState<boolean>(false);
  const [mobileDrawer, setMobileDrawer] = useState<MobileDrawerType>("NONE");
  const [isPickerOpen, setIsPickerOpen] = useState<boolean>(false);
  const [contextOptions, setContextOptions] = useState<readonly AraContextOption[]>([]);
  const [isLoadingContextOptions, setIsLoadingContextOptions] = useState<boolean>(false);

  const [activeContext, setActiveContext] = useState<AraActiveContext>({
    state: "LOADING",
    workspaceId: activeWorkspace.workspaceId,
    workspaceLabel: activeWorkspace.workspaceLabel,
    divisionCode: activeWorkspace.divisionCode,
    dataClassification: "INTERNAL",
  });

  // 1. Load active context projection from Backend
  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    async function fetchContext() {
      try {
        const proj = await loadActiveContextProjection(controller.signal);
        if (!cancelled) {
          setActiveContext({
            ...proj,
            workspaceId: activeWorkspace.workspaceId,
            workspaceLabel: activeWorkspace.workspaceLabel,
            divisionCode: activeWorkspace.divisionCode,
          });
        }
      } catch {
        if (!cancelled) {
          setActiveContext((prev) => ({ ...prev, state: "UNAVAILABLE" }));
        }
      }
    }

    void fetchContext();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [activeWorkspace]);

  // 2. Load conversations for verified active workspace
  useEffect(() => {
    let cancelled = false;
    if (!activeWorkspace.workspaceId) return;

    apiRequest<AraConversation[]>(
      withQuery("/api/v1/genesis/conversations", {
        workspace_id: activeWorkspace.workspaceId,
      }),
    )
      .then((items) => {
        if (!cancelled) {
          setConversations(items || []);
          const targetId = initialConversationId || items?.[0]?.conversation_id || "";
          if (targetId) {
            setConversationId(targetId);
          }
        }
      })
      .catch(() => {
        if (!cancelled) {
          setConversations([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [activeWorkspace.workspaceId, initialConversationId]);

  // 3. Load messages for selected conversation
  useEffect(() => {
    let cancelled = false;
    if (!conversationId) {
      return;
    }

    apiRequest<Array<Record<string, unknown>>>(
      `/api/v1/genesis/conversations/${encodeURIComponent(conversationId)}/messages`,
    )
      .then((rawMessages) => {
        if (!cancelled) {
          const parsed: AraMessage[] = (rawMessages || []).map((raw) => {
            const content = String(raw.content || "");
            const actorKind = (raw.actor_kind === "HUMAN" ? "HUMAN" : "SYSTEM") as "HUMAN" | "SYSTEM";
            const citations = normalizeCitations(
              (raw.citations as Array<Record<string, unknown>>) || [],
            );
            const actionProposals = parseActionProposals(
              (raw.actions as Array<Record<string, unknown>>) || [],
            );
            const { summary, limitations } = parseAssistantMessageSections(content);

            return {
              message_id: String(raw.message_id || Math.random()),
              actor_kind: actorKind,
              content,
              status: String(raw.status || "COMPLETED"),
              summary: actorKind === "SYSTEM" ? summary : undefined,
              limitations: actorKind === "SYSTEM" ? limitations : undefined,
              citations,
              action_proposals: actionProposals,
              created_at: String(raw.created_at || new Date().toISOString()),
            };
          });
          setMessages(parsed);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setMessages([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [conversationId]);

  // 4. Select conversation handler
  function handleSelectConversation(nextId: string) {
    if (nextId === conversationId) return;
    setConversationId(nextId);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", routeAdapter.conversationUrl(nextId));
    }
  }

  // 5. Create new conversation
  async function handleNewConversation() {
    if (!activeWorkspace.workspaceId || isCreatingConv) return;
    setIsCreatingConv(true);
    try {
      const created = await apiRequest<AraConversation>("/api/v1/genesis/conversations", {
        method: "POST",
        body: JSON.stringify({
          workspace_id: activeWorkspace.workspaceId,
          title: "Percakapan baru",
          context_mode: sourceMode === "GABUNGAN" ? "INTERNAL_AND_EXTERNAL" : sourceMode,
        }),
      });
      setConversations((prev) => [created, ...prev]);
      setConversationId(created.conversation_id);
      setMessages([]);
      if (typeof window !== "undefined") {
        window.history.replaceState(
          null,
          "",
          routeAdapter.conversationUrl(created.conversation_id),
        );
      }
    } catch (err) {
      // Safe fallback
      normalizeGenesisError(err);
    } finally {
      setIsCreatingConv(false);
    }
  }

  // 6. Delete / Archive conversation
  async function handleDeleteConversation(item: AraConversation) {
    try {
      await apiRequest(
        `/api/v1/genesis/conversations/${encodeURIComponent(item.conversation_id)}`,
        { method: "DELETE" },
      );
      const remaining = conversations.filter(
        (c) => c.conversation_id !== item.conversation_id,
      );
      setConversations(remaining);
      if (conversationId === item.conversation_id) {
        const nextId = remaining[0]?.conversation_id || "";
        setConversationId(nextId);
        if (typeof window !== "undefined") {
          if (nextId) {
            window.history.replaceState(null, "", routeAdapter.conversationUrl(nextId));
          } else {
            window.history.replaceState(null, "", routeAdapter.basePath);
          }
        }
      }
    } catch {
      // Best-effort delete
    }
  }

  // 7. Submit prompt to ARA
  async function handleSubmitPrompt() {
    const text = prompt.trim();
    if (!text || isSending || !activeWorkspace.workspaceId) return;

    setIsSending(true);
    try {
      let targetConvId = conversationId;
      // Auto-create conversation if none open
      if (!targetConvId) {
        const created = await apiRequest<AraConversation>("/api/v1/genesis/conversations", {
          method: "POST",
          body: JSON.stringify({
            workspace_id: activeWorkspace.workspaceId,
            title: text.slice(0, 60),
            context_mode: sourceMode === "GABUNGAN" ? "INTERNAL_AND_EXTERNAL" : sourceMode,
          }),
        });
        targetConvId = created.conversation_id;
        setConversationId(targetConvId);
        setConversations((prev) => [created, ...prev]);
        if (typeof window !== "undefined") {
          window.history.replaceState(
            null,
            "",
            routeAdapter.conversationUrl(created.conversation_id),
          );
        }
      }

      // Add optimistic human message
      const humanMessage: AraMessage = {
        message_id: `temp_${Date.now()}`,
        actor_kind: "HUMAN",
        content: text,
        status: "SENDING",
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, humanMessage]);
      setPrompt("");

      // Post turn to Backend
      const result = await apiRequest<{
        human_message?: Record<string, unknown>;
        assistant_message?: Record<string, unknown>;
      }>(
        `/api/v1/genesis/conversations/${encodeURIComponent(targetConvId)}/turns`,
        {
          method: "POST",
          body: JSON.stringify({
            content: text,
            context_mode: sourceMode === "GABUNGAN" ? "INTERNAL_AND_EXTERNAL" : sourceMode,
            attachments: [],
            preferred_agent_key: null, // No provider/model picker for business ARA
          }),
        },
      );

      // Parse returned messages
      if (result.assistant_message) {
        const rawAss = result.assistant_message;
        const assContent = String(rawAss.content || "");
        const citations = normalizeCitations(
          (rawAss.citations as Array<Record<string, unknown>>) || [],
        );
        const actionProposals = parseActionProposals(
          (rawAss.actions as Array<Record<string, unknown>>) || [],
        );
        const { summary, limitations } = parseAssistantMessageSections(assContent);

        const parsedAssistant: AraMessage = {
          message_id: String(rawAss.message_id || Date.now()),
          actor_kind: "SYSTEM",
          content: assContent,
          status: "COMPLETED",
          summary,
          limitations,
          citations,
          action_proposals: actionProposals,
          created_at: String(rawAss.created_at || new Date().toISOString()),
        };

        setMessages((prev) => [
          ...prev.filter((m) => m.message_id !== humanMessage.message_id),
          { ...humanMessage, status: "COMPLETED" },
          parsedAssistant,
        ]);
      } else {
        // Fallback assistant response
        const fallbackAssistant: AraMessage = {
          message_id: `resp_${Date.now()}`,
          actor_kind: "SYSTEM",
          content: "Permintaan Anda telah diterima oleh ALOS Backend.",
          status: "COMPLETED",
          summary: "Permintaan telah diproses sesuai batasan wewenang workspace.",
          limitations: ["Tidak ada klaim final tanpa source dan scope yang sah."],
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, fallbackAssistant]);
      }
    } catch {
      // Safe error response without exposing internal secrets
      const errMessage: AraMessage = {
        message_id: `err_${Date.now()}`,
        actor_kind: "SYSTEM",
        content: "Koneksi ke ALOS Backend mengalami kendala. Silakan coba kembali.",
        status: "FAILED",
        summary: "Koneksi Backend terputus atau wewenang tidak mencukupi.",
        limitations: ["Bukti belum cukup untuk menyimpulkan."],
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errMessage]);
    } finally {
      setIsSending(false);
    }
  }

  // 8. Open Context Picker
  async function handleOpenPicker() {
    setIsPickerOpen(true);
    setIsLoadingContextOptions(true);
    try {
      const options = await apiRequest<AraContextOption[]>(
        withQuery("/api/v1/genesis/context-options", {
          workspace_id: activeWorkspace.workspaceId,
          limit: 30,
        }),
      );
      setContextOptions(Array.isArray(options) ? options : []);
    } catch {
      setContextOptions([]);
    } finally {
      setIsLoadingContextOptions(false);
    }
  }

  // 9. Attach context option
  async function handleSelectContextOption(option: AraContextOption) {
    if (!conversationId) return;
    try {
      await apiRequest(
        `/api/v1/genesis/conversations/${encodeURIComponent(conversationId)}/context`,
        {
          method: "POST",
          body: JSON.stringify({
            entity_type: option.entity_type,
            entity_id: option.entity_id,
          }),
        },
      );
      // Reload context projection
      const proj = await loadActiveContextProjection();
      setActiveContext({
        ...proj,
        workspaceId: activeWorkspace.workspaceId,
        workspaceLabel: activeWorkspace.workspaceLabel,
        divisionCode: activeWorkspace.divisionCode,
      });
    } catch {
      // Ignore attachment failure
    }
  }

  return (
    <div className={styles.workspaceRoot}>
      {/* Header Area */}
      <div className={styles.headerArea}>
        <p className={styles.eyebrow}>ALOS / ARA</p>
        <div className={styles.headingRow}>
          <h1 className={styles.title}>ARA Workspace</h1>
          <p className={styles.subtitle}>
            Human + AI collaboration with verified context, evidence, and human authority.
          </p>
        </div>

        {/* Mobile Buttons Bar */}
        <div className={styles.mobileButtonsBar}>
          <button
            type="button"
            className={styles.mobileDrawerBtn}
            onClick={() => setMobileDrawer("HISTORY")}
            aria-label="Buka riwayat percakapan"
          >
            <History size={16} aria-hidden="true" />
            <span>Riwayat</span>
          </button>

          <button
            type="button"
            className={styles.mobileDrawerBtn}
            onClick={() => setMobileDrawer("CONTEXT")}
            aria-label="Buka context inspector"
          >
            <Layers size={16} aria-hidden="true" />
            <span className={activeContext.state === "ACTIVE" ? styles.mobileContextActive : ""}>
              Context · {activeContext.state}
            </span>
          </button>
        </div>
      </div>

      {/* 3-Column Desktop Layout */}
      <div className={styles.threeColumnLayout}>
        {/* Left: Conversation List */}
        <AraConversationList
          conversations={conversations}
          selectedConversationId={conversationId}
          onSelectConversation={handleSelectConversation}
          onNewConversation={handleNewConversation}
          onDeleteConversation={handleDeleteConversation}
          routeAdapter={routeAdapter}
          isCreating={isCreatingConv}
        />

        {/* Center: Main Thread */}
        <AraChatThread
          messages={messages}
          sourceMode={sourceMode}
          onChangeSourceMode={setSourceMode}
          prompt={prompt}
          onPromptChange={setPrompt}
          onSubmitPrompt={handleSubmitPrompt}
          onSelectQuickPrompt={(q) => {
            setPrompt(q);
            void handleSubmitPrompt();
          }}
          onOpenContextPicker={handleOpenPicker}
          isSending={isSending}
        />

        {/* Right: Context Inspector */}
        <AraContextInspector
          context={activeContext}
          onOpenPicker={handleOpenPicker}
        />
      </div>

      {/* Mobile History Drawer */}
      {mobileDrawer === "HISTORY" && (
        <div
          className={styles.drawerOverlay}
          onClick={() => setMobileDrawer("NONE")}
          role="dialog"
          aria-modal="true"
          aria-label="Riwayat Percakapan Mobile"
        >
          <div className={styles.drawerContent} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className={styles.drawerCloseBtn}
              onClick={() => setMobileDrawer("NONE")}
              aria-label="Tutup riwayat"
            >
              <X size={20} />
            </button>
            <AraConversationList
              conversations={conversations}
              selectedConversationId={conversationId}
              onSelectConversation={handleSelectConversation}
              onNewConversation={handleNewConversation}
              onDeleteConversation={handleDeleteConversation}
              routeAdapter={routeAdapter}
              isCreating={isCreatingConv}
              isMobileDrawer={true}
              onCloseDrawer={() => setMobileDrawer("NONE")}
            />
          </div>
        </div>
      )}

      {/* Mobile Context Drawer */}
      {mobileDrawer === "CONTEXT" && (
        <div
          className={`${styles.drawerOverlay} ${styles.drawerOverlayRight}`}
          onClick={() => setMobileDrawer("NONE")}
          role="dialog"
          aria-modal="true"
          aria-label="Context Inspector Mobile"
        >
          <div className={styles.drawerContent} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className={styles.drawerCloseBtn}
              onClick={() => setMobileDrawer("NONE")}
              aria-label="Tutup inspector"
            >
              <X size={20} />
            </button>
            <AraContextInspector
              context={activeContext}
              onOpenPicker={handleOpenPicker}
              isMobileDrawer={true}
              onCloseDrawer={() => setMobileDrawer("NONE")}
            />
          </div>
        </div>
      )}

      {/* Context Entity Attachment Modal */}
      <AraContextPicker
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelectOption={handleSelectContextOption}
        options={contextOptions}
        isLoading={isLoadingContextOptions}
      />
    </div>
  );
}
