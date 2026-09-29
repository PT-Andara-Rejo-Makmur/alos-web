"use client";

import { Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { navigationForSession } from "@/app/navigation";
import { AppShell } from "@/components/app-shell/app-shell";
import { Alert, Button, PageHeader, Tabs, type DataTableColumn, type TabItem } from "@/components/ui";
import type { SessionProjection } from "@/features/session";
import { hasExecutiveContext } from "@/features/executive";
import { ApiError, sessionApiRequest } from "@/lib/api";

import { WorkEmptyState } from "../shared/empty-states/work-empty-state";
import { WorkErrorState } from "../shared/errors/work-error-state";
import { WorkSourceNotice } from "../shared/errors/work-source-notice";
import { WorkToolbar } from "../shared/filters/work-toolbar";
import { WorkLoading } from "../shared/loading/work-loading";
import { canCreateTask } from "../shared/permissions/authority";
import { authoritativeSharedWorkKey } from "../shared/permissions/workspace-access";
import { WorkDataTable } from "../shared/tables/work-data-table";
import type { SourceState } from "../shared/source-state";
import { TaskDrawer } from "./task-drawer";
import { fetchTasks } from "./task-model";
import { formatTaskDueDate, isTaskOverdue, TaskPriorityBadge, TaskStatusBadge } from "./task-status";
import type { WorkTask } from "./task-types";
import styles from "./tasks.module.css";

interface TasksPageProps {
  readonly workspaceKey?: string | null;
  readonly embed?: boolean;
}

export function TasksPage({ workspaceKey, embed }: TasksPageProps) {
  const [session, setSession] = useState<SessionProjection | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [sessionError, setSessionError] = useState<unknown | null>(null);

  const [tasks, setTasks] = useState<readonly WorkTask[]>([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [backendConnected, setBackendConnected] = useState(true);
  const [backendMessage, setBackendMessage] = useState<string | null>(null);
  const [sourceState, setSourceState] = useState<SourceState>("available");

  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [selectedTask, setSelectedTask] = useState<WorkTask | null>(null);
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

  // Load Tasks from Backend only after the session has validated the route boundary.
  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      if (!session || !authoritativeWorkspaceKey) {
        return;
      }
      setTasksLoading(true);
      const response = await fetchTasks({
        priority: priorityFilter,
        search,
        status: statusFilter,
        workspaceKey: authoritativeWorkspaceKey,
      });

      if (cancelled) return;

      setBackendConnected(response.connected);
      setBackendMessage(response.message ?? null);
      setSourceState(response.sourceState ?? (response.connected ? "available" : "unavailable"));
      setTasks(response.data);
      setTasksLoading(false);
    }

    void loadData();
    return () => {
      cancelled = true;
    };
  }, [authoritativeWorkspaceKey, priorityFilter, search, session, statusFilter]);

  const effectiveWorkspaceKey = authoritativeWorkspaceKey;

  const currentActorId =
    session?.principal && "actor" in session.principal ? session.principal.actor.actor_id : null;

  const canCreate = useMemo(() => canCreateTask(session), [session]);

  const filteredTasks = useMemo(() => {
    if (activeTab === "team") return [];
    return tasks.filter((t) => {
      // Tab category filtering (source-honest)
      if (activeTab === "my_tasks") {
        if (!currentActorId || t.ownerActorId !== currentActorId) return false;
      } else if (activeTab === "assigned_by_me") {
        if (!currentActorId || t.createdBy !== currentActorId) return false;
      } else if (activeTab === "overdue") {
        if (!isTaskOverdue(t.dueAt, t.status)) return false;
      }

      // Status filter
      if (statusFilter !== "ALL" && t.status !== statusFilter) {
        return false;
      }

      // Priority filter
      if (priorityFilter !== "ALL" && t.priority !== priorityFilter) {
        return false;
      }

      // Search term
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesTitle = t.title.toLowerCase().includes(query);
        const matchesDesc = (t.description ?? "").toLowerCase().includes(query);
        const matchesProject = (t.projectName ?? "").toLowerCase().includes(query);
        const matchesOwner = (t.ownerName ?? "").toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc && !matchesProject && !matchesOwner) {
          return false;
        }
      }

      return true;
    });
  }, [activeTab, currentActorId, priorityFilter, search, statusFilter, tasks]);

  const tabs: readonly TabItem[] = useMemo(
    () => [
      { id: "all", label: "Semua" },
      { id: "my_tasks", label: "Tugas Saya" },
      { id: "assigned_by_me", label: "Ditugaskan oleh Saya" },
      { id: "team", label: "Tim" },
      { id: "overdue", label: "Terlambat" },
    ],
    [],
  );

  const columns: readonly DataTableColumn<WorkTask>[] = useMemo(
    () => [
      {
        header: "Tugas",
        key: "task",
        render: (t) => (
          <div className={styles.taskTitleCell}>
            <span className={styles.taskTitleText}>{t.title}</span>
            {t.description ? (
              <span className={styles.taskDescText}>{t.description}</span>
            ) : null}
          </div>
        ),
      },
      {
        header: "Proyek",
        key: "project",
        render: (t) => t.projectName ?? (t.projectId ? "Proyek terkait" : "—"),
      },
      {
        header: "Pemilik",
        key: "owner",
        render: (t) => t.ownerName ?? "—",
      },
      {
        header: "Prioritas",
        key: "priority",
        render: (t) => <TaskPriorityBadge priority={t.priority} />,
      },
      {
        header: "Status",
        key: "status",
        render: (t) => <TaskStatusBadge status={t.status} />,
      },
      {
        header: "Tenggat",
        key: "due",
        render: (t) => {
          const dueInfo = formatTaskDueDate(t.dueAt, t.status);
          return (
            <span className={dueInfo.isOverdue ? styles.overdueDate : styles.normalDate}>
              {dueInfo.text}
            </span>
          );
        },
      },
      {
        header: "Workspace",
        key: "workspace",
        render: (t) => t.workspaceName ?? "—",
      },
    ],
    [],
  );

  if (sessionLoading) {
    return <WorkLoading label="Menyiapkan data tugas…" />;
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
          actions={
            canCreate ? (
              <Button
                disabled
                iconBefore={<Plus size={16} strokeWidth={2} />}
                variant="primary"
              >
                Tambah Tugas — Belum Tersedia
              </Button>
            ) : undefined
          }
          description="Kelola pekerjaan yang ditugaskan kepada Anda dan tim."
          eyebrow="PEKERJAAN"
          title="Tugas"
        />

        <WorkSourceNotice message={backendMessage} state={sourceState} subject="Tugas" />

        <div className={styles.tabsContainer}>
          <Tabs
            ariaLabel="Kategori tugas"
            items={tabs}
            onValueChange={setActiveTab}
            value={activeTab}
          />
        </div>

        {activeTab === "team" ? (
          <div className={styles.noticeContainer}>
            <Alert
              message="Data tugas tim akan tersedia setelah sumber scope tim terhubung."
              title="Tugas Tim Belum Terhubung"
              variant="neutral"
            />
          </div>
        ) : null}

        <WorkToolbar
          onPriorityChange={setPriorityFilter}
          onSearchChange={setSearch}
          onStatusChange={setStatusFilter}
          priorityOptions={[
            { label: "Rendah", value: "LOW" },
            { label: "Normal", value: "NORMAL" },
            { label: "Tinggi", value: "HIGH" },
            { label: "Kritis", value: "CRITICAL" },
          ]}
          priorityValue={priorityFilter}
          searchPlaceholder="Cari tugas…"
          searchValue={search}
          statusOptions={[
            { label: "Belum Dimulai", value: "OPEN" },
            { label: "Dalam Proses", value: "IN_PROGRESS" },
            { label: "Terhambat", value: "BLOCKED" },
            { label: "Menunggu Review", value: "UNDER_REVIEW" },
            { label: "Selesai", value: "COMPLETED" },
            { label: "Dibatalkan", value: "CANCELLED" },
          ]}
          statusValue={statusFilter}
        />

        <WorkDataTable
          caption="Daftar Tugas"
          columns={columns}
          emptyState={
            <WorkEmptyState
              module="tasks"
              title={activeTab === "overdue" ? "Tidak ada tugas yang terlambat." : undefined}
            />
          }
          getRowKey={(t) => t.id}
          loading={tasksLoading}
          loadingLabel="Memuat daftar tugas…"
          unavailable={!backendConnected || sourceState !== "available" || activeTab === "team"}
          onRowClick={(t) => {
            setSelectedTask(t);
            setDrawerOpen(true);
          }}
          rowAction={(t) => (
            <Button
              onClick={() => {
                setSelectedTask(t);
                setDrawerOpen(true);
              }}
              size="sm"
              variant="ghost"
            >
              Lihat
            </Button>
          )}
          rows={filteredTasks}
        />

        <TaskDrawer
          isConnected={backendConnected && sourceState === "available"}
          onClose={() => {
            setDrawerOpen(false);
            setSelectedTask(null);
          }}
          open={drawerOpen}
          task={selectedTask}
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
