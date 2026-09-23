"use client";

import { useMemo, useState } from "react";
import { Plus, Search, Share2, Trash2 } from "lucide-react";

import type { AraConversation, ConversationRouteAdapter } from "./types";
import styles from "./ara-workspace.module.css";

interface AraConversationListProps {
  readonly conversations: readonly AraConversation[];
  readonly selectedConversationId: string;
  readonly onSelectConversation: (id: string) => void;
  readonly onNewConversation: () => void;
  readonly onDeleteConversation?: (conversation: AraConversation) => void;
  readonly onShareConversation?: (conversation: AraConversation) => void;
  readonly routeAdapter: ConversationRouteAdapter;
  readonly isCreating?: boolean;
  readonly isMobileDrawer?: boolean;
  readonly onCloseDrawer?: () => void;
}

export function AraConversationList({
  conversations,
  selectedConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onShareConversation,
  routeAdapter,
  isCreating = false,
  isMobileDrawer = false,
  onCloseDrawer,
}: AraConversationListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((item) =>
      (item.title || "Percakapan tanpa judul").toLowerCase().includes(q),
    );
  }, [conversations, searchQuery]);

  async function handleShare(item: AraConversation, e: React.MouseEvent) {
    e.stopPropagation();
    if (onShareConversation) {
      onShareConversation(item);
      return;
    }
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}${routeAdapter.conversationUrl(item.conversation_id)}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(item.conversation_id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Best-effort copy
    }
  }

  return (
    <aside
      className={`${styles.railSurface} ${styles.conversationRail}`}
      aria-label="Daftar Percakapan ARA"
    >
      {/* Header */}
      <div className={styles.railHeader}>
        <span className={styles.railSectionTitle}>PERCAKAPAN</span>
      </div>

      {/* New Conversation Button */}
      <button
        type="button"
        className={styles.newChatBtn}
        onClick={() => {
          onNewConversation();
          if (isMobileDrawer && onCloseDrawer) onCloseDrawer();
        }}
        disabled={isCreating}
        aria-label="Buat percakapan baru"
      >
        <Plus size={16} aria-hidden="true" />
        <span>+ Percakapan baru</span>
      </button>

      {/* Search Input */}
      <div className={styles.searchBox}>
        <Search size={14} color="#8a8275" aria-hidden="true" />
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Cari percakapan..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Cari riwayat percakapan"
        />
      </div>

      {/* Grouped Conversations */}
      <div className={styles.conversationGroups} role="feed" aria-label="Riwayat percakapan">
        <p className={styles.groupLabel}>Terbaru</p>
        {filtered.length === 0 ? (
          <p style={{ fontSize: "12px", color: "#8a8275", margin: "8px 0" }}>
            {searchQuery ? "Tidak ditemukan percakapan." : "Belum ada percakapan aktif."}
          </p>
        ) : (
          filtered.map((item) => {
            const isSelected = item.conversation_id === selectedConversationId;
            const title = item.title || "Percakapan baru";

            return (
              <div
                key={item.conversation_id}
                className={`${styles.conversationItem} ${
                  isSelected ? styles.conversationItemActive : ""
                }`}
                onClick={() => {
                  onSelectConversation(item.conversation_id);
                  if (isMobileDrawer && onCloseDrawer) onCloseDrawer();
                }}
                role="article"
                aria-current={isSelected ? "page" : undefined}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelectConversation(item.conversation_id);
                    if (isMobileDrawer && onCloseDrawer) onCloseDrawer();
                  }
                }}
              >
                <div className={styles.convContent}>
                  <p className={styles.convTitle}>{title}</p>
                  <p className={styles.convMeta}>
                    {isSelected ? "Workspace aktif" : "Evidence-aware"}
                  </p>
                </div>

                <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                  <button
                    type="button"
                    onClick={(e) => handleShare(item, e)}
                    style={{
                      border: "none",
                      background: "transparent",
                      cursor: "pointer",
                      padding: "4px",
                      color: copiedId === item.conversation_id ? "#10b981" : "#8a8275",
                    }}
                    title={
                      copiedId === item.conversation_id
                        ? "Tautan disalin!"
                        : "Salin tautan percakapan"
                    }
                    aria-label={`Salin tautan ${title}`}
                  >
                    <Share2 size={13} />
                  </button>

                  {onDeleteConversation && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteConversation(item);
                      }}
                      style={{
                        border: "none",
                        background: "transparent",
                        cursor: "pointer",
                        padding: "4px",
                        color: "#8a8275",
                      }}
                      title="Hapus percakapan"
                      aria-label={`Hapus ${title}`}
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Rail Footnote */}
      <div className={styles.railFootnote}>
        <p style={{ margin: "0 0 2px" }}>Riwayat mengikuti scope workspace.</p>
        <p style={{ margin: 0 }}>URL bukan sumber authority.</p>
      </div>

      {isMobileDrawer && onCloseDrawer && (
        <button
          type="button"
          onClick={onCloseDrawer}
          className={styles.newChatBtn}
          style={{ marginTop: "12px" }}
        >
          Tutup Riwayat
        </button>
      )}
    </aside>
  );
}
