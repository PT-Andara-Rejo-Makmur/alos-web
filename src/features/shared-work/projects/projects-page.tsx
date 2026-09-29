"use client";

import { AlertCircle, Plus } from "lucide-react";
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
import { canCreateProject } from "../shared/permissions/authority";
import { authoritativeSharedWorkKey } from "../shared/permissions/workspace-access";
import { ProjectStatusBadge } from "../shared/status/project-status";
import { WorkDataTable } from "../shared/tables/work-data-table";
import { ProjectDrawer } from "./project-drawer";
import { fetchProjects } from "./project-model";
import type { WorkProject } from "./project-types";
import styles from "./projects.module.css";

interface ProjectsPageProps {
  readonly workspaceKey?: string | null;
  readonly embed?: boolean;
}

function formatDateRange(start: string | null, end: string | null): string {
  if (!start && !end) return "—";
  const format = (dateStr: string | null) => {
    if (!dateStr) return "—";
    try {
      const d = new Date(dateStr);
      if (Number.isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
    } catch {
      return dateStr;
    }
  };
  if (start && end) return `${format(start)} – ${format(end)}`;
  if (start) return `Mulai ${format(start)}`;
  return `Target ${format(end)}`;
}

export function ProjectsPage({ workspaceKey, embed }: ProjectsPageProps) {
  const [session, setSession] = useState<SessionProjection | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [sessionError, setSessionError] = useState<unknown | null>(null);

  const [projects, setProjects] = useState<readonly WorkProject[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [backendConnected, setBackendConnected] = useState(true);
  const [backendMessage, setBackendMessage] = useState<string | null>(null);
  const [sourceState, setSourceState] = useState<"available" | "unavailable" | "error">("available");

  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedProject, setSelectedProject] = useState<WorkProject | null>(null);
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

  // Load Projects from Backend only after the session has validated the route boundary.
  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      if (!session || !authoritativeWorkspaceKey) {
        return;
      }
      setProjectsLoading(true);
      const response = await fetchProjects({
        search,
        status: statusFilter,
        workspaceKey: authoritativeWorkspaceKey,
      });

      if (cancelled) return;

      setBackendConnected(response.connected);
      setBackendMessage(response.message ?? null);
      setSourceState(response.sourceState ?? (response.connected ? "available" : "unavailable"));
      setProjects(response.data);
      setProjectsLoading(false);
    }

    void loadData();
    return () => {
      cancelled = true;
    };
  }, [authoritativeWorkspaceKey, search, session, statusFilter]);

  const effectiveWorkspaceKey = authoritativeWorkspaceKey;

  const canCreate = useMemo(() => canCreateProject(session), [session]);

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      if (activeTab === "active" && project.status !== "ACTIVE") return false;
      if (activeTab === "completed" && project.status !== "COMPLETED") return false;
      if (activeTab === "archived" && project.status !== "ARCHIVED") return false;
      if (activeTab === "at_risk" && project.riskLevel !== "TINGGI" && project.riskLevel !== "KRITIS")
        return false;
      if (activeTab === "my" && session?.principal && "actor" in session.principal) {
        if (project.ownerActorId !== session.principal.actor.actor_id) return false;
      }
      return true;
    });
  }, [projects, activeTab, session]);

  const columns: readonly DataTableColumn<WorkProject>[] = useMemo(
    () => [
      {
        header: "Kode",
        key: "code",
        render: (p) => <span className={styles.projectCodeBadge}>{p.code}</span>,
      },
      {
        header: "Nama Proyek",
        key: "name",
        render: (p) => (
          <div className={styles.projectNameCell}>
            <span className={styles.projectNameText}>{p.name}</span>
            {p.description ? (
              <span className={styles.projectDescText}>{p.description}</span>
            ) : null}
          </div>
        ),
      },
      {
        header: "Pemilik",
        key: "owner",
        render: (p) => p.ownerName ?? "—",
      },
      {
        header: "Workspace",
        key: "workspace",
        render: (p) => p.workspaceName ?? "—",
      },
      {
        header: "Periode",
        key: "period",
        render: (p) => formatDateRange(p.startDate, p.targetEndDate),
      },
      {
        header: "Status",
        key: "status",
        render: (p) => <ProjectStatusBadge status={p.status} />,
      },
      {
        header: "Progres",
        key: "progress",
        render: (p) => {
          if (p.progressPercentage === null || p.progressPercentage === undefined) {
            return "—";
          }
          return (
            <div className={styles.progressContainer}>
              <div aria-hidden="true" className={styles.progressBarBg}>
                <div
                  className={styles.progressBarFill}
                  style={{ width: `${Math.min(100, Math.max(0, p.progressPercentage))}%` }}
                />
              </div>
              <span className={styles.progressLabel}>{p.progressPercentage}%</span>
            </div>
          );
        },
      },
    ],
    [],
  );

  const tabs: readonly TabItem[] = [
    { id: "all", label: "Semua" },
    { id: "my", label: "Proyek Saya" },
    { id: "active", label: "Berjalan" },
    { id: "at_risk", label: "Berisiko" },
    { id: "completed", label: "Selesai" },
    { id: "archived", label: "Diarsipkan" },
  ];

  if (sessionLoading) {
    return <WorkLoading label="Menyiapkan sesi pengguna…" />;
  }

  if (sessionError) {
    return <WorkErrorState error={sessionError} />;
  }

  if (!session || !session.authenticated) {
    return (
      <WorkErrorState
        error={new ApiError(401, "Sesi Anda sudah berakhir. Silakan masuk kembali.", null)}
        title="Autentikasi Diperlukan"
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
              <Button iconBefore={<Plus size={16} strokeWidth={2} />} variant="primary">
                Tambah Proyek
              </Button>
            ) : undefined
          }
          description="Kelola proyek dan program kerja yang dapat Anda akses."
          eyebrow="PEKERJAAN"
          title="Proyek"
        />

        {sourceState === "error" ? (
          <div className={styles.noticeContainer}>
            <Alert message={backendMessage ?? "Data proyek belum dapat dimuat. Silakan coba kembali."} title="Data Proyek Belum Dapat Dimuat" variant="danger" />
          </div>
        ) : !backendConnected ? (
          <div className={styles.noticeContainer}>
            <Alert
              icon={<AlertCircle size={18} strokeWidth={2} />}
              message={
                backendMessage ??
                "Data proyek belum terhubung. Daftar proyek akan ditampilkan setelah sumber data tersedia."
              }
              title="Data Proyek Belum Terhubung"
              variant="neutral"
            />
          </div>
        ) : null}

        <div className={styles.tabsContainer}>
          <Tabs
            ariaLabel="Kategori proyek"
            items={tabs}
            onValueChange={setActiveTab}
            value={activeTab}
          />
        </div>

        <WorkToolbar
          onSearchChange={setSearch}
          onStatusChange={setStatusFilter}
          searchPlaceholder="Cari proyek atau kode…"
          searchValue={search}
          statusOptions={[
            { label: "Direncanakan", value: "PLANNED" },
            { label: "Berjalan", value: "ACTIVE" },
            { label: "Ditahan", value: "ON_HOLD" },
            { label: "Selesai", value: "COMPLETED" },
            { label: "Dibatalkan", value: "CANCELLED" },
            { label: "Diarsipkan", value: "ARCHIVED" },
          ]}
          statusValue={statusFilter}
        />

        <WorkDataTable
          caption="Daftar Proyek"
          columns={columns}
          emptyState={<WorkEmptyState module="projects" />}
          getRowKey={(p) => p.id}
          loading={projectsLoading}
          loadingLabel="Memuat daftar proyek…"
          unavailable={!backendConnected || sourceState === "error"}
          onRowClick={(p) => {
            setSelectedProject(p);
            setDrawerOpen(true);
          }}
          rowAction={(p) => (
            <Button
              onClick={() => {
                setSelectedProject(p);
                setDrawerOpen(true);
              }}
              size="sm"
              variant="ghost"
            >
              Lihat
            </Button>
          )}
          rows={filteredProjects}
        />

        <ProjectDrawer
          isConnected={backendConnected && sourceState !== "error"}
          onClose={() => {
            setDrawerOpen(false);
            setSelectedProject(null);
          }}
          open={drawerOpen}
          project={selectedProject}
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
