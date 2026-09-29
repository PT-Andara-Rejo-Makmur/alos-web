"use client";

import { AlertCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { navigationForSession } from "@/app/navigation";
import { AppShell } from "@/components/app-shell/app-shell";
import { Alert, Button, PageHeader, Tabs, type DataTableColumn, type TabItem } from "@/components/ui";
import type { SessionProjection } from "@/features/session";
import { hasExecutiveContext } from "@/features/executive";
import { ApiError, sessionApiRequest } from "@/lib/api";

import { WorkEmptyState } from "../shared/empty-states/work-empty-state";
import { WorkErrorState } from "../shared/errors/work-error-state";
import { WorkToolbar } from "../shared/filters/work-toolbar";
import { WorkLoading } from "../shared/loading/work-loading";
import { authoritativeSharedWorkKey } from "../shared/permissions/workspace-access";
import { DataClassificationBadge } from "../shared/status/work-status";
import { WorkDataTable } from "../shared/tables/work-data-table";
import { DocumentDrawer } from "./document-drawer";
import { fetchDocuments } from "./document-model";
import { DocumentStatusBadge, isDocumentExpired } from "./document-status";
import type { WorkDocument } from "./document-types";
import styles from "./documents.module.css";

interface DocumentsPageProps {
  readonly workspaceKey?: string | null;
  readonly embed?: boolean;
}

function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "—";
  try {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
}

export function DocumentsPage({ workspaceKey, embed }: DocumentsPageProps) {
  const [session, setSession] = useState<SessionProjection | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [sessionError, setSessionError] = useState<unknown | null>(null);

  const [documents, setDocuments] = useState<readonly WorkDocument[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(true);
  const [backendConnected, setBackendConnected] = useState(true);
  const [backendMessage, setBackendMessage] = useState<string | null>(null);
  const [sourceState, setSourceState] = useState<"available" | "unavailable" | "error">("available");

  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedDocument, setSelectedDocument] = useState<WorkDocument | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Load Session Context
  useEffect(() => {
    let cancelled = false;

    async function loadSession() {
      try {
        const nextSession = await sessionApiRequest<SessionProjection>("/");
        if (cancelled) return;
        setSession(nextSession);
        setSessionLoading(false);
      } catch (err) {
        if (!cancelled) {
          setSessionError(err);
          setSessionLoading(false);
        }
      }
    }

    void loadSession();
    return () => {
      cancelled = true;
    };
  }, []);

  const authoritativeWorkspaceKey = authoritativeSharedWorkKey(session, embed ? undefined : workspaceKey);

  // Load Documents from Backend only after the session has validated the route boundary.
  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      if (!session || !authoritativeWorkspaceKey) {
        return;
      }
      setDocumentsLoading(true);
      const response = await fetchDocuments({
        search,
        status: statusFilter,
        workspaceKey: authoritativeWorkspaceKey,
      });

      if (cancelled) return;

      setBackendConnected(response.connected);
      setBackendMessage(response.message ?? null);
      setSourceState(response.sourceState ?? (response.connected ? "available" : "unavailable"));
      setDocuments(response.data);
      setDocumentsLoading(false);
    }

    void loadData();
    return () => {
      cancelled = true;
    };
  }, [authoritativeWorkspaceKey, search, session, statusFilter]);

  const effectiveWorkspaceKey = authoritativeWorkspaceKey;

  const currentActorId =
    session?.principal && "actor" in session.principal ? session.principal.actor.actor_id : null;

  const filteredDocuments = useMemo(() => {
    return documents.filter((d) => {
      // Tab category filtering (source-honest)
      if (activeTab === "my_documents") {
        if (currentActorId && d.ownerActorId !== currentActorId) return false;
      } else if (activeTab === "in_review") {
        if (d.status !== "IN_REVIEW") return false;
      } else if (activeTab === "approved") {
        if (d.status !== "APPROVED") return false;
      } else if (activeTab === "expired") {
        if (!isDocumentExpired(d.expiryDate)) return false;
      } else if (activeTab === "retired") {
        if (d.status !== "RETIRED") return false;
      }

      // Status filter
      if (statusFilter !== "ALL" && d.status !== statusFilter) {
        return false;
      }

      // Search term
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesTitle = d.title.toLowerCase().includes(query);
        const matchesCategory = d.category.toLowerCase().includes(query);
        const matchesOwner = (d.ownerName ?? "").toLowerCase().includes(query);
        const matchesProject = (d.projectName ?? "").toLowerCase().includes(query);
        if (!matchesTitle && !matchesCategory && !matchesOwner && !matchesProject) {
          return false;
        }
      }

      return true;
    });
  }, [activeTab, currentActorId, documents, search, statusFilter]);

  const tabs: readonly TabItem[] = useMemo(
    () => [
      { id: "all", label: "Semua" },
      { id: "my_documents", label: "Milik Saya" },
      { id: "in_review", label: "Dalam Review" },
      { id: "approved", label: "Disetujui" },
      { id: "expired", label: "Kedaluwarsa" },
      { id: "retired", label: "Arsip" },
    ],
    [],
  );

  const columns: readonly DataTableColumn<WorkDocument>[] = useMemo(
    () => [
      {
        header: "Judul",
        key: "title",
        render: (d) => (
          <div className={styles.docTitleCell}>
            <span className={styles.docTitleText}>{d.title}</span>
            <span className={styles.docCategoryText}>{d.category}</span>
          </div>
        ),
      },
      {
        header: "Kategori",
        key: "category",
        render: (d) => d.category,
      },
      {
        header: "Workspace",
        key: "workspace",
        render: (d) => d.workspaceName ?? "—",
      },
      {
        header: "Pemilik",
        key: "owner",
        render: (d) => d.ownerName ?? "—",
      },
      {
        header: "Klasifikasi",
        key: "classification",
        render: (d) => <DataClassificationBadge classification={d.dataClassification} />,
      },
      {
        header: "Status",
        key: "status",
        render: (d) => <DocumentStatusBadge status={d.status} />,
      },
      {
        header: "Proyek",
        key: "project",
        render: (d) => d.projectName ?? (d.projectId ? "Proyek terkait" : "—"),
      },
      {
        header: "Dibuat",
        key: "created_at",
        render: (d) => formatDate(d.createdAt),
      },
    ],
    [],
  );

  if (sessionLoading) {
    return <WorkLoading label="Menyiapkan data dokumen…" />;
  }

  if (sessionError || !session) {
    if (sessionError instanceof ApiError && sessionError.status === 401) {
      return (
        <WorkErrorState
          error={sessionError}
          onRetry={() => window.location.reload()}
          title="Sesi Berakhir"
        />
      );
    }
    return (
      <WorkErrorState
        error={sessionError}
        onRetry={() => window.location.reload()}
        title="Akses Ditolak"
      />
    );
  }

  if (!effectiveWorkspaceKey) {
    return <WorkErrorState error={new Error("Workspace route tidak sesuai dengan active workspace.")} title="Akses Ditolak" />;
  }

  const canOpenExecutive = hasExecutiveContext(session);

  const innerContent = (
    <div className={styles.pageContainer}>
      <PageHeader
        description="Kelola dokumen kerja sesuai akses dan konteks bisnis Anda."
        eyebrow="PEKERJAAN"
        title="Dokumen"
      />

      {sourceState === "error" ? (
        <div className={styles.noticeContainer}>
          <Alert message={backendMessage ?? "Data dokumen belum dapat dimuat. Silakan coba kembali."} title="Data Dokumen Belum Dapat Dimuat" variant="danger" />
        </div>
      ) : !backendConnected ? (
        <div className={styles.noticeContainer}>
          <Alert
            icon={<AlertCircle size={18} strokeWidth={2} />}
            message={
              backendMessage ??
              "Data dokumen belum terhubung. Daftar dokumen akan ditampilkan setelah sumber data tersedia."
            }
            title="Data Dokumen Belum Terhubung"
            variant="neutral"
          />
        </div>
      ) : null}

      <div className={styles.tabsContainer}>
        <Tabs
          ariaLabel="Kategori dokumen"
          items={tabs}
          onValueChange={setActiveTab}
          value={activeTab}
        />
      </div>

      <WorkToolbar
        onSearchChange={setSearch}
        onStatusChange={setStatusFilter}
        searchPlaceholder="Cari dokumen…"
        searchValue={search}
        statusOptions={[
          { label: "Draf", value: "DRAFT" },
          { label: "Dalam Review", value: "IN_REVIEW" },
          { label: "Disetujui", value: "APPROVED" },
          { label: "Ditolak", value: "REJECTED" },
          { label: "Tidak Berlaku", value: "RETIRED" },
        ]}
        statusValue={statusFilter}
      />

      <WorkDataTable
        caption="Daftar Dokumen"
        columns={columns}
        emptyState={<WorkEmptyState module="documents" />}
        getRowKey={(d) => d.id}
        loading={documentsLoading}
        loadingLabel="Memuat daftar dokumen…"
        unavailable={!backendConnected || sourceState === "error"}
        onRowClick={(d) => {
          setSelectedDocument(d);
          setDrawerOpen(true);
        }}
        rowAction={(d) => (
          <Button
            onClick={() => {
              setSelectedDocument(d);
              setDrawerOpen(true);
            }}
            size="sm"
            variant="ghost"
          >
            Lihat
          </Button>
        )}
        rows={filteredDocuments}
      />

      <DocumentDrawer
        document={selectedDocument}
        isConnected={backendConnected && sourceState !== "error"}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedDocument(null);
        }}
        open={drawerOpen}
        workspaceKey={effectiveWorkspaceKey}
      />
    </div>
  );

  if (embed) {
    return innerContent;
  }

  return (
    <AppShell
      navigationSections={navigationForSession(canOpenExecutive, effectiveWorkspaceKey, false, session)}
      session={session}
    >
      {innerContent}
    </AppShell>
  );
}
