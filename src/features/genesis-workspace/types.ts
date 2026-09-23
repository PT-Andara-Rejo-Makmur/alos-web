import { ApiError } from "@/lib/api";

export type ContextEntityType = "DOCUMENT" | "PROJECT" | "TASK" | "EVIDENCE" | "FINDING" | "REPORT";

export type GenesisConversation = {
  conversation_id: string;
  workspace_id: string | null;
  title: string | null;
  context_mode: "AUTO" | "INTERNAL" | "EXTERNAL" | "INTERNAL_AND_EXTERNAL";
  status: "OPEN" | "CLOSED";
  created_at: string;
  updated_at: string | null;
  last_message_preview?: string | null;
};

export type GenesisContextOption = {
  entity_type: ContextEntityType;
  entity_id: string;
  title: string;
  source_version: string | null;
  status: string;
  scope: string;
};

export type GenesisConversationContext = {
  conversation_context_id: string;
  conversation_id: string;
  entity_type: ContextEntityType;
  entity_id: string;
  source_version: string | null;
  created_at: string;
};

export type GenesisActiveAgent = {
  agent_key: string;
  name: string;
  semantic_version: string;
  purpose: string;
  risk_level: string;
  division_scope: string[];
  capability_keys: string[];
};

export type GenesisUiError = {
  title: string;
  reason: string;
  nextAction: string;
  correlationId: string | null;
};

export type ConversationGroup = "Today" | "Yesterday" | "Previous 7 Days" | "Older";

export function conversationGroup(value: string, now = new Date()): ConversationGroup {
  const updated = new Date(value);
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const item = new Date(updated.getFullYear(), updated.getMonth(), updated.getDate()).getTime();
  const days = Math.floor((start - item) / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days <= 7) return "Previous 7 Days";
  return "Older";
}

export function groupConversations(items: GenesisConversation[], now = new Date()) {
  const groups: Record<ConversationGroup, GenesisConversation[]> = {
    Today: [], Yesterday: [], "Previous 7 Days": [], Older: [],
  };
  for (const item of items) groups[conversationGroup(item.updated_at ?? item.created_at, now)].push(item);
  return groups;
}

export function normalizeGenesisError(error: unknown): GenesisUiError {
  if (error instanceof ApiError) {
    const detail = safeDetail(error.detail);
    if (detail === "selected Agent is no longer ACTIVE or is outside the actor scope") {
      return { title: "Agent tidak dapat digunakan", reason: "Agent sudah tidak ACTIVE atau berada di luar scope Anda.", nextAction: "Pilih Agent ACTIVE lain atau buka Governance.", correlationId: error.correlationId };
    }
    if (detail.includes("context is outside") || detail.includes("outside the actor scope")) {
      return { title: "Context gagal dilampirkan", reason: "Entitas berada di luar scope akses Anda.", nextAction: "Pilih context lain yang tersedia pada picker.", correlationId: error.correlationId };
    }
    if (error.status === 409) return { title: "Data telah berubah", reason: detail, nextAction: "Daftar telah dimuat ulang. Periksa state terbaru lalu ulangi bila masih relevan.", correlationId: error.correlationId };
    if (error.status === 403) return { title: "Aksi tidak diizinkan", reason: detail, nextAction: "Pilih data dalam scope Anda atau gunakan role yang berwenang.", correlationId: error.correlationId };
    if (error.status === 422) return { title: "Input belum valid", reason: detail, nextAction: "Periksa field yang ditandai lalu kirim kembali.", correlationId: error.correlationId };
    if (error.status >= 500) return { title: "Layanan GENESIS tidak tersedia", reason: "Server tidak dapat menyelesaikan permintaan tanpa mengekspos detail internal.", nextAction: "Coba kembali; jika berulang berikan Reference ID kepada IT Lead.", correlationId: error.correlationId };
    return { title: "Permintaan tidak berhasil", reason: detail, nextAction: "Muat ulang data lalu coba kembali.", correlationId: error.correlationId };
  }
  return { title: "Permintaan tidak berhasil", reason: error instanceof Error ? error.message : "Kegagalan tidak dikenali.", nextAction: "Periksa input lalu coba kembali.", correlationId: null };
}

export function canTestActiveAgent(roles: string[]): boolean {
  return roles.some((role) => ["IT_ADMIN", "AI_ADMIN"].includes(role));
}

export function canManageDraftAgent(roles: string[]): boolean {
  return roles.includes("IT_ADMIN");
}

export function contextHref(type: ContextEntityType): string {
  return { DOCUMENT: "/documents", PROJECT: "/projects", TASK: "/tasks", EVIDENCE: "/evidence", FINDING: "/findings", REPORT: "/reports" }[type];
}

function safeDetail(detail: string): string {
  return /stack|traceback|postgres|sql|database_url|password|secret|api[_ -]?key/i.test(detail)
    ? "Server menolak aksi tanpa mengekspos detail internal."
    : detail;
}
