"use client";

import { useEffect, useMemo, useState } from "react";

import { navigationForSession } from "@/app/navigation";
import { AppShell } from "@/components/app-shell/app-shell";
import { Button, PageHeader, Tabs, type DataTableColumn, type TabItem } from "@/components/ui";
import type { SessionProjection } from "@/features/session";
import { hasExecutiveContext } from "@/features/executive";
import { ApiError, sessionApiRequest } from "@/lib/api";

import { WorkEmptyState } from "../shared/empty-states/work-empty-state";
import { WorkErrorState } from "../shared/errors/work-error-state";
import { WorkSourceNotice } from "../shared/errors/work-source-notice";
import { WorkToolbar } from "../shared/filters/work-toolbar";
import { WorkLoading } from "../shared/loading/work-loading";
import { authoritativeSharedWorkKey } from "../shared/permissions/workspace-access";
import { WorkDataTable } from "../shared/tables/work-data-table";
import type { SourceState } from "../shared/source-state";
import { ApprovalDrawer } from "./approval-drawer";
import { ApprovalCreateDialog } from "./approval-create-dialog";
import { fetchApprovals } from "./approval-model";
import {
  ApprovalStatusBadge,
  ApprovalSubjectBadge,
} from "./approval-status";
import { hasWorkPermission } from "../shared/permissions/authority";
import type { WorkApproval } from "./approval-types";
import styles from "./approvals.module.css";

interface ApprovalsPageProps {
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

export function ApprovalsPage({ workspaceKey, embed }: ApprovalsPageProps) {
  const [session, setSession] = useState<SessionProjection | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [sessionError, setSessionError] = useState<unknown | null>(null);

  const [approvals, setApprovals] = useState<readonly WorkApproval[]>([]);
  const [approvalsLoading, setApprovalsLoading] = useState(true);
  const [backendConnected, setBackendConnected] = useState(true);
  const [backendMessage, setBackendMessage] = useState<string | null>(null);
  const [sourceState, setSourceState] = useState<SourceState>("available");

  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedApproval, setSelectedApproval] = useState<WorkApproval | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

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

  // Load Approvals from Backend
  const authoritativeWorkspaceKey = authoritativeSharedWorkKey(session, embed ? undefined : workspaceKey);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      if (!session || !authoritativeWorkspaceKey) {
        return;
      }
      setApprovalsLoading(true);
      const response = await fetchApprovals({
        search,
        status: statusFilter,
      });

      if (cancelled) return;

