"use client";

import Link from "next/link";
import {
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  GovernanceConfirmationModal,
  type Confirmation,
} from "@/features/mvp1/components/governance-control-ui";
import {
  type AgentRecord,
  type AgentRunResult,
  latestVersion,
} from "@/features/mvp1/lib/agent-registry";
import { apiRequest, withQuery } from "@/lib/api";
import {
  agentDraftPresentation,
  type GenesisAgentDesignResponse,
} from "@/features/mvp1/lib/genesis-agent-designer";
import {
  supportsGenesisUpload,
  type GenesisUploadRecord,
  uploadExtractionLabel,
} from "@/features/mvp1/lib/genesis-uploads";
import {
  canManageDraftAgent,
  canTestActiveAgent,
  contextHref,
  type ContextEntityType,
  type GenesisActiveAgent,
  type GenesisContextOption,
  type GenesisConversation,
  type GenesisConversationContext,
  type GenesisUiError,
  groupConversations,
  normalizeGenesisError,
} from "@/features/mvp1/lib/genesis-workspace";
import {
  type Run,
  type SessionActor,
} from "@/features/mvp1/lib/governance";

type ContextMode = GenesisConversation["context_mode"];
type InspectorTab = "CONTEXT" | "AGENTS" | "ACTIVITY";
type MobilePanel = "NONE" | "HISTORY" | "INSPECTOR";

type Message = {
  message_id: string;
  actor_kind: "HUMAN" | "SYSTEM";
  content: string;
  status: string;
  structured_content: Record<string, unknown>;
  citations: Array<Record<string, unknown>>;
  tool_activity: Array<Record<string, unknown>>;
  created_at: string;
};

type GenesisResponse = {
  answer?: string;
  intent?: string;
  reliability?: string;
  findings?: string[];
  recommendations?: string[];
  limitations?: string[];
  actions?: Array<Record<string, unknown>>;
};

type AgentCandidate = Pick<
  GenesisActiveAgent,
  "agent_key" | "name" | "semantic_version" | "purpose" | "risk_level" | "capability_keys"
>;

type TurnResult = {
  human_message: Message;
  assistant_message: Message;
  candidate_capabilities: string[];
  candidate_agents: AgentCandidate[];
  external_research: { status: string; items: Array<Record<string, unknown>> };
  correlation_id: string;
};

type UploadedDocument = {
  document_id: string;
  title: string;
  status: string;
  version_number: number;
};

const contextTypes: ContextEntityType[] = [
  "DOCUMENT",
  "PROJECT",
  "TASK",
  "EVIDENCE",
  "FINDING",
  "REPORT",
];

