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
import { WorkDataTable } from "../shared/tables/work-data-table";
import { ApprovalDrawer } from "./approval-drawer";
import { fetchApprovals } from "./approval-model";
import {
  ApprovalStageBadge,
  ApprovalStatusBadge,
  ApprovalSubjectBadge,
} from "./approval-status";
import type { WorkApproval } from "./approval-types";
import styles from "./approvals.module.css";

interface ApprovalsPageProps {
  readonly workspaceKey?: string | null;
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

export function ApprovalsPage({ workspaceKey }: ApprovalsPageProps) {
  const [session, setSession] = useState<SessionProjection | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [sessionError, setSessionError] = useState<unknown | null>(null);

  const [approvals, setApprovals] = useState<readonly WorkApproval[]>([]);
  const [approvalsLoading, setApprovalsLoading] = useState(true);
  const [backendConnected, setBackendConnected] = useState(true);
  const [backendMessage, setBackendMessage] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedApproval, setSelectedApproval] = useState<WorkApproval | null>(null);
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

  // Load Approvals from Backend
  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setApprovalsLoading(true);
      const response = await fetchApprovals({
        search,
        status: statusFilter,
        workspaceKey: workspaceKey ?? undefined,
      });

      if (cancelled) return;

      setBackendConnected(response.connected);
      setBackendMessage(response.message ?? null);
      setApprovals(response.data);
      setApprovalsLoading(false);
    }

    void loadData();
    return () => {
      cancelled = true;
    };
  }, [search, statusFilter, workspaceKey]);

  const effectiveWorkspaceKey =
    workspaceKey ??
    (session?.principal && "actor" in session.principal && session.principal.active_workspace
      ? session.principal.active_workspace.workspace.workspace_key
      : null);

  const currentActorId =
    session?.principal && "actor" in session.principal ? session.principal.actor.actor_id : null;

  const filteredApprovals = useMemo(() => {
    return approvals.filter((a) => {
      // Tab category filtering (source-honest)
      if (activeTab === "pending") {
        if (a.status !== "PENDING") return false;
        if (currentActorId && a.approverActorId && a.approverActorId !== currentActorId) return false;
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
      }

      // Status filter
      if (statusFilter !== "ALL" && a.status !== statusFilter) {
        return false;
      }

      // Search term
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesTitle = (a.subjectTitle ?? "").toLowerCase().includes(query);
        const matchesRequester = (a.requesterName ?? "").toLowerCase().includes(query);
        const matchesReason = (a.reason ?? "").toLowerCase().includes(query);
        if (!matchesTitle && !matchesRequester && !matchesReason) {
          return false;
        }
      }

      return true;
    });
  }, [activeTab, approvals, currentActorId, search, statusFilter]);

  const tabs: readonly TabItem[] = useMemo(
    () => [
      { id: "all", label: "Semua" },
      { id: "pending", label: "Menunggu Saya" },
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
        header: "Workspace",
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
      {
        header: "Tahap",
        key: "stage",
        render: (a) => (
          <ApprovalStageBadge
            stage={
              a.stage ??
              (a.status === "APPROVED" || a.status === "REJECTED" ? "COMPLETED" : "APPROVAL")
            }
          />
        ),
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

  const canOpenExecutive = hasExecutiveContext(session);

  return (
    <AppShell
      navigationSections={navigationForSession(canOpenExecutive, effectiveWorkspaceKey)}
      session={session}
    >
      <div className={styles.pageContainer}>
        <PageHeader
          description="Kelola permintaan yang membutuhkan tinjauan atau keputusan sesuai kewenangan Anda."
          eyebrow="PEKERJAAN"
          title="Persetujuan"
        />

        {!backendConnected ? (
          <div className={styles.noticeContainer}>
            <Alert
              icon={<AlertCircle size={18} strokeWidth={2} />}
              message={
                backendMessage ??
                "Data persetujuan belum terhubung. Daftar persetujuan akan ditampilkan setelah sumber data tersedia."
              }
              title="Data Persetujuan Belum Terhubung"
              variant="neutral"
            />
          </div>
        ) : null}

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
          isConnected={backendConnected}
          onClose={() => {
            setDrawerOpen(false);
            setSelectedApproval(null);
          }}
          open={drawerOpen}
          workspaceKey={effectiveWorkspaceKey}
        />
      </div>
    </AppShell>
  );
}
