"use client";
import { readableValue } from "@/lib/presentation";

import { Plus } from "lucide-react";
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
import { canCreateReport } from "../shared/permissions/authority";
import { authoritativeSharedWorkKey } from "../shared/permissions/workspace-access";
import { WorkDataTable } from "../shared/tables/work-data-table";
import type { SourceState } from "../shared/source-state";
import { ReportCreateDialog } from "./report-create-dialog";
import { ReportDefinitionDialog } from "./report-definition-dialog";
import { ReportDrawer } from "./report-drawer";
import { fetchReportDefinitions, fetchReportResults } from "./report-model";
import { ReportFrequencyBadge, ReportStatusBadge } from "./report-status";
import type { WorkReportDefinition, WorkReportResult } from "./report-types";
import styles from "./reports.module.css";

interface ReportsPageProps {
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

export function ReportsPage({ workspaceKey, embed }: ReportsPageProps) {
  const [session, setSession] = useState<SessionProjection | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [sessionError, setSessionError] = useState<unknown | null>(null);

  const [activePrimaryTab, setActivePrimaryTab] = useState<"results" | "definitions">("results");
  const [search, setSearch] = useState("");

  // Results state
  const [reportResults, setReportResults] = useState<readonly WorkReportResult[]>([]);
  const [resultsLoading, setResultsLoading] = useState(true);
  const [resultsConnected, setResultsConnected] = useState(true);
  const [resultsMessage, setResultsMessage] = useState<string | null>(null);
  const [resultsSourceState, setResultsSourceState] = useState<SourceState>("available");

  // Definitions state
  const [reportDefinitions, setReportDefinitions] = useState<readonly WorkReportDefinition[]>([]);
  const [definitionsLoading, setDefinitionsLoading] = useState(true);
  const [definitionsConnected, setDefinitionsConnected] = useState(true);
  const [definitionsMessage, setDefinitionsMessage] = useState<string | null>(null);
  const [definitionsSourceState, setDefinitionsSourceState] = useState<SourceState>("available");

  // Quick view drawer
  const [selectedResult, setSelectedResult] = useState<WorkReportResult | null>(null);
  const [selectedDefinition, setSelectedDefinition] = useState<WorkReportDefinition | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [definitionFormOpen, setDefinitionFormOpen] = useState(false);
  const [editingDefinition, setEditingDefinition] = useState<WorkReportDefinition | null>(null);

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

  // Load Results only after the session has validated the route boundary.
  useEffect(() => {
    let cancelled = false;

    async function loadResults() {
      if (!session || !authoritativeWorkspaceKey) {
        return;
      }
      setResultsLoading(true);
      const response = await fetchReportResults({
        search,
        workspaceKey: authoritativeWorkspaceKey,
      });

      if (cancelled) return;

      setResultsConnected(response.connected);
      setResultsMessage(response.message ?? null);
      setResultsSourceState(response.sourceState ?? (response.connected ? "available" : "unavailable"));
      setReportResults(response.data);
      setResultsLoading(false);
    }

    void loadResults();
    return () => {
      cancelled = true;
    };
  }, [authoritativeWorkspaceKey, search, session]);

  // Load Definitions
  useEffect(() => {
    let cancelled = false;

    async function loadDefs() {
      if (!session || !authoritativeWorkspaceKey) {
        return;
      }
      setDefinitionsLoading(true);
      const response = await fetchReportDefinitions({
        search,
        workspaceKey: authoritativeWorkspaceKey,
      });

      if (cancelled) return;

      setDefinitionsConnected(response.connected);
      setDefinitionsMessage(response.message ?? null);
      setDefinitionsSourceState(response.sourceState ?? (response.connected ? "available" : "unavailable"));
      setReportDefinitions(response.data);
      setDefinitionsLoading(false);
    }

    void loadDefs();
    return () => {
      cancelled = true;
    };
  }, [authoritativeWorkspaceKey, search, session]);

  const effectiveWorkspaceKey = authoritativeWorkspaceKey;

  const primaryTabs: readonly TabItem[] = useMemo(
    () => [
      { id: "results", label: "Hasil Laporan" },
      { id: "definitions", label: "Definisi Laporan" },
    ],
    [],
  );

  const filteredResults = useMemo(() => {
    if (!search.trim()) return reportResults;
    const query = search.toLowerCase();
    return reportResults.filter((r) => {
      const matchesTitle = r.title.toLowerCase().includes(query);
      const matchesType = r.reportType.toLowerCase().includes(query);
      const matchesOwner = (r.ownerName ?? "").toLowerCase().includes(query);
      return matchesTitle || matchesType || matchesOwner;
    });
  }, [reportResults, search]);

  const filteredDefinitions = useMemo(() => {
    if (!search.trim()) return reportDefinitions;
    const query = search.toLowerCase();
    return reportDefinitions.filter((d) => {
      const matchesName = d.name.toLowerCase().includes(query);
      const matchesType = d.reportType.toLowerCase().includes(query);
      const matchesOwner = (d.ownerName ?? "").toLowerCase().includes(query);
      return matchesName || matchesType || matchesOwner;
    });
  }, [reportDefinitions, search]);

  const resultColumns: readonly DataTableColumn<WorkReportResult>[] = useMemo(
    () => [
      {
        header: "Nama Laporan",
        key: "title",
        render: (r) => (
          <div className={styles.reportTitleCell}>
            <span className={styles.reportTitleText}>{r.title}</span>
            <span className={styles.reportTypeText}>{readableValue(r.reportType)}</span>
          </div>
        ),
      },
      {
        header: "Periode",
        key: "period",
        render: (r) =>
          r.periodStart || r.periodEnd
            ? `${formatDate(r.periodStart)} - ${formatDate(r.periodEnd)}`
            : "—",
      },
      {
        header: "Lingkup",
        key: "scope",
        render: (r) => r.scope ?? "—",
      },
      {
        header: "Pemilik",
        key: "owner",
        render: (r) => r.ownerName ?? "—",
      },
      {
        header: "Status",
        key: "status",
        render: (r) => <ReportStatusBadge status={r.status} />,
      },
      {
        header: "Dibuat",
        key: "created_at",
        render: (r) => formatDate(r.createdAt),
      },
      {
        header: "Diterbitkan",
        key: "published_at",
        render: (r) => formatDate(r.publishedAt),
      },
    ],
    [],
  );

  const definitionColumns: readonly DataTableColumn<WorkReportDefinition>[] = useMemo(
    () => [
      {
        header: "Nama",
        key: "name",
        render: (d) => (
          <div className={styles.reportTitleCell}>
            <span className={styles.reportTitleText}>{d.name}</span>
          </div>
        ),
      },
      {
        header: "Jenis",
        key: "report_type",
        render: (d) => d.reportType,
      },
      {
        header: "Frekuensi",
        key: "frequency",
        render: (d) => <ReportFrequencyBadge frequency={d.frequency} />,
      },
      {
        header: "Lingkup",
        key: "scope",
        render: (d) => d.scope ?? "—",
      },
      {
        header: "Pemilik",
        key: "owner",
        render: (d) => d.ownerName ?? "—",
      },
      {
        header: "Review",
        key: "review",
        render: (d) => (d.reviewRequired ? "Diperlukan" : "Tidak Diperlukan"),
      },
      {
        header: "Penerima",
        key: "recipients",
        render: (d) =>
          d.recipients && d.recipients.length > 0 ? (
            <span>{d.recipients.join(", ")}</span>
          ) : (
            "—"
          ),
      },
    ],
    [],
  );

  if (sessionLoading) {
    return <WorkLoading label="Menyiapkan data laporan…" />;
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

  const isResultsView = activePrimaryTab === "results";
  const isConnected = isResultsView ? resultsConnected : definitionsConnected;
  const connectionMessage = isResultsView ? resultsMessage : definitionsMessage;
  const isLoading = isResultsView ? resultsLoading : definitionsLoading;
  const sourceState = isResultsView ? resultsSourceState : definitionsSourceState;
  const canCreate = canCreateReport(session);

  const innerContent = (
    <div className={styles.pageContainer}>
        <PageHeader
          actions={
            canCreate ? (
              <Button
                iconBefore={<Plus size={16} strokeWidth={2} />}
                onClick={() => {
                  if (isResultsView) setCreateOpen(true);
                  else {
                    setEditingDefinition(null);
                    setDefinitionFormOpen(true);
                  }
                }}
                variant="primary"
              >
                {isResultsView ? "Tambah Laporan" : "Tambah Definisi"}
              </Button>
            ) : undefined
          }
          description="Kelola hasil laporan dan pengaturan pelaporan yang tersedia untuk ruang kerja Anda."
          eyebrow="PEKERJAAN"
          title="Laporan"
        />

        <WorkSourceNotice message={connectionMessage} state={sourceState} subject="Laporan" />

        <div className={styles.primaryTabsContainer}>
          <Tabs
            ariaLabel="Kategori laporan"
            items={primaryTabs}
            onValueChange={(tabId: string) => setActivePrimaryTab(tabId as "results" | "definitions")}
            value={activePrimaryTab}
          />
        </div>

        <WorkToolbar
          onSearchChange={setSearch}
          searchPlaceholder="Cari laporan…"
          searchValue={search}
        />

        {isResultsView ? (
          <WorkDataTable
            caption="Hasil Laporan"
            columns={resultColumns}
            emptyState={<WorkEmptyState module="reports" />}
            getRowKey={(r) => r.id}
            loading={isLoading}
            loadingLabel="Memuat hasil laporan…"
            unavailable={!isConnected || sourceState !== "available"}
            onRowClick={(row) => {
              setSelectedResult(row);
              setSelectedDefinition(null);
              setDrawerOpen(true);
            }}
            rowAction={(row) => (
              <Button
                onClick={() => {
                  setSelectedResult(row);
                  setSelectedDefinition(null);
                  setDrawerOpen(true);
                }}
                size="sm"
                variant="ghost"
              >
                Lihat
              </Button>
            )}
            rows={filteredResults}
          />
        ) : (
          <WorkDataTable
            caption="Definisi Laporan"
            columns={definitionColumns}
            emptyState={<WorkEmptyState module="reports" />}
            getRowKey={(d) => d.id}
            loading={isLoading}
            loadingLabel="Memuat definisi laporan…"
            unavailable={!isConnected || sourceState !== "available"}
            onRowClick={(row) => {
              setSelectedDefinition(row);
              setSelectedResult(null);
              setDrawerOpen(true);
            }}
            rowAction={(row) => (
              <div>
                <Button
                  onClick={() => {
                    setSelectedDefinition(row);
                    setSelectedResult(null);
                    setDrawerOpen(true);
                  }}
                  size="sm" variant="ghost"
                >Lihat</Button>
                {canCreate && session.principal && "actor" in session.principal &&
                  session.principal.actor.actor_id === row.ownerActorId ? (
                  <Button onClick={() => {
                    setEditingDefinition(row);
                    setDefinitionFormOpen(true);
                  }} size="sm" variant="ghost">Ubah</Button>
                ) : null}
              </div>
            )}
            rows={filteredDefinitions}
          />
        )}

        <ReportDrawer
          definition={selectedDefinition}
          isConnected={isConnected && sourceState === "available"}
          onClose={() => {
            setDrawerOpen(false);
            setSelectedResult(null);
            setSelectedDefinition(null);
          }}
          open={drawerOpen}
          report={selectedResult}
          workspaceKey={effectiveWorkspaceKey}
        />

        <ReportCreateDialog
          onClose={() => setCreateOpen(false)}
          onCreated={(created) => {
            setReportResults((prev) => [created, ...prev.filter((r) => r.id !== created.id)]);
          }}
          open={createOpen}
        />
        {definitionFormOpen ? <ReportDefinitionDialog
          definition={editingDefinition}
          onClose={() => setDefinitionFormOpen(false)}
          onSaved={(saved) => {
            setReportDefinitions((previous) => [
              saved, ...previous.filter((item) => item.id !== saved.id),
            ]);
            setSelectedDefinition(saved);
          }}
          open={definitionFormOpen}
        /> : null}
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
