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
import { FindingDrawer } from "./finding-drawer";
import { fetchFindings } from "./finding-model";
import { FindingSeverityBadge, FindingStatusBadge } from "./finding-status";
import type { WorkFinding } from "./finding-types";
import styles from "./findings.module.css";

interface FindingsPageProps {
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

export function FindingsPage({ workspaceKey, embed }: FindingsPageProps) {
  const [session, setSession] = useState<SessionProjection | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [sessionError, setSessionError] = useState<unknown | null>(null);

  const [findings, setFindings] = useState<readonly WorkFinding[]>([]);
  const [findingsLoading, setFindingsLoading] = useState(true);
  const [backendConnected, setBackendConnected] = useState(true);
  const [backendMessage, setBackendMessage] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedFinding, setSelectedFinding] = useState<WorkFinding | null>(null);
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

  // Load Findings from Backend
  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setFindingsLoading(true);
      const response = await fetchFindings({
        search,
        status: statusFilter,
        workspaceKey: workspaceKey ?? undefined,
      });

      if (cancelled) return;

      setBackendConnected(response.connected);
      setBackendMessage(response.message ?? null);
      setFindings(response.data);
      setFindingsLoading(false);
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

  const filteredFindings = useMemo(() => {
    return findings.filter((f) => {
      // Tab filter
      if (activeTab === "open") {
        if (f.status !== "OPEN") return false;
      } else if (activeTab === "assigned_to_me") {
        if (currentActorId && f.ownerActorId !== currentActorId) return false;
      } else if (activeTab === "critical") {
        if (f.severity !== "CRITICAL") return false;
      } else if (activeTab === "pending_verification") {
        if (f.status !== "PENDING_VERIFICATION") return false;
      } else if (activeTab === "closed") {
        if (f.status !== "CLOSED") return false;
      }

      // Status filter
      if (statusFilter !== "ALL" && f.status !== statusFilter) {
        return false;
      }

      // Search term
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesTitle = f.title.toLowerCase().includes(query);
        const matchesSource = f.sourceType.toLowerCase().includes(query);
        const matchesOwner = (f.ownerName ?? "").toLowerCase().includes(query);
        const matchesProject = (f.projectName ?? "").toLowerCase().includes(query);
        if (!matchesTitle && !matchesSource && !matchesOwner && !matchesProject) {
          return false;
        }
      }

      return true;
    });
  }, [activeTab, currentActorId, findings, search, statusFilter]);

  const tabs: readonly TabItem[] = useMemo(
    () => [
      { id: "all", label: "Semua" },
      { id: "open", label: "Terbuka" },
      { id: "assigned_to_me", label: "Ditugaskan ke Saya" },
      { id: "critical", label: "Kritis" },
      { id: "pending_verification", label: "Menunggu Verifikasi" },
      { id: "closed", label: "Ditutup" },
    ],
    [],
  );

  const columns: readonly DataTableColumn<WorkFinding>[] = useMemo(
    () => [
      {
        header: "Temuan",
        key: "title",
        render: (f) => (
          <div className={styles.findingTitleCell}>
            <span className={styles.findingTitleText}>{f.title}</span>
            {f.category ? <span className={styles.findingCategoryText}>{f.category}</span> : null}
          </div>
        ),
      },
      {
        header: "Tingkat",
        key: "severity",
        render: (f) => <FindingSeverityBadge severity={f.severity} />,
      },
      {
        header: "Sumber",
        key: "source_type",
        render: (f) => f.sourceType,
      },
      {
        header: "Proyek",
        key: "project",
        render: (f) => f.projectName ?? (f.projectId ? "Proyek terkait" : "—"),
      },
      {
        header: "Pemilik",
        key: "owner",
        render: (f) => f.ownerName ?? "—",
      },
      {
        header: "Status",
        key: "status",
        render: (f) => <FindingStatusBadge status={f.status} />,
      },
      {
        header: "Ditemukan",
        key: "identified_at",
        render: (f) => formatDate(f.identifiedAt),
      },
      {
        header: "Tenggat",
        key: "due_date",
        render: (f) => formatDate(f.dueDate),
      },
    ],
    [],
  );

  if (sessionLoading) {
    return <WorkLoading label="Menyiapkan data temuan…" />;
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

  const innerContent = (
    <div className={styles.pageContainer}>
        <PageHeader
          description="Kelola masalah, ketidaksesuaian, dan tindak lanjut yang memerlukan perhatian."
          eyebrow="PEKERJAAN"
          title="Temuan"
        />

        {!backendConnected ? (
          <div className={styles.noticeContainer}>
            <Alert
              icon={<AlertCircle size={18} strokeWidth={2} />}
              message={
                backendMessage ??
                "Data temuan belum terhubung. Daftar temuan akan ditampilkan setelah sumber data tersedia."
              }
              title="Data Temuan Belum Terhubung"
              variant="neutral"
            />
          </div>
        ) : null}

        <div className={styles.tabsContainer}>
          <Tabs
            ariaLabel="Kategori temuan"
            items={tabs}
            onValueChange={setActiveTab}
            value={activeTab}
          />
        </div>

        <WorkToolbar
          onSearchChange={setSearch}
          onStatusChange={setStatusFilter}
          searchPlaceholder="Cari temuan…"
          searchValue={search}
          statusOptions={[
            { label: "Terbuka", value: "OPEN" },
            { label: "Dalam Peninjauan", value: "IN_REVIEW" },
            { label: "Ditugaskan", value: "ASSIGNED" },
            { label: "Dalam Perbaikan", value: "IN_PROGRESS" },
            { label: "Menunggu Verifikasi", value: "PENDING_VERIFICATION" },
            { label: "Terverifikasi", value: "VERIFIED" },
            { label: "Ditutup", value: "CLOSED" },
          ]}
          statusValue={statusFilter}
        />

        <WorkDataTable
          caption="Daftar Temuan"
          columns={columns}
          emptyState={<WorkEmptyState module="findings" />}
          getRowKey={(f) => f.id}
          loading={findingsLoading}
          loadingLabel="Memuat daftar temuan…"
          onRowClick={(f) => {
            setSelectedFinding(f);
            setDrawerOpen(true);
          }}
          rowAction={(f) => (
            <Button
              onClick={() => {
                setSelectedFinding(f);
                setDrawerOpen(true);
              }}
              size="sm"
              variant="ghost"
            >
              Lihat
            </Button>
          )}
          rows={filteredFindings}
        />

        <FindingDrawer
          finding={selectedFinding}
          isConnected={backendConnected}
          onClose={() => {
            setDrawerOpen(false);
            setSelectedFinding(null);
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
      navigationSections={navigationForSession(canOpenExecutive, effectiveWorkspaceKey)}
      session={session}
    >
      {innerContent}
    </AppShell>
  );
}