export function GenesisChat({
  actor,
  initialQuery = "",
}: {
  actor: SessionActor;
  initialQuery?: string;
}) {
  const [workspaceId, setWorkspaceId] = useState(actor.workspace_ids[0] ?? "");
  const [conversations, setConversations] = useState<GenesisConversation[]>([]);
  const [conversationId, setConversationId] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [contexts, setContexts] = useState<GenesisConversationContext[]>([]);
  const [contextLabels, setContextLabels] = useState<Record<string, GenesisContextOption>>({});
  const [activeAgents, setActiveAgents] = useState<GenesisActiveAgent[]>([]);
  const [draftAgents, setDraftAgents] = useState<AgentRecord[]>([]);
  const [runs, setRuns] = useState<Run[]>([]);
  const [candidateAgents, setCandidateAgents] = useState<AgentCandidate[]>([]);
  const [selectedAgentKey, setSelectedAgentKey] = useState("");
  const [agentDrawerKey, setAgentDrawerKey] = useState("");
  const [agentRun, setAgentRun] = useState<AgentRunResult | null>(null);
  const [runningAgent, setRunningAgent] = useState(false);
  const [inspectorTab, setInspectorTab] = useState<InspectorTab>("CONTEXT");
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>("NONE");
  const [conversationSearch, setConversationSearch] = useState("");
  const [openConversationMenuId, setOpenConversationMenuId] = useState("");
  const [agentSearch, setAgentSearch] = useState("");
  const [editingConversationId, setEditingConversationId] = useState("");
  const [editingTitle, setEditingTitle] = useState("");
  const [contextPickerOpen, setContextPickerOpen] = useState(false);
  const [contextType, setContextType] = useState<ContextEntityType>("DOCUMENT");
  const [contextSearch, setContextSearch] = useState("");
  const [contextOptions, setContextOptions] = useState<GenesisContextOption[]>([]);
  const [loadingContext, setLoadingContext] = useState(false);
  const [mode, setMode] = useState<ContextMode>("AUTO");
  const [prompt, setPrompt] = useState(
    () =>
      initialQuery ||
      (typeof window === "undefined"
        ? ""
        : new URLSearchParams(window.location.search).get("prompt") ?? ""),
  );
  const [capabilities, setCapabilities] = useState<string[]>([]);
  const [externalStatus, setExternalStatus] = useState("NOT_REQUESTED");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [mutating, setMutating] = useState(false);
  const [error, setError] = useState<GenesisUiError | null>(null);
  const [notice, setNotice] = useState("");
  const [showAgentRequest, setShowAgentRequest] = useState(false);
  const [agentResult, setAgentResult] = useState<GenesisAgentDesignResponse | null>(null);
  const [uploads, setUploads] = useState<GenesisUploadRecord[]>([]);
  const [uploadedDocument, setUploadedDocument] = useState<UploadedDocument | null>(null);
  const [uploading, setUploading] = useState(false);
  const [promotingUploadId, setPromotingUploadId] = useState("");
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const [favoriteConversationIds, setFavoriteConversationIds] = useState<string[]>(
    () => {
      if (typeof window === "undefined") return [];
      try {
        return JSON.parse(window.localStorage.getItem("alos-genesis-favorites") ?? "[]") as string[];
      } catch {
        return [];
      }
    },
  );
  const uploadInputRef = useRef<HTMLInputElement>(null);

  const loadWorkspaceData = useCallback(async (nextWorkspaceId: string) => {
    const [conversationItems, agentItems, runItems] = await Promise.all([
      apiRequest<GenesisConversation[]>(
        withQuery("/api/v1/genesis/conversations", { workspace_id: nextWorkspaceId }),
      ),
      apiRequest<GenesisActiveAgent[]>(
        withQuery("/api/v1/genesis/active-agents", { workspace_id: nextWorkspaceId }),
      ),
      apiRequest<Run[]>("/api/v1/workspaces/" + encodeURIComponent(nextWorkspaceId) + "/runs?limit=100"),
    ]);
    setConversations(conversationItems);
    setActiveAgents(agentItems);
    setRuns(runItems);
    try {
      const registry = await apiRequest<AgentRecord[]>(
        withQuery("/api/v1/agents", { workspace_id: nextWorkspaceId }),
      );
      setDraftAgents(
        registry.filter((agent) =>
          ["DRAFT", "RETURNED"].includes(latestVersion(agent)?.lifecycle_status ?? ""),
        ),
      );
    } catch {
      setDraftAgents([]);
    }
    return conversationItems;
  }, []);

  const loadConversation = useCallback(
    async (
      nextConversationId: string,
      knownConversations: GenesisConversation[],
      targetWorkspaceId: string,
    ) => {
      const [messageItems, attached] = await Promise.all([
        apiRequest<Message[]>(
          "/api/v1/genesis/conversations/" + encodeURIComponent(nextConversationId) + "/messages",
        ),
        apiRequest<GenesisConversationContext[]>(
          "/api/v1/genesis/conversations/" + encodeURIComponent(nextConversationId) + "/context",
        ),
      ]);
      setMessages(messageItems);
      setContexts(attached);
      const active = knownConversations.find(
        (item) => item.conversation_id === nextConversationId,
      );
      if (active) setMode(active.context_mode);

      const types = [...new Set(attached.map((item) => item.entity_type))];
      const optionSets = await Promise.all(
        types.map((entityType) =>
          apiRequest<GenesisContextOption[]>(
            withQuery("/api/v1/genesis/context-options", {
              workspace_id: targetWorkspaceId,
              entity_type: entityType,
              limit: 100,
            }),
          ),
        ),
      );
      const labels: Record<string, GenesisContextOption> = {};
      for (const option of optionSets.flat()) labels[option.entity_id] = option;
      setContextLabels(labels);
    },
    [],
  );

  useEffect(() => {
    async function initialize() {
      setLoading(true);
      setError(null);
      try {
        const first = actor.workspace_ids[0] ?? "";
        setWorkspaceId(first);
        if (first) {
          const items = await loadWorkspaceData(first);
          const requestedId =
            typeof window === "undefined"
              ? ""
              : new URLSearchParams(window.location.search).get("conversation") ?? "";
          const selected =
            items.find((item) => item.conversation_id === requestedId) ?? items[0];
          if (selected) {
            setConversationId(selected.conversation_id);
            await loadConversation(selected.conversation_id, items, first);
          }
        }
      } catch (failure) {
        setError(normalizeGenesisError(failure));
      } finally {
        setLoading(false);
      }
    }
    void initialize();
  }, [actor.workspace_ids, loadConversation, loadWorkspaceData]);

  useEffect(() => {
    if (!openConversationMenuId) return;
    function closeConversationMenu(event: PointerEvent) {
      if (
        !(event.target instanceof Element) ||
        !event.target.closest("[data-conversation-menu]")
      ) {
        setOpenConversationMenuId("");
      }
    }
    document.addEventListener("pointerdown", closeConversationMenu);
    return () => document.removeEventListener("pointerdown", closeConversationMenu);
  }, [openConversationMenuId]);

  const filteredConversations = useMemo(() => {
    const query = conversationSearch.trim().toLocaleLowerCase("id-ID");
    return query
      ? conversations.filter((item) =>
          (item.title ?? "Percakapan tanpa judul").toLocaleLowerCase("id-ID").includes(query),
        )
      : conversations;
  }, [conversationSearch, conversations]);

  const groupedConversations = useMemo(
    () => groupConversations(filteredConversations),
    [filteredConversations],
  );

  const shownAgents = useMemo(() => {
    const query = agentSearch.trim().toLocaleLowerCase("id-ID");
    return query
      ? activeAgents.filter((agent) =>
          [agent.name, agent.agent_key, agent.purpose].some((value) =>
            value.toLocaleLowerCase("id-ID").includes(query),
          ),
        )
      : activeAgents;
  }, [activeAgents, agentSearch]);
  const suggestedActiveAgents = candidateAgents
    .map((candidate) =>
      activeAgents.find((agent) => agent.agent_key === candidate.agent_key),
    )
    .filter((agent): agent is GenesisActiveAgent => Boolean(agent));

  const selectedAgent = activeAgents.find((agent) => agent.agent_key === selectedAgentKey);
  const drawerAgent = activeAgents.find((agent) => agent.agent_key === agentDrawerKey);
  const drawerDraft = draftAgents.find((agent) => agent.agent_key === agentDrawerKey);
  const activeConversation = conversations.find(
    (item) => item.conversation_id === conversationId,
  );
  const activeTitle = activeConversation?.title ?? "Percakapan baru";

  async function refreshWorkspace(selectConversation = conversationId) {
    if (!workspaceId) return;
    const items = await loadWorkspaceData(workspaceId);
    if (selectConversation) {
      const exists = items.some((item) => item.conversation_id === selectConversation);
      if (exists) await loadConversation(selectConversation, items, workspaceId);
    }
  }

  async function selectConversation(nextConversationId: string) {
    if (nextConversationId === conversationId) return;
    setConversationId(nextConversationId);
    setMessages([]);
    setContexts([]);
    setError(null);
    try {
      await loadConversation(nextConversationId, conversations, workspaceId);
      window.history.replaceState(null, "", "/genesis?conversation=" + encodeURIComponent(nextConversationId));
    } catch (failure) {
      setError(normalizeGenesisError(failure));
    }
  }

  async function newConversation() {
    if (!workspaceId || mutating) return;
    setOpenConversationMenuId("");
    setMutating(true);
    setError(null);
    try {
      const created = await apiRequest<GenesisConversation>("/api/v1/genesis/conversations", {
        method: "POST",
        body: JSON.stringify({
          workspace_id: workspaceId,
          title: "Percakapan baru",
          context_mode: "AUTO",
        }),
      });
      setConversations((current) => [created, ...current]);
      setConversationId(created.conversation_id);
      setMessages([]);
      setContexts([]);
      setContextLabels({});
      setMode("AUTO");
      setNotice("Percakapan baru berhasil dibuat.");
      window.history.replaceState(null, "", "/genesis?conversation=" + encodeURIComponent(created.conversation_id));
    } catch (failure) {
      setError(normalizeGenesisError(failure));
    } finally {
      setMutating(false);
    }
  }

  async function renameConversation(event: FormEvent) {
    event.preventDefault();
    const title = editingTitle.trim();
    if (!editingConversationId || title.length < 1 || mutating) return;
    setMutating(true);
    setError(null);
    try {
      const updated = await apiRequest<GenesisConversation>(
        "/api/v1/genesis/conversations/" + encodeURIComponent(editingConversationId),
        { method: "PATCH", body: JSON.stringify({ title }) },
      );
      setConversations((current) =>
        current.map((item) =>
          item.conversation_id === updated.conversation_id ? updated : item,
        ),
      );
      setEditingConversationId("");
      setOpenConversationMenuId("");
      setNotice("Judul percakapan berhasil diperbarui.");
    } catch (failure) {
      setError(normalizeGenesisError(failure));
    } finally {
      setMutating(false);
    }
  }

  function requestDeleteConversation(item: GenesisConversation) {
    setOpenConversationMenuId("");
    setConfirmation({
      title: "Hapus percakapan dari daftar?",
      impact:
        "Percakapan " +
        (item.title ?? "tanpa judul") +
        " akan langsung hilang dari daftar aktif. Riwayat dan audit tetap disimpan untuk keamanan.",
      confirmLabel: "Hapus",
      destructive: true,
      onConfirm: () => void archiveConversation(item),
    });
  }

  function toggleFavorite() {
    if (!conversationId) return;
    setFavoriteConversationIds((current) => {
      const next = current.includes(conversationId)
        ? current.filter((item) => item !== conversationId)
        : [...current, conversationId];
      window.localStorage.setItem("alos-genesis-favorites", JSON.stringify(next));
      return next;
    });
  }

  async function shareConversation() {
    if (!conversationId) return;
    const url =
      window.location.origin +
      "/genesis?conversation=" +
      encodeURIComponent(conversationId);
    try {
      await window.navigator.clipboard.writeText(url);
      setNotice("Tautan percakapan disalin. Akses tetap mengikuti login dan scope penerima.");
    } catch {
      setError({
        title: "Tautan belum dapat disalin",
        reason: "Browser menolak akses clipboard.",
        nextAction: "Salin alamat halaman dari address bar.",
        correlationId: null,
      });
    }
  }

  async function archiveConversation(item: GenesisConversation) {
    if (mutating) return;
    setMutating(true);
    setError(null);
    try {
      await apiRequest(
        "/api/v1/genesis/conversations/" + encodeURIComponent(item.conversation_id),
        { method: "DELETE" },
      );
      const remaining = conversations.filter(
        (conversation) => conversation.conversation_id !== item.conversation_id,
      );
      setConversations(remaining);
      setFavoriteConversationIds((current) => {
        const nextFavorites = current.filter(
          (favoriteId) => favoriteId !== item.conversation_id,
        );
        window.localStorage.setItem("alos-genesis-favorites", JSON.stringify(nextFavorites));
        return nextFavorites;
      });
      if (conversationId === item.conversation_id) {
        const next = remaining[0];
        setConversationId(next?.conversation_id ?? "");
        setMessages([]);
        setContexts([]);
        if (next) {
          window.history.replaceState(
            null,
            "",
            "/genesis?conversation=" + encodeURIComponent(next.conversation_id),
          );
          await loadConversation(next.conversation_id, remaining, workspaceId);
        } else {
          window.history.replaceState(null, "", "/genesis");
        }
      }
      setConfirmation(null);
      setNotice("Percakapan berhasil dihapus dari daftar aktif.");
    } catch (failure) {
      setError(normalizeGenesisError(failure));
    } finally {
      setMutating(false);
    }
  }

  async function openContextPicker() {
    if (!workspaceId) return;
    setContextPickerOpen(true);
    await loadContextOptions(contextType, "");
  }

  async function loadContextOptions(entityType: ContextEntityType, search: string) {
    if (!workspaceId) return;
    setLoadingContext(true);
    setError(null);
    try {
      const options = await apiRequest<GenesisContextOption[]>(
        withQuery("/api/v1/genesis/context-options", {
          workspace_id: workspaceId,
          entity_type: entityType,
          search: search.trim() || undefined,
          limit: 50,
        }),
      );
      setContextOptions(options);
    } catch (failure) {
      setError(normalizeGenesisError(failure));
    } finally {
      setLoadingContext(false);
    }
  }

  async function attachContext(option: GenesisContextOption) {
    if (!conversationId || mutating) return;
    setMutating(true);
    setError(null);
    try {
      const attached = await apiRequest<GenesisConversationContext>(
        "/api/v1/genesis/conversations/" +
          encodeURIComponent(conversationId) +
          "/context",
        {
          method: "POST",
          body: JSON.stringify({
            entity_type: option.entity_type,
            entity_id: option.entity_id,
            source_version: option.source_version,
          }),
        },
      );
      setContexts((current) =>
        current.some(
          (item) => item.conversation_context_id === attached.conversation_context_id,
        )
          ? current
          : [...current, attached],
      );
      setContextLabels((current) => ({ ...current, [option.entity_id]: option }));
      setContextPickerOpen(false);
      setNotice(option.title + " dilampirkan sebagai context yang diizinkan.");
    } catch (failure) {
      setError(normalizeGenesisError(failure));
    } finally {
      setMutating(false);
    }
  }

  async function removeContext(item: GenesisConversationContext) {
    if (!conversationId || mutating) return;
    setMutating(true);
    setError(null);
    try {
      await apiRequest(
        "/api/v1/genesis/conversations/" +
          encodeURIComponent(conversationId) +
          "/context/" +
          encodeURIComponent(item.conversation_context_id),
        { method: "DELETE" },
      );
      setContexts((current) =>
        current.filter(
          (context) => context.conversation_context_id !== item.conversation_context_id,
        ),
      );
      setNotice("Context dilepas dari percakapan. Source asli tidak dihapus.");
    } catch (failure) {
      setError(normalizeGenesisError(failure));
    } finally {
      setMutating(false);
    }
  }

  async function clearConversationContext() {
    if (!conversationId || !contexts.length || mutating) return;
    setMutating(true);
    setError(null);
    try {
      await Promise.all(
        contexts.map((item) =>
          apiRequest(
            "/api/v1/genesis/conversations/" +
              encodeURIComponent(conversationId) +
              "/context/" +
              encodeURIComponent(item.conversation_context_id),
            { method: "DELETE" },
          ),
        ),
      );
      setContexts([]);
      setContextLabels({});
      setNotice("Semua context dilepas dari percakapan. Source asli tetap tersimpan.");
    } catch (failure) {
      setError(normalizeGenesisError(failure));
      await loadConversation(conversationId, conversations, workspaceId);
    } finally {
      setMutating(false);
    }
  }

  async function uploadGenesisFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file || !workspaceId || uploading) return;
    if (!supportsGenesisUpload(file.name)) {
      setError({
        title: "Format file belum didukung",
        reason: "File " + file.name + " tidak dapat diproses oleh pipeline upload.",
        nextAction: "Gunakan PDF, DOCX, XLS/XLSX, CSV, JSON, MD, atau TXT.",
        correlationId: null,
      });
      return;
    }
    setUploading(true);
    setError(null);
    const payload = new FormData();
    payload.set("workspace_id", workspaceId);
    payload.set("file", file);
    try {
      const uploaded = await apiRequest<GenesisUploadRecord>("/api/v1/genesis/uploads", {
        method: "POST",
        body: payload,
      });
      setUploads((current) => [
        uploaded,
        ...current.filter(
          (item) => item.genesis_upload_id !== uploaded.genesis_upload_id,
        ),
      ]);
      setNotice(
        uploaded.extraction_complete
          ? "File diterima. Buat Document DRAFT sebelum menjadikannya trusted context."
          : "File diterima; extraction belum cukup untuk menjadi context.",
      );
    } catch (failure) {
      setError(normalizeGenesisError(failure));
    } finally {
      setUploading(false);
    }
  }

  async function promoteUpload(upload: GenesisUploadRecord) {
    if (!upload.extraction_complete || promotingUploadId) return;
    setPromotingUploadId(upload.genesis_upload_id);
    setError(null);
    try {
      const document = await apiRequest<UploadedDocument>(
        "/api/v1/genesis/uploads/" +
          encodeURIComponent(upload.genesis_upload_id) +
          "/document-draft",
        {
          method: "POST",
          body: JSON.stringify({
            title: upload.original_filename.replace(/\.[^.]+$/, ""),
          }),
        },
      );
      setUploadedDocument(document);
      setUploads((current) =>
        current.map((item) =>
          item.genesis_upload_id === upload.genesis_upload_id
            ? { ...item, status: "DRAFT_CREATED" }
            : item,
        ),
      );
      setNotice(document.title + " dibuat sebagai Document DRAFT.");
    } catch (failure) {
      setError(normalizeGenesisError(failure));
    } finally {
      setPromotingUploadId("");
    }
  }

  async function attachUploadedDocument() {
    if (!uploadedDocument || !conversationId) return;
    await attachContext({
      entity_type: "DOCUMENT",
      entity_id: uploadedDocument.document_id,
      title: uploadedDocument.title,
      source_version: String(uploadedDocument.version_number),
      status: uploadedDocument.status,
      scope: "CURRENT_WORKSPACE",
    });
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const content = prompt.trim();
    if (!content || !workspaceId || sending) return;
    setSending(true);
    setError(null);
    try {
      let target = conversationId;
      if (!target) {
        const created = await apiRequest<GenesisConversation>("/api/v1/genesis/conversations", {
          method: "POST",
          body: JSON.stringify({
            workspace_id: workspaceId,
            title: content.slice(0, 80),
            context_mode: mode,
          }),
        });
        target = created.conversation_id;
        setConversationId(target);
        setConversations((current) => [created, ...current]);
      }
      const result = await apiRequest<TurnResult>(
        "/api/v1/genesis/conversations/" + encodeURIComponent(target) + "/turns",
        {
          method: "POST",
          body: JSON.stringify({
            content,
            context_mode: mode,
            attachments: [],
            preferred_agent_key: selectedAgentKey || null,
          }),
        },
      );
      setMessages((current) => [
        ...current,
        result.human_message,
        result.assistant_message,
      ]);
      setCandidateAgents(result.candidate_agents);
      setCapabilities(result.candidate_capabilities);
      setExternalStatus(result.external_research.status);
      setPrompt("");
      const currentConversation = conversations.find(
        (item) => item.conversation_id === target,
      );
      if (currentConversation?.title === "Percakapan baru") {
        await apiRequest<GenesisConversation>(
          "/api/v1/genesis/conversations/" + encodeURIComponent(target),
          {
            method: "PATCH",
            body: JSON.stringify({ title: content.slice(0, 80) }),
          },
        );
      }
      await loadWorkspaceData(workspaceId);
    } catch (failure) {
      setError(normalizeGenesisError(failure));
      if (failure instanceof Error && failure.message.includes("no longer ACTIVE")) {
        setSelectedAgentKey("");
        await loadWorkspaceData(workspaceId);
      }
    } finally {
      setSending(false);
    }
  }

  async function testAgent(agent: GenesisActiveAgent) {
    if (!canTestActiveAgent(actor.roles) || runningAgent) return;
    setRunningAgent(true);
    setAgentRun(null);
    setError(null);
    try {
      const result = await apiRequest<AgentRunResult>(
        "/api/v1/agents/" + encodeURIComponent(agent.agent_key) + "/runs",
        {
          method: "POST",
          body: JSON.stringify({
            workspace_id: workspaceId,
            input: {},
            requested_tool_keys: [],
            testing: true,
          }),
        },
      );
      setAgentRun(result);
      setNotice(
        result.status === "SUCCEEDED"
          ? "Test Agent berhasil dan dicatat oleh Shared Runtime."
          : "Test Agent berhenti aman: " + (result.error_code ?? result.status),
      );
      await loadWorkspaceData(workspaceId);
    } catch (failure) {
      setError(normalizeGenesisError(failure));
    } finally {
      setRunningAgent(false);
    }
  }

  function requestDeleteDraft(agent: AgentRecord) {
    setConfirmation({
      title: "Delete Agent Draft?",
      impact:
        "Draft " +
        agent.agent_key +
        " akan dihapus hanya jika belum memiliki evidence immutable, release, permission approval, atau runtime history.",
      confirmLabel: "Delete Draft",
      destructive: true,
      onConfirm: () => void deleteDraft(agent),
    });
  }

  async function deleteDraft(agent: AgentRecord) {
    if (mutating) return;
    setMutating(true);
    setError(null);
    try {
      await apiRequest("/api/v1/agents/" + encodeURIComponent(agent.agent_key) + "/draft", {
        method: "DELETE",
      });
      setAgentDrawerKey("");
      setConfirmation(null);
      await loadWorkspaceData(workspaceId);
      setNotice("Agent DRAFT berhasil dihapus. Evidence governance tidak terpengaruh.");
    } catch (failure) {
      setError(normalizeGenesisError(failure));
    } finally {
      setMutating(false);
    }
  }

  function chooseAgent(agent: GenesisActiveAgent) {
    setSelectedAgentKey(agent.agent_key);
    setAgentDrawerKey("");
    setNotice(agent.name + " dipilih untuk turn berikutnya.");
  }

  function submitOnEnter(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) return;
    event.preventDefault();
    event.currentTarget.form?.requestSubmit();
  }

  return (
    <section className="alos-content genesis-workspace" aria-label="GENESIS Workspace">
      <input
        accept=".pdf,.docx,.xlsx,.xls,.csv,.json,.md,.txt"
        className="sr-only"
        onChange={uploadGenesisFile}
        ref={uploadInputRef}
        tabIndex={-1}
        type="file"
      />
      <GenesisFeedback error={error} notice={notice} onDismiss={() => setError(null)} />

      <nav className="genesis-mobile-controls" aria-label="Panel GENESIS">
        <button
          aria-expanded={mobilePanel === "HISTORY"}
          onClick={() => setMobilePanel((current) => current === "HISTORY" ? "NONE" : "HISTORY")}
          type="button"
        >
          Conversations
        </button>
        <button
          aria-expanded={mobilePanel === "INSPECTOR"}
          onClick={() => setMobilePanel((current) => current === "INSPECTOR" ? "NONE" : "INSPECTOR")}
          type="button"
        >
          Context / Agents
        </button>
      </nav>

      <div className="genesis-workspace-grid">
        <aside className={mobilePanel === "HISTORY" ? "genesis-conversation-nav mobile-open" : "genesis-conversation-nav"}>
          <div className="genesis-panel-heading">
            <strong>Percakapan</strong>
            <button disabled={mutating || !workspaceId} onClick={() => void newConversation()} type="button" aria-label="Percakapan baru">
              <GenesisWorkspaceIcon name="plus" /> {mutating ? "Membuat…" : "Percakapan Baru"}
            </button>
          </div>
          <label className="genesis-sidebar-search">
            <GenesisWorkspaceIcon name="search" />
            <input
              aria-label="Cari percakapan"
              onChange={(event) => setConversationSearch(event.target.value)}
              placeholder="Cari percakapan…"
              type="search"
              value={conversationSearch}
            />
          </label>
          <div className="genesis-conversation-groups">
            {loading ? <p className="genesis-empty">Memuat conversations dan Agent terotorisasi…</p> : null}
            {(["Today", "Yesterday", "Previous 7 Days", "Older"] as const).map((group) =>
              groupedConversations[group].length ? (
                <section key={group}>
                  <span>{conversationGroupLabel(group)}</span>
                  {groupedConversations[group].map((item) => (
                    <div
                      className={
                        conversationId === item.conversation_id
                          ? "genesis-conversation-row selected"
                          : "genesis-conversation-row"
                      }
                      key={item.conversation_id}
                    >
                      {editingConversationId === item.conversation_id ? (
                        <form onSubmit={(event) => void renameConversation(event)}>
                          <input
                            autoFocus
                            maxLength={160}
                            onChange={(event) => setEditingTitle(event.target.value)}
                            value={editingTitle}
                          />
                          <button disabled={mutating || !editingTitle.trim()} type="submit">
                            Simpan
                          </button>
                        </form>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setOpenConversationMenuId("");
                              void selectConversation(item.conversation_id);
                            }}
                            type="button"
                          >
                            <span>
                              <strong>{item.title ?? "Percakapan tanpa judul"}</strong>
                              <time>{conversationTime(item.updated_at ?? item.created_at)}</time>
                            </span>
                            <small>{item.last_message_preview ?? "Mulai percakapan dengan GENESIS…"}</small>
                          </button>
                          <div className="genesis-row-menu" data-conversation-menu>
                            <button
                              aria-expanded={openConversationMenuId === item.conversation_id}
                              aria-haspopup="menu"
                              aria-label={"Aksi " + (item.title ?? "percakapan")}
                              className="genesis-row-menu-trigger"
                              onClick={() => setOpenConversationMenuId((current) =>
                                current === item.conversation_id ? "" : item.conversation_id
                              )}
                              type="button"
                            >
                              •••
                            </button>
                            {openConversationMenuId === item.conversation_id ? <div role="menu">
                              <button
                                onClick={() => {
                                  setOpenConversationMenuId("");
                                  setEditingConversationId(item.conversation_id);
                                  setEditingTitle(item.title ?? "");
                                }}
                                role="menuitem"
                                type="button"
                              >
                                Ubah nama
                              </button>
                              <button
                                className="genesis-row-menu-danger"
                                onClick={() => requestDeleteConversation(item)}
                                role="menuitem"
                                type="button"
                              >
                                Hapus
                              </button>
                            </div> : null}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </section>
              ) : null,
            )}
            {!loading && filteredConversations.length === 0 ? (
              <p className="genesis-empty">Belum ada percakapan aktif.</p>
            ) : null}
          </div>
        </aside>

        <article className="genesis-chat-column">
          <header className="genesis-chat-header">
            <div className="genesis-chat-title">
              <div>
                <strong>{activeTitle}</strong>
                <small>
                  {selectedAgent?.purpose ??
                    (conversationId
                      ? "Percakapan tersimpan, terotorisasi, dan dapat diaudit."
                      : "Mulai percakapan baru dengan GENESIS.")}
                </small>
              </div>
              <label className="genesis-agent-selector">
                <GenesisWorkspaceIcon name="bot" />
                <select
                  aria-label="Agent untuk percakapan"
                  onChange={(event) => setSelectedAgentKey(event.target.value)}
                  value={selectedAgentKey}
                >
                  <option value="">GENESIS Core</option>
                  {activeAgents.map((agent) => (
                    <option key={agent.agent_key} value={agent.agent_key}>
                      {agent.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="genesis-chat-actions">
              <button
                aria-label={favoriteConversationIds.includes(conversationId) ? "Hapus dari favorit" : "Tambahkan ke favorit"}
                className={favoriteConversationIds.includes(conversationId) ? "active" : ""}
                disabled={!conversationId}
                onClick={toggleFavorite}
                title="Favorite"
                type="button"
              >
                <GenesisWorkspaceIcon name="star" />
              </button>
              <button
                aria-label="Bagikan tautan percakapan"
                disabled={!conversationId}
                onClick={() => void shareConversation()}
                title="Copy secure link"
                type="button"
              >
                <GenesisWorkspaceIcon name="share" />
              </button>
              <details className="genesis-header-menu">
                <summary aria-label="Aksi percakapan"><GenesisWorkspaceIcon name="more" /></summary>
                {activeConversation ? (
                  <div>
                    <button onClick={() => {
                      setEditingConversationId(activeConversation.conversation_id);
                      setEditingTitle(activeConversation.title ?? "");
                      setMobilePanel("HISTORY");
                    }} type="button">Ubah nama</button>
                    <button onClick={() => requestDeleteConversation(activeConversation)} type="button">Hapus</button>
                  </div>
                ) : null}
              </details>
            </div>
          </header>

          <div className="genesis-chat-scroll" aria-live="polite">
            {messages.length === 0 ? (
              <GenesisWelcome actor={actor} onPrompt={setPrompt} />
            ) : (
              messages.map((message, index) => (
                <GenesisMessage
                  agent={
                    message.actor_kind === "SYSTEM"
                      ? selectedAgentFromMessage(message) ??
                        (index === messages.length - 1 ? selectedAgent : undefined)
                      : undefined
                  }
                  key={message.message_id}
                  message={message}
                />
              ))
            )}
            {sending ? (
              <div className="alos-genesis-thinking">
                <span />
                <span />
                <span /> GENESIS menelusuri source yang diizinkan…
              </div>
            ) : null}
          </div>

          {uploads.length ? (
            <section className="genesis-upload-strip" aria-label="Unggahan GENESIS">
              {uploads.slice(0, 3).map((upload) => (
                <div key={upload.genesis_upload_id}>
                  <span>▤</span>
                  <p>
                    <strong>{upload.original_filename}</strong>
                    <small>{uploadExtractionLabel(upload)} · {upload.status}</small>
                  </p>
                  {upload.status === "SOURCE_RECEIVED" && upload.extraction_complete ? (
                    <button
                      disabled={Boolean(promotingUploadId)}
                      onClick={() => void promoteUpload(upload)}
                      type="button"
                    >
                      {promotingUploadId === upload.genesis_upload_id
                        ? "Membuat DRAFT…"
                        : "Buat Document DRAFT"}
                    </button>
                  ) : null}
                </div>
              ))}
              {uploadedDocument ? (
                <button onClick={() => void attachUploadedDocument()} type="button">
                  Gunakan {uploadedDocument.title} di percakapan
                </button>
              ) : null}
            </section>
          ) : null}

          <form className="genesis-composer" onSubmit={(event) => void submit(event)}>
            <div className="genesis-selected-chips">
              {selectedAgent ? (
                <span className="agent-chip">
                  <GenesisWorkspaceIcon name="bot" /> {selectedAgent.name}
                  <button aria-label="Lepas Agent" onClick={() => setSelectedAgentKey("")} type="button">
                    ×
                  </button>
                </span>
              ) : null}
              {contexts.slice(0, 3).map((item) => (
                <span key={item.conversation_context_id}>
                  <GenesisWorkspaceIcon name={contextIcon(item.entity_type)} />
                  {contextLabels[item.entity_id]?.title ?? item.entity_type}
                  {item.source_version ? <em>v{item.source_version}</em> : null}
                  <button aria-label={"Lepas " + (contextLabels[item.entity_id]?.title ?? item.entity_type)} disabled={mutating} onClick={() => void removeContext(item)} type="button">×</button>
                </span>
              ))}
              <button className="genesis-add-context-chip" disabled={!conversationId} onClick={() => void openContextPicker()} type="button"><GenesisWorkspaceIcon name="plus" /> Tambah Konteks</button>
              {contexts.length ? <button className="genesis-clear-context" disabled={mutating} onClick={() => void clearConversationContext()} type="button">Hapus semua</button> : null}
            </div>
            <textarea
              maxLength={10000}
              onChange={(event) => setPrompt(event.target.value)}
              onKeyDown={submitOnEnter}
              placeholder="Ask GENESIS about the company, a document, or an Agent…"
              value={prompt}
            />
            <div>
              <button
                aria-label={uploading ? "Sedang mengunggah dokumen" : "Unggah dokumen"}
                disabled={!workspaceId || uploading}
                onClick={() => uploadInputRef.current?.click()}
                title="Unggah source"
                type="button"
              >
                {uploading ? "…" : <GenesisWorkspaceIcon name="paperclip" />}
              </button>
              <button
                aria-label="Gunakan sumber internal ALOS"
                className={mode === "INTERNAL" ? "active" : ""}
                onClick={() => setMode((current) => current === "INTERNAL" ? "AUTO" : "INTERNAL")}
                title="Internal ALOS"
                type="button"
              >
                <GenesisWorkspaceIcon name="database" />
              </button>
              <button
                aria-label="Izinkan sumber eksternal terkonfigurasi"
                className={["EXTERNAL", "INTERNAL_AND_EXTERNAL"].includes(mode) ? "active" : ""}
                onClick={() => setMode((current) => current === "INTERNAL_AND_EXTERNAL" ? "AUTO" : "INTERNAL_AND_EXTERNAL")}
                title="Internal + external"
                type="button"
              >
                <GenesisWorkspaceIcon name="globe" />
              </button>
              <small>Enter kirim · Shift+Enter baris baru</small>
              <button disabled={!prompt.trim() || !workspaceId || sending} type="submit">
                {sending ? "Mengirim…" : <><span>Kirim</span><GenesisWorkspaceIcon name="send" /></>}
              </button>
            </div>
          </form>
        </article>

        <aside className={mobilePanel === "INSPECTOR" ? "genesis-inspector mobile-open" : "genesis-inspector"}>
          <nav aria-label="Inspector GENESIS">
            {(["CONTEXT", "AGENTS", "ACTIVITY"] as const).map((tab) => (
              <button
                aria-current={inspectorTab === tab ? "page" : undefined}
                className={inspectorTab === tab ? "active" : ""}
                key={tab}
                onClick={() => setInspectorTab(tab)}
                type="button"
              >
                {tab === "CONTEXT" ? "Konteks" : tab === "AGENTS" ? "Agents" : "Aktivitas"}
              </button>
            ))}
          </nav>

          {inspectorTab === "CONTEXT" ? (
            <div className="genesis-inspector-body">
              <section className="genesis-inspector-section">
                <div className="genesis-panel-heading">
                  <div><strong>Konteks Percakapan</strong><small>Dokumen, task, proyek, atau data yang digunakan dalam percakapan ini.</small></div>
                  <button disabled={!conversationId} onClick={() => void openContextPicker()} type="button">
                    <GenesisWorkspaceIcon name="plus" /> Tambah Konteks
                  </button>
                </div>
                <div className="genesis-context-list">
                  {contexts.map((item) => {
                    const option = contextLabels[item.entity_id];
                    return (
                      <article className="genesis-context-card" key={item.conversation_context_id}>
                        <span className={"genesis-context-icon type-" + (item.entity_type?.toLowerCase() ?? "")}><GenesisWorkspaceIcon name={contextIcon(item.entity_type)} /></span>
                        <div>
                          <strong>{option?.title ?? "Authorized " + (item.entity_type ?? "item")}</strong>
                          <small>{humanContextType(item.entity_type)}{item.source_version ? " · v" + item.source_version : ""} · {option?.scope ?? option?.status ?? "Attached"}</small>
                        </div>
                        <details className="genesis-row-menu">
                          <summary aria-label="Aksi context"><GenesisWorkspaceIcon name="more" /></summary>
                          <div><Link href={contextHref(item.entity_type)}>Lihat</Link><button disabled={mutating} onClick={() => void removeContext(item)} type="button">Lepas</button></div>
                        </details>
                      </article>
                    );
                  })}
                  {!contexts.length ? <p className="genesis-empty">Belum ada konteks khusus yang dilampirkan.</p> : null}
                </div>
                <dl className="genesis-source-state">
                  <div><dt>Mode sumber</dt><dd>{modeLabel(mode)}</dd></div>
                  <div><dt>External</dt><dd>{humanExternalStatus(externalStatus)}</dd></div>
                </dl>
              </section>

              <section className="genesis-inspector-section">
                <div className="genesis-panel-heading"><strong>Agent Aktif di Workspace</strong><button onClick={() => setInspectorTab("AGENTS")} type="button">Lihat Semua ›</button></div>
                <div className="genesis-compact-agent-list">
                  {activeAgents.slice(0, 5).map((agent) => (
                    <article className={selectedAgentKey === agent.agent_key ? "selected" : ""} key={agent.agent_key}>
                      <button onClick={() => setAgentDrawerKey(agent.agent_key)} type="button"><span><GenesisWorkspaceIcon name="bot" /></span><div><strong>{agent.name}</strong><small>{agent.purpose}</small></div></button>
                      <div><b>ACTIVE</b><small>v{agent.semantic_version}</small></div>
                      <details className="genesis-row-menu"><summary aria-label={"Aksi " + agent.name}><GenesisWorkspaceIcon name="more" /></summary><div><button onClick={() => chooseAgent(agent)} type="button">Gunakan</button><button onClick={() => setAgentDrawerKey(agent.agent_key)} type="button">Detail</button></div></details>
                    </article>
                  ))}
                  {!activeAgents.length ? <p className="genesis-empty">Belum ada Agent ACTIVE yang tersedia untuk workspace dan scope Anda.</p> : null}
                </div>
              </section>

              <section className="genesis-inspector-section">
                <div className="genesis-panel-heading"><strong>Direkomendasikan untuk Percakapan Ini</strong></div>
                {suggestedActiveAgents.slice(0, 1).map((agent) => (
                  <article className="genesis-recommended-agent" key={agent.agent_key}>
                    <div><span><GenesisWorkspaceIcon name="bot" /></span><p><strong>{agent.name}</strong><small>Matched capabilities: {agent.capability_keys.join(", ") || "general"}</small></p><b>Aktif</b></div>
                    <button onClick={() => chooseAgent(agent)} type="button">Gunakan Agent <GenesisWorkspaceIcon name="check" /></button>
                  </article>
                ))}
                {!suggestedActiveAgents.length ? (
                  <article className="genesis-request-agent-card">
                    <strong>Belum menemukan agent yang sesuai?</strong>
                    <p>Minta GENESIS membuat Agent baru sesuai kebutuhan Anda.</p>
                    <button onClick={() => setShowAgentRequest(true)} type="button"><GenesisWorkspaceIcon name="plus" /> Request New Agent</button>
                  </article>
                ) : null}
              </section>
            </div>
          ) : null}

          {inspectorTab === "AGENTS" ? (
            <div className="genesis-inspector-body">
              <input
                aria-label="Cari Agent"
                onChange={(event) => setAgentSearch(event.target.value)}
                placeholder="Search Agents…"
                type="search"
                value={agentSearch}
              />
              <section>
                <div className="genesis-panel-heading"><strong>ACTIVE</strong><span>{shownAgents.length}</span></div>
                {shownAgents.map((agent) => (
                  <article className="genesis-agent-card" key={agent.agent_key}>
                    <button onClick={() => setAgentDrawerKey(agent.agent_key)} type="button">
                      <span className="genesis-agent-icon"><GenesisWorkspaceIcon name="bot" /></span>
                      <p><strong>{agent.name}</strong><small>{agent.purpose}</small></p>
                      <span className="lifecycle-pill lifecycle-active">ACTIVE</span>
                    </button>
                    <div>
                      <small>{agent.risk_level} · v{agent.semantic_version}</small>
                      <button onClick={() => chooseAgent(agent)} type="button">Use Agent</button>
                    </div>
                  </article>
                ))}
                {!shownAgents.length ? <p className="genesis-empty">Belum ada Agent ACTIVE dalam scope Anda.</p> : null}
              </section>
              <section>
                <div className="genesis-panel-heading"><strong>Suggested for this conversation</strong></div>
                {candidateAgents.map((candidate) => (
                  <button
                    className="genesis-suggested-agent"
                    key={candidate.agent_key}
                    onClick={() => setAgentDrawerKey(candidate.agent_key)}
                    type="button"
                  >
                    <strong>{candidate.name}</strong>
                    <small>{candidate.agent_key} · {candidate.risk_level}</small>
                    <small>Matched capabilities: {candidate.capability_keys.join(", ") || "general"}</small>
                  </button>
                ))}
                {!candidateAgents.length ? <p className="genesis-empty">Kirim pertanyaan untuk melihat rekomendasi.</p> : null}
              </section>
              {draftAgents.length ? (
                <section>
                  <div className="genesis-panel-heading"><strong>Your Drafts</strong><span>{draftAgents.length}</span></div>
                  {draftAgents.map((agent) => (
                    <button
                      className="genesis-suggested-agent"
                      key={agent.agent_key}
                      onClick={() => setAgentDrawerKey(agent.agent_key)}
                      type="button"
                    >
                      <strong>{agent.name}</strong>
                      <small>{agent.agent_key} · {latestVersion(agent)?.lifecycle_status}</small>
                    </button>
                  ))}
                </section>
              ) : null}
              <button className="genesis-primary-wide" onClick={() => setShowAgentRequest(true)} type="button">
                + Request New Agent
              </button>
            </div>
          ) : null}

          {inspectorTab === "ACTIVITY" ? (
            <div className="genesis-inspector-body">
              <strong>Conversation Activity</strong>
              <ul className="genesis-activity-list">
                {selectedAgent ? <li><span>Agent selected</span><b>{selectedAgent.name}</b></li> : null}
                {messages.flatMap((message) =>
                  message.tool_activity.map((tool, index) => (
                    <li key={message.message_id + "-tool-" + index}>
                      <span>Tool call</span><b>{String(tool.tool_key ?? tool.name ?? "Governed tool")}</b>
                    </li>
                  )),
                )}
                {messages.flatMap((message) =>
                  message.citations.map((citation, index) => (
                    <li key={message.message_id + "-source-" + index}>
                      <span>Source cited</span><b>{String(citation.title ?? citation.source_id ?? "Source")}</b>
                    </li>
                  )),
                )}
                {agentRun ? <li><span>Agent test</span><b>{agentRun.status} · {agentRun.correlation_id}</b></li> : null}
                {messages.some((message) => message.actor_kind === "SYSTEM") ? <li><span>Model activity</span><b>{messages.filter((message) => message.actor_kind === "SYSTEM").length} response tercatat</b></li> : null}
              </ul>
              {!selectedAgent &&
              !agentRun &&
              !messages.some((message) => message.actor_kind === "SYSTEM") &&
              messages.every(
                (message) => !message.tool_activity.length && !message.citations.length,
              ) ? (
                <p className="genesis-empty">Activity akan muncul setelah source, tool, atau Agent digunakan.</p>
              ) : null}
              {capabilities.length ? (
                <div className="alos-chip-list">
                  {capabilities.map((capability) => <span key={capability}>{capability}</span>)}
                </div>
              ) : null}
            </div>
          ) : null}
        </aside>
      </div>

      {contextPickerOpen ? (
        <div className="genesis-drawer-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget && !mutating) setContextPickerOpen(false);
        }}>
          <section aria-modal="true" className="genesis-picker-modal" role="dialog">
            <header><div><p className="alos-kicker">AUTHORIZED CONTEXT</p><h3>Add context</h3></div><button onClick={() => setContextPickerOpen(false)} type="button">×</button></header>
            <div className="genesis-context-types">
              {contextTypes.map((type) => (
                <button
                  className={contextType === type ? "active" : ""}
                  key={type}
                  onClick={() => {
                    setContextType(type);
                    setContextSearch("");
                    void loadContextOptions(type, "");
                  }}
                  type="button"
                >
                  {type}
                </button>
              ))}
            </div>
            <form onSubmit={(event) => {
              event.preventDefault();
              void loadContextOptions(contextType, contextSearch);
            }}>
              <input
                aria-label="Cari context"
                onChange={(event) => setContextSearch(event.target.value)}
                placeholder="Search by title or key…"
                value={contextSearch}
              />
              <button disabled={loadingContext} type="submit">Search</button>
            </form>
            <div className="genesis-option-list">
              {loadingContext ? <p className="genesis-empty">Memuat context terotorisasi…</p> : null}
              {contextOptions.map((option) => (
                <button disabled={mutating} key={option.entity_id} onClick={() => void attachContext(option)} type="button">
                  <span>{option.entity_type}</span><p><strong>{option.title}</strong><small>{option.status} · {option.scope}</small></p>
                </button>
              ))}
              {!loadingContext && !contextOptions.length ? <p className="genesis-empty">Tidak ada context terotorisasi yang cocok.</p> : null}
            </div>
          </section>
        </div>
      ) : null}

      {drawerAgent || drawerDraft ? (
        <AgentDrawer
          activeAgent={drawerAgent}
          actor={actor}
          draftAgent={drawerDraft}
          latestRun={runs.find((run) => run.agent_key === agentDrawerKey) ?? null}
          onClose={() => {
            setAgentDrawerKey("");
            setAgentRun(null);
          }}
          onDeleteDraft={requestDeleteDraft}
          onTest={(agent) => void testAgent(agent)}
          onUse={chooseAgent}
          result={agentRun}
          running={runningAgent}
        />
      ) : null}

      {showAgentRequest ? (
        <AgentRequestModal
          actor={actor}
          defaultRequirement={prompt}
          onClose={() => setShowAgentRequest(false)}
          onResult={(result) => {
            setAgentResult(result);
            setShowAgentRequest(false);
            setNotice("Agent " + result.draft.agent_key + " dibuat sebagai DRAFT.");
            void refreshWorkspace();
          }}
          workspaceId={workspaceId}
        />
      ) : null}

      {agentResult ? (
        <div className="genesis-drawer-backdrop">
          <section aria-modal="true" className="genesis-picker-modal genesis-draft-result" role="dialog">
            <header><div><p className="alos-kicker">AGENT CONTRACT CREATED</p><h3>{agentResult.proposed_design.name}</h3></div><button onClick={() => setAgentResult(null)} type="button">×</button></header>
            <span className="lifecycle-pill lifecycle-draft">DRAFT</span>
            <p>{agentResult.proposed_design.objective}</p>
            <dl>
              <div><dt>Agent key</dt><dd>{agentResult.draft.agent_key}</dd></div>
              <div><dt>Version</dt><dd>{agentResult.draft.semantic_version}</dd></div>
              <div><dt>Risk</dt><dd>{agentResult.normalized_risk_level}</dd></div>
              <div><dt>Capabilities</dt><dd>{agentResult.proposed_design.capability_keys?.join(", ") || "Resolved by backend"}</dd></div>
              <div><dt>Tools</dt><dd>{agentResult.bound_tool_keys.join(", ") || "No material tools"}</dd></div>
              <div><dt>Missing Configuration</dt><dd>{agentResult.missing_dependencies.join(", ") || "None"}</dd></div>
              <div><dt>Readiness</dt><dd>{agentResult.activation_readiness}</dd></div>
              <div><dt>Tests</dt><dd>{agentResult.generated_tests.length}</dd></div>
              <div><dt>Release</dt><dd>{agentResult.release_request.state}</dd></div>
              <div><dt>Audit / correlation</dt><dd>{agentResult.draft.correlation_id}</dd></div>
            </dl>
            <p className="safe-note">{agentDraftPresentation(agentResult)}. Agent tidak otomatis ACTIVE.</p>
            <div><Link href="/genesis?view=agents">Open Agent Registry</Link><Link href="/genesis?view=agents&sub=releases">Open Governance</Link></div>
          </section>
        </div>
      ) : null}

      <GovernanceConfirmationModal
        busy={mutating}
        confirmation={confirmation}
        onCancel={() => setConfirmation(null)}
      />
    </section>
  );
}

function GenesisFeedback({
  error,
  notice,
  onDismiss,
}: {
  error: GenesisUiError | null;
  notice: string;
  onDismiss: () => void;
}) {
  return (
    <>
      {error ? (
        <section className="genesis-feedback" role="alert">
          <div><strong>{error.title}</strong><p>{error.reason}</p><small>Langkah berikutnya: {error.nextAction}</small>{error.correlationId ? <code>Reference ID: {error.correlationId}</code> : null}</div>
          <button aria-label="Tutup error" onClick={onDismiss} type="button">×</button>
        </section>
      ) : null}
      {notice ? <p className="governance-toast" role="status">✓ {notice}</p> : null}
    </>
  );
}

function GenesisWelcome({
  actor,
  onPrompt,
}: {
  actor: SessionActor;
  onPrompt: (value: string) => void;
}) {
  const examples = actor.roles.includes("DIRECTOR")
    ? [
        "Apa isu perusahaan yang paling mendesak?",
        "Ringkas approval yang masih pending.",
        "Buat kebutuhan agent monitoring tugas overdue Property.",
      ]
    : [
        "Apa tugas saya yang perlu segera ditangani?",
        "Ringkas temuan terbuka di divisi saya.",
        "Tunjukkan dokumen relevan untuk pekerjaan saya.",
      ];
  return (
    <div className="alos-genesis-welcome">
      <span className="alos-genesis-orb large">G</span>
      <h3>Apa yang ingin Anda ketahui?</h3>
      <p>GENESIS hanya membaca data yang diizinkan dan menyertakan jejak source.</p>
      <div>{examples.map((item) => <button key={item} onClick={() => onPrompt(item)} type="button">{item}</button>)}</div>
    </div>
  );
}

function GenesisMessage({
  agent,
  message,
}: {
  agent?: AgentCandidate;
  message: Message;
}) {
  const isHuman = message.actor_kind === "HUMAN";
  const response = responseFromMessage(message);
  return (
    <div className={isHuman ? "alos-genesis-message human" : "alos-genesis-message assistant"}>
      <span className={isHuman ? "genesis-message-avatar human" : "genesis-message-avatar"}>
        {isHuman ? "DU" : "G"}
      </span>
      <div className="genesis-message-content">
        <div className="alos-genesis-message-meta"><strong>{isHuman ? "Direktur Utama" : "GENESIS"}</strong><time>{formatClock(message.created_at)}</time></div>
        {agent ? (
          <section className="genesis-used-agent">
            <span><GenesisWorkspaceIcon name="bot" /></span>
            <div><small>Menggunakan agent</small><strong>{agent.name}</strong><em>v{agent.semantic_version}</em></div>
            <b>ACTIVE</b>
          </section>
        ) : null}
        <p>{response?.answer || message.content}</p>
        {!isHuman && response?.reliability ? <small className="alos-genesis-reliability"><GenesisWorkspaceIcon name="check" /> Reliability: {response.reliability}</small> : null}
        {!isHuman ? <GenesisResponseSections response={response} /> : null}
        {!isHuman && message.citations.length ? (
          <details>
            <summary><GenesisWorkspaceIcon name="database" /> Sumber Data <span>{message.citations.length}</span></summary>
            <ul>{message.citations.map((citation, index) => <li key={String(citation.source_id ?? citation.url ?? index)}><span>{String(citation.title ?? citation.source_id ?? citation.url ?? "Source terverifikasi")}</span><small>{String(citation.source_kind ?? "SOURCE")}</small></li>)}</ul>
          </details>
        ) : null}
        {!isHuman && message.tool_activity.length ? <small className="alos-tool-activity">{message.tool_activity.length} governed tool call</small> : null}
      </div>
    </div>
  );
}

function responseFromMessage(message: Message): GenesisResponse | null {
  const value = message.structured_content.response;
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as GenesisResponse;
}

function selectedAgentFromMessage(message: Message): AgentCandidate | undefined {
  const value = message.structured_content.selected_agent;
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const candidate = value as Partial<AgentCandidate>;
  if (
    typeof candidate.agent_key !== "string" ||
    typeof candidate.name !== "string" ||
    typeof candidate.semantic_version !== "string"
  ) {
    return undefined;
  }
  return {
    agent_key: candidate.agent_key,
    name: candidate.name,
    semantic_version: candidate.semantic_version,
    purpose: candidate.purpose ?? "",
    risk_level: candidate.risk_level ?? "UNKNOWN",
    capability_keys: candidate.capability_keys ?? [],
  };
}

function GenesisResponseSections({ response }: { response: GenesisResponse | null }) {
  if (!response) return null;
  const sections: Array<[string, string[] | undefined]> = [
    ["Temuan", response.findings],
    ["Rekomendasi", response.recommendations],
    ["Batasan", response.limitations],
  ];
  return (
    <>
      {sections
        .filter(([, items]) => Boolean(items?.length))
        .map(([title, items]) => (
          <section className="alos-genesis-response-section" key={title}>
            <strong>{title}</strong>
            <ul>{items?.map((item) => <li key={item}>{item}</li>)}</ul>
          </section>
        ))}
    </>
  );
}

function AgentDrawer({
  activeAgent,
  actor,
  draftAgent,
  latestRun,
  onClose,
  onDeleteDraft,
  onTest,
  onUse,
  result,
  running,
}: {
  activeAgent?: GenesisActiveAgent;
  actor: SessionActor;
  draftAgent?: AgentRecord;
  latestRun: Run | null;
  onClose: () => void;
  onDeleteDraft: (agent: AgentRecord) => void;
  onTest: (agent: GenesisActiveAgent) => void;
  onUse: (agent: GenesisActiveAgent) => void;
  result: AgentRunResult | null;
  running: boolean;
}) {
  const version = draftAgent ? latestVersion(draftAgent) : undefined;
  const name = activeAgent?.name ?? draftAgent?.name ?? "Agent";
  const key = activeAgent?.agent_key ?? draftAgent?.agent_key ?? "";
  return (
    <div className="genesis-drawer-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget && !running) onClose();
    }}>
      <section aria-modal="true" className="genesis-agent-drawer" role="dialog">
        <header><div><p className="alos-kicker">AGENT DETAIL</p><h3>{name}</h3></div><button onClick={onClose} type="button">×</button></header>
        <span className={"lifecycle-pill lifecycle-" + (activeAgent ? "active" : (version?.lifecycle_status ?? "draft").toLowerCase())}>{activeAgent ? "ACTIVE" : version?.lifecycle_status}</span>
        <p>{activeAgent?.purpose ?? version?.contract_snapshot.purpose}</p>
        <dl>
          <div><dt>Agent key</dt><dd>{key}</dd></div>
          <div><dt>Version</dt><dd>{activeAgent?.semantic_version ?? version?.semantic_version}</dd></div>
          <div><dt>Risk</dt><dd>{activeAgent?.risk_level ?? draftAgent?.risk_level}</dd></div>
          <div><dt>Scope</dt><dd>{activeAgent?.division_scope.join(", ") || "Workspace"}</dd></div>
          <div><dt>Last Run</dt><dd>{latestRun ? formatTime(latestRun.created_at) : "Belum ada"}</dd></div>
          <div><dt>Last Run Status</dt><dd>{latestRun?.status ?? "NOT RUN"}</dd></div>
        </dl>
        <section><strong>Capabilities</strong><div className="alos-chip-list">{(activeAgent?.capability_keys ?? []).map((item) => <span key={item}>{item}</span>)}</div></section>
        <section><strong>Tools & Permissions</strong><p>{version?.contract_snapshot.tool_keys.join(", ") || "Buka Governance untuk metadata tool dan permission yang sesuai role Anda."}</p><small>{version?.contract_snapshot.permission_keys.join(", ")}</small></section>
        {result ? (
          <section className="genesis-run-result">
            <strong>Test Result: {result.status}</strong>
            <dl>
              <div><dt>Provider / Model</dt><dd>{result.provider ?? "—"} / {result.model ?? "—"}</dd></div>
              <div><dt>Tokens</dt><dd>{result.input_tokens ?? 0} in · {result.output_tokens ?? 0} out</dd></div>
              <div><dt>Cost</dt><dd>{result.estimated_cost_usd ?? "0"}</dd></div>
              <div><dt>Latency</dt><dd>{result.latency_milliseconds ?? 0} ms</dd></div>
              <div><dt>Reference</dt><dd>{result.correlation_id}</dd></div>
              <div><dt>Error / Block reason</dt><dd>{result.error_code ?? result.tool_decisions.find((item) => item.decision === "BLOCKED")?.reason ?? "—"}</dd></div>
            </dl>
            <p>Input: empty safe fixture</p>
            {result.tool_decisions.length ? <ul>{result.tool_decisions.map((decision) => <li key={decision.tool_key}>{decision.tool_key} · {decision.decision} · {decision.reason}</li>)}</ul> : <small>Tidak ada tool material yang diminta.</small>}
            {result.output ? <pre>{JSON.stringify(result.output, null, 2)}</pre> : null}
          </section>
        ) : null}
        <footer>
          {activeAgent ? <button onClick={() => onUse(activeAgent)} type="button">Use Agent</button> : null}
          {activeAgent && canTestActiveAgent(actor.roles) ? <button disabled={running} onClick={() => onTest(activeAgent)} type="button">{running ? "Running Test…" : "Test Agent"}</button> : null}
          <Link href={activeAgent ? "/agents?agent=" + encodeURIComponent(key) + "&action=new-version" : "/agents?agent=" + encodeURIComponent(key) + (canManageDraftAgent(actor.roles) ? "&action=edit" : "")}>{activeAgent ? "Create New Version" : canManageDraftAgent(actor.roles) ? "View / Edit Draft" : "View Draft"}</Link>
          {draftAgent && canManageDraftAgent(actor.roles) ? <button className="danger-button" onClick={() => onDeleteDraft(draftAgent)} type="button">Delete Draft</button> : null}
          <Link href="/genesis?view=agents&sub=releases">Open Governance</Link>
        </footer>
        {activeAgent ? <p className="safe-note">ACTIVE Agent immutable. Edit dan delete tidak tersedia; perubahan harus melalui versi DRAFT baru.</p> : null}
      </section>
    </div>
  );
}

function AgentRequestModal({
  actor,
  defaultRequirement,
  onClose,
  onResult,
  workspaceId,
}: {
  actor: SessionActor;
  defaultRequirement: string;
  onClose: () => void;
  onResult: (result: GenesisAgentDesignResponse) => void;
  workspaceId: string;
}) {
  const [requirement, setRequirement] = useState(defaultRequirement);
  const [output, setOutput] = useState("");
  const [schedule, setSchedule] = useState("");
  const [division, setDivision] = useState(actor.division_codes[0] ?? "");
  const [risk, setRisk] = useState("");
  const [capabilityHints, setCapabilityHints] = useState("");
  const [toolHints, setToolHints] = useState("");
  const [permissionHints, setPermissionHints] = useState("");
  const [schemaHints, setSchemaHints] = useState("");
  const [restrictions, setRestrictions] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<GenesisUiError | null>(null);
  const divisions = useMemo(() => actor.division_codes.slice(0, 6), [actor.division_codes]);
  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    const additions = [
      output ? "Expected output: " + output : "",
      schedule ? "Schedule/frequency: " + schedule : "",
      division ? "Requested division scope: " + division : "",
      risk ? "Requester risk suggestion (backend must validate): " + risk : "",
      capabilityHints ? "Capability requirements: " + capabilityHints : "",
      toolHints ? "Tool requirements (registry resolution required): " + toolHints : "",
      permissionHints ? "Permission needs (do not self-grant): " + permissionHints : "",
      schemaHints ? "Input/output shape: " + schemaHints : "",
      restrictions ? "Restrictions: " + restrictions : "",
    ].filter(Boolean);
    try {
      const result = await apiRequest<GenesisAgentDesignResponse>("/api/v1/genesis/agent-requests", {
        method: "POST",
        body: JSON.stringify({
          workspace_id: workspaceId,
          requirement: [requirement, ...additions].join("\n"),
          division_scope: division ? [division] : divisions,
          deterministic: false,
        }),
      });
      onResult(result);
    } catch (failure) {
      setError(normalizeGenesisError(failure));
    } finally {
      setSaving(false);
    }
  }
  return (
    <div className="genesis-drawer-backdrop" role="presentation">
      <section aria-modal="true" className="genesis-picker-modal" role="dialog">
        <header><div><p className="alos-kicker">AGENT DESIGNER</p><h3>Request New Agent</h3></div><button disabled={saving} onClick={onClose} type="button">×</button></header>
        <form className="genesis-agent-request" onSubmit={(event) => void submit(event)}>
          <label>What should this Agent do?<textarea minLength={20} onChange={(event) => setRequirement(event.target.value)} required value={requirement} /></label>
          <label>Expected output<input onChange={(event) => setOutput(event.target.value)} value={output} /></label>
          <label>Schedule or frequency<input onChange={(event) => setSchedule(event.target.value)} value={schedule} /></label>
          <label>Division (optional)<select onChange={(event) => setDivision(event.target.value)} value={division}><option value="">Company / let GENESIS resolve</option>{actor.division_codes.map((item) => <option key={item}>{item}</option>)}</select></label>
          <details>
            <summary>Advanced details</summary>
            <label>Risk suggestion<select onChange={(event) => setRisk(event.target.value)} value={risk}><option value="">Let backend validate</option><option>LOW</option><option>MEDIUM</option><option>HIGH</option><option>CRITICAL</option></select></label>
            <label>Capabilities<input onChange={(event) => setCapabilityHints(event.target.value)} placeholder="Business capabilities, not internal IDs" value={capabilityHints} /></label>
            <label>Tools<input onChange={(event) => setToolHints(event.target.value)} placeholder="Required operations; registry resolves allowlist" value={toolHints} /></label>
            <label>Permissions<input onChange={(event) => setPermissionHints(event.target.value)} placeholder="Requested access; never self-approved" value={permissionHints} /></label>
            <label>Input / output shape<textarea onChange={(event) => setSchemaHints(event.target.value)} placeholder="Describe fields in plain language" value={schemaHints} /></label>
            <label>Restrictions<textarea onChange={(event) => setRestrictions(event.target.value)} value={restrictions} /></label>
          </details>
          {error ? <section className="genesis-inline-error" role="alert"><strong>{error.title}</strong><span>{error.reason}</span><small>Langkah berikutnya: {error.nextAction}</small>{error.correlationId ? <code>Reference ID: {error.correlationId}</code> : null}</section> : null}
          <button disabled={saving || requirement.trim().length < 20} type="submit">{saving ? "Designing…" : "Create Agent Contract DRAFT"}</button>
          <small>Backend tetap authoritative atas tool, permission, risk, tests, dan lifecycle.</small>
        </form>
      </section>
    </div>
  );
}

function formatTime(value: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function modeLabel(mode: ContextMode): string {
  return {
    AUTO: "Auto",
    INTERNAL: "Internal",
    EXTERNAL: "External",
    INTERNAL_AND_EXTERNAL: "Internal + external",
  }[mode];
}

function humanExternalStatus(status: string): string {
  if (status === "NOT_REQUESTED") return "Tidak diminta";
  if (status === "SUCCEEDED") return "Tersedia";
  if (status === "EXTERNAL_RESEARCH_NOT_CONFIGURED") return "Belum dikonfigurasi";
  if (status === "UNAVAILABLE") return "Tidak tersedia";
  return status;
}

type GenesisWorkspaceIconName =
  | "activity"
  | "bot"
  | "check"
  | "database"
  | "document"
  | "globe"
  | "paperclip"
  | "plus"
  | "project"
  | "send"
  | "search"
  | "share"
  | "sparkles"
  | "star"
  | "task"
  | "more";

function GenesisWorkspaceIcon({ name }: { name: GenesisWorkspaceIconName }) {
  const paths: Record<GenesisWorkspaceIconName, React.ReactNode> = {
    activity: <><path d="M4 19V9M10 19V5M16 19v-7M22 19V8" /><path d="M2 19h22" /></>,
    bot: <><rect height="10" rx="3" width="16" x="4" y="8" /><path d="M9 12h.01M15 12h.01M9 16h6M12 4v4M10.5 4h3M2 12h2M20 12h2" /></>,
    check: <><circle cx="12" cy="12" r="9" /><path d="m8 12 2.5 2.5L16 9" /></>,
    database: <><ellipse cx="12" cy="5" rx="8" ry="3" /><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" /></>,
    document: <><path d="M6 2h8l4 4v16H6z" /><path d="M14 2v5h5M9 12h6M9 16h6" /></>,
    globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3.4 3 14.6 0 18M12 3c-3 3.4-3 14.6 0 18" /></>,
    more: <><circle cx="5" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="19" cy="12" r="1" fill="currentColor" stroke="none" /></>,
    paperclip: <path d="m8.7 12.8 5.8-5.8a3.2 3.2 0 0 1 4.5 4.5l-7.4 7.4a5 5 0 0 1-7.1-7.1l7.1-7.1" />,
    plus: <path d="M12 5v14M5 12h14" />,
    project: <><path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m16.5 16.5 4 4" /></>,
    send: <><path d="m4 4 16 8-16 8 3-8-3-8Z" /><path d="M7 12h13" /></>,
    share: <><circle cx="18" cy="5" r="2.5" /><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="19" r="2.5" /><path d="m8.2 10.8 7.5-4.4M8.2 13.2l7.5 4.4" /></>,
    sparkles: <><path d="M12 2c.7 5.2 2.8 7.3 8 8-5.2.7-7.3 2.8-8 8-.7-5.2-2.8-7.3-8-8 5.2-.7 7.3-2.8 8-8Z" /><path d="M19 17c.3 2 1 2.7 3 3-2 .3-2.7 1-3 3-.3-2-1-2.7-3-3 2-.3 2.7-1 3-3Z" /></>,
    star: <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-2.9-5.6 2.9 1.1-6.2L3 9.6l6.2-.9L12 3Z" />,
    task: <><rect height="18" rx="3" width="18" x="3" y="3" /><path d="m7 12 3 3 7-7" /></>,
  };
  return (
    <svg
      aria-hidden="true"
      className="genesis-workspace-icon"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      {paths[name]}
    </svg>
  );
}

function contextIcon(type: ContextEntityType): GenesisWorkspaceIconName {
  if (type === "DOCUMENT" || type === "REPORT") return "document";
  if (type === "PROJECT") return "project";
  if (type === "TASK" || type === "EVIDENCE" || type === "FINDING") return "task";
  return "database";
}

function humanContextType(type: ContextEntityType | undefined): string {
  if (!type) return "";
  return ({
    DOCUMENT: "Dokumen",
    PROJECT: "Proyek",
    TASK: "Task",
    EVIDENCE: "Evidence",
    FINDING: "Temuan",
    REPORT: "Laporan",
  } as Record<string, string>)[type] ?? type;
}

function conversationGroupLabel(group: "Today" | "Yesterday" | "Previous 7 Days" | "Older"): string {
  return {
    Today: "Hari ini",
    Yesterday: "Kemarin",
    "Previous 7 Days": "7 Hari Terakhir",
    Older: "Lebih Lama",
  }[group];
}

function conversationTime(value: string): string {
  const date = new Date(value);
  const now = new Date();
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();
  return sameDay
    ? formatClock(value)
    : new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short" }).format(date);
}

function formatClock(value: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}