      setBackendConnected(response.connected);
      setBackendMessage(response.message ?? null);
      setSourceState(response.sourceState ?? (response.connected ? "available" : "unavailable"));
      setApprovals(response.data);
      setApprovalsLoading(false);
    }

    void loadData();
    return () => {
      cancelled = true;
    };
  }, [authoritativeWorkspaceKey, search, session, statusFilter]);

  const effectiveWorkspaceKey = authoritativeWorkspaceKey;

  const currentActorId =
    session?.principal && "actor" in session.principal ? session.principal.actor.actor_id : null;

  const filteredApprovals = useMemo(() => {
    return approvals.filter((a) => {
      // Tab category filtering (source-honest)
      if (activeTab === "pending") {
        if (a.status !== "PENDING") return false;
      } else if (activeTab === "requested") {
        if (currentActorId && a.requestedBy !== currentActorId) return false;
      } else if (activeTab === "approved") {
        if (a.status !== "APPROVED") return false;
      } else if (activeTab === "returned") {
        if (a.status !== "RETURNED") return false;
      } else if (activeTab === "rejected") {
        if (a.status !== "REJECTED") return false;
      } else if (activeTab === "held") {
        if (a.status !== "HELD") return false;
      } else if (activeTab === "history") {
        if (a.status === "PENDING") return false;
      }

      // Status filter
      if (statusFilter !== "ALL" && a.status !== statusFilter) {
        return false;
      }

      // Search term
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesTitle = (a.subjectTitle ?? "").toLowerCase().includes(query);
        const matchesSubjectId = a.subjectId.toLowerCase().includes(query);
        const matchesRequester = (a.requesterName ?? "").toLowerCase().includes(query);
        const matchesReason = (a.reason ?? "").toLowerCase().includes(query);
        if (!matchesTitle && !matchesSubjectId && !matchesRequester && !matchesReason) {
          return false;
        }
      }

      return true;
    });
  }, [activeTab, approvals, currentActorId, search, statusFilter]);

  const tabs: readonly TabItem[] = useMemo(
    () => [
      { id: "all", label: "Semua" },
      { id: "pending", label: "Menunggu Keputusan" },
      { id: "requested", label: "Diajukan oleh Saya" },
      { id: "approved", label: "Disetujui" },
      { id: "returned", label: "Dikembalikan" },
      { id: "rejected", label: "Ditolak" },
      { id: "held", label: "Ditahan" },
      { id: "history", label: "Riwayat" },
    ],
    [],
  );

  const columns: readonly DataTableColumn<WorkApproval>[] = useMemo(
    () => [
      {
        header: "Permintaan",
        key: "request",
        render: (a) => (
          <div className={styles.requestTitleCell}>
            <span className={styles.requestTitleText}>{a.subjectTitle ?? "Permintaan Persetujuan"}</span>
            {a.reason ? (
              <span className={styles.requestSubjectText}>{a.reason}</span>
            ) : null}
          </div>
        ),
      },
      {
        header: "Jenis",
        key: "type",
        render: (a) => <ApprovalSubjectBadge subjectType={a.subjectType} />,
      },
      {
        header: "Pengusul",
        key: "requester",
        render: (a) => a.requesterName ?? "—",
      },
      {
        header: "Ruang Kerja",
        key: "workspace",
        render: (a) => a.workspaceName ?? "—",
      },
      {
        header: "Diajukan",
        key: "requested_at",
        render: (a) => formatDate(a.requestedAt),
      },
      {
        header: "Status",
        key: "status",
        render: (a) => <ApprovalStatusBadge status={a.status} />,
      },
    ],
    [],
  );

  if (sessionLoading) {
    return <WorkLoading label="Menyiapkan data persetujuan…" />;
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
          actions={hasWorkPermission(session, "approval.request") || hasWorkPermission(session, "work.write") ? <Button onClick={() => setCreateOpen(true)}>Ajukan Persetujuan</Button> : undefined}
          description="Kelola permintaan yang membutuhkan tinjauan atau keputusan sesuai kewenangan Anda."
          eyebrow="PEKERJAAN"
          title="Persetujuan"
        />

        <WorkSourceNotice message={backendMessage} state={sourceState} subject="Persetujuan" />

        <div className={styles.tabsContainer}>
          <Tabs
            ariaLabel="Kategori persetujuan"
            items={tabs}
            onValueChange={setActiveTab}
            value={activeTab}
          />
        </div>

        <WorkToolbar
          onSearchChange={setSearch}
          onStatusChange={setStatusFilter}
          searchPlaceholder="Cari persetujuan…"
          searchValue={search}
          statusOptions={[
            { label: "Menunggu Keputusan", value: "PENDING" },
            { label: "Disetujui", value: "APPROVED" },
            { label: "Dikembalikan", value: "RETURNED" },
            { label: "Ditolak", value: "REJECTED" },
            { label: "Ditahan", value: "HELD" },
          ]}
          statusValue={statusFilter}
        />

        <WorkDataTable
          caption="Daftar Persetujuan"
          columns={columns}
          emptyState={<WorkEmptyState module="approvals" />}
          getRowKey={(a) => a.id}
          loading={approvalsLoading}
          loadingLabel="Memuat daftar persetujuan…"
          unavailable={!backendConnected || sourceState !== "available"}
          onRowClick={(a) => {
            setSelectedApproval(a);
            setDrawerOpen(true);
          }}
          rowAction={(a) => (
            <Button
              onClick={() => {
                setSelectedApproval(a);
                setDrawerOpen(true);
              }}
              size="sm"
              variant="ghost"
            >
              Lihat
            </Button>
          )}
          rows={filteredApprovals}
        />

        <ApprovalDrawer
          approval={selectedApproval}
          isConnected={backendConnected && sourceState === "available"}
          onClose={() => {
            setDrawerOpen(false);
            setSelectedApproval(null);
          }}
          open={drawerOpen}
          workspaceKey={effectiveWorkspaceKey}
        />
        <ApprovalCreateDialog
          onClose={() => setCreateOpen(false)}
          onCreated={(created) => setApprovals((current) => [created, ...current])}
          open={createOpen}
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
