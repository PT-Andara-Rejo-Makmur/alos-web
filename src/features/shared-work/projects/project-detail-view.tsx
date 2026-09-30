"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button, Dialog, type TabItem } from "@/components/ui";
import type { SessionProjection } from "@/features/session";
import { apiMessage } from "@/lib/api";

import { ActivityTimeline } from "../shared/activity/activity-timeline";
import { DetailPageShell } from "../shared/drawers/detail-page-shell";
import drawerStyles from "../shared/drawers/drawer-layout.module.css";
import { WorkEmptyState } from "../shared/empty-states/work-empty-state";
import { EvidenceList } from "../shared/evidence/evidence-list";
import { RelationshipSummary } from "../shared/relationship/relationship-summary";
import { ProjectStatusBadge } from "../shared/status/project-status";
import { RiskBadge } from "../shared/status/work-status";
import { canArchiveProject, canUpdateProject } from "../shared/permissions/authority";
import { ProjectEditDialog } from "./project-edit-dialog";
import { archiveProject } from "./project-model";
import type { WorkProject } from "./project-types";
import styles from "./projects.module.css";

interface ProjectDetailViewProps {
  readonly isConnected?: boolean;
  readonly project: WorkProject;
  readonly session?: SessionProjection | null;
  readonly workspaceKey?: string | null;
}

function formatDate(dateString: string | null): string {
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

export function ProjectDetailView({
  isConnected = true,
  project: initialProject,
  session,
  workspaceKey,
}: ProjectDetailViewProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [project, setProject] = useState(initialProject);
  const [editOpen, setEditOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  async function archive() {
    if (archiving) return;
    setArchiving(true);
    setActionError(null);
    try {
      setProject(await archiveProject(project.id));
      setArchiveOpen(false);
    } catch (caught) {
      setActionError(apiMessage(caught));
    } finally {
      setArchiving(false);
    }
  }

  const backUrl = workspaceKey ? `/workspace/${workspaceKey}/projects` : "/workspace/projects";

  const headerMetadata = (
    <div className={styles.projectNameCell}>
      <div className={drawerStyles.detailHeaderTop}>
        <div>
          <span className={styles.projectCodeBadge}>{project.code}</span>
          <h2 className={drawerStyles.detailHeaderTitle}>{project.name}</h2>
          {project.description ? (
            <p className={styles.projectDescText} style={{ whiteSpace: "normal", maxWidth: "600px" }}>
              {project.description}
            </p>
          ) : null}
        </div>
        <ProjectStatusBadge status={project.status} />
      </div>

      <dl className={drawerStyles.definitionList} style={{ marginTop: "16px" }}>
        <dt className={drawerStyles.definitionTerm}>Pemilik</dt>
        <dd className={drawerStyles.definitionDetail}>{project.ownerName ?? "—"}</dd>

        <dt className={drawerStyles.definitionTerm}>Ruang Kerja</dt>
        <dd className={drawerStyles.definitionDetail}>{project.workspaceName ?? "—"}</dd>

        <dt className={drawerStyles.definitionTerm}>Tanggal Mulai</dt>
        <dd className={drawerStyles.definitionDetail}>{formatDate(project.startDate)}</dd>

        <dt className={drawerStyles.definitionTerm}>Target Selesai</dt>
        <dd className={drawerStyles.definitionDetail}>{formatDate(project.targetEndDate)}</dd>
      </dl>
    </div>
  );

  const tabs: readonly TabItem[] = [
    {
      id: "overview",
      label: "Ringkasan",
      content: (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
            <div style={{ padding: "16px", background: "var(--alos-surface)", border: "1px solid var(--alos-border)", borderRadius: "8px" }}>
              <span style={{ fontSize: "12px", color: "var(--alos-text-secondary)" }}>Tingkat Risiko</span>
              <div style={{ marginTop: "6px" }}>
                <RiskBadge level={project.riskLevel} />
              </div>
            </div>

            <div style={{ padding: "16px", background: "var(--alos-surface)", border: "1px solid var(--alos-border)", borderRadius: "8px" }}>
              <span style={{ fontSize: "12px", color: "var(--alos-text-secondary)" }}>Progres Eksekusi</span>
              <div style={{ marginTop: "6px", fontSize: "18px", fontWeight: "600", color: "var(--alos-text-primary)" }}>
                {project.progressPercentage !== null && project.progressPercentage !== undefined
                  ? `${project.progressPercentage}%`
                  : "Belum Dinilai"}
              </div>
            </div>
          </div>

          <RelationshipSummary
            counts={{
              tasksCount: project.tasksCount,
              documentsCount: project.documentsCount,
              approvalsCount: project.approvalsCount,
              findingsCount: project.findingsCount,
              reportsCount: project.reportsCount,
              evidenceCount: project.evidenceCount,
            }}
            isConnected={isConnected}
          />
        </div>
      ),
    },
    {
      id: "plan",
      label: "Rencana",
      content: (
        <WorkEmptyState
          description="Belum ada rincian tahapan rencana atau target pencapaian terstruktur."
          title="Belum ada rencana yang terdaftar"
        />
      ),
    },
    {
      id: "tasks",
      label: "Tugas",
      content: (
        <WorkEmptyState
          module="tasks"
          title="Tidak ada tugas yang terhubung dengan proyek ini."
        />
      ),
    },
    {
      id: "documents",
      label: "Dokumen",
      content: (
        <WorkEmptyState
          module="documents"
          title="Belum ada dokumen yang terhubung dengan proyek ini."
        />
      ),
    },
    {
      id: "approvals",
      label: "Persetujuan",
      content: (
        <WorkEmptyState
          module="approvals"
          title="Tidak ada persetujuan yang diajukan untuk proyek ini."
        />
      ),
    },
    {
      id: "findings",
      label: "Temuan",
      content: (
        <WorkEmptyState
          module="findings"
          title="Tidak ada temuan terbuka pada proyek ini."
        />
      ),
    },
    {
      id: "evidence",
      label: "Bukti",
      content: <EvidenceList items={[]} />,
    },
    {
      id: "activity",
      label: "Aktivitas",
      content: <ActivityTimeline items={[]} />,
    },
  ];

  return (
    <>
    <DetailPageShell
      actions={
        <div className={styles.createActions}>
        {canUpdateProject(session) && project.status !== "ARCHIVED" ? (
          <Button onClick={() => setEditOpen(true)} variant="secondary">Ubah Proyek</Button>
        ) : null}
        {canArchiveProject(session) && project.status !== "ARCHIVED" ? (
          <Button onClick={() => setArchiveOpen(true)} variant="secondary">Arsipkan Proyek</Button>
        ) : null}
        <Button
          iconBefore={<ArrowLeft size={16} strokeWidth={2} />}
          onClick={() => router.push(backUrl)}
          variant="secondary"
        >
          Kembali ke Daftar
        </Button>
        </div>
      }
      activeTab={activeTab}
      description="Kelola dan pantau seluruh instrumen kerja yang terhubung dengan proyek ini."
      eyebrow="PROYEK"
      headerMetadata={headerMetadata}
      onTabChange={setActiveTab}
      tabs={tabs}
      title={project.name}
    />
    {editOpen ? <ProjectEditDialog onClose={() => setEditOpen(false)} onSaved={setProject} open project={project} /> : null}
    <Dialog onClose={() => setArchiveOpen(false)} open={archiveOpen} title="Arsipkan Proyek">
      <p>Proyek yang diarsipkan tidak dapat diubah lagi.</p>
      {actionError ? <p role="alert">{actionError}</p> : null}
      <div className={styles.createActions}>
        <Button disabled={archiving} onClick={() => setArchiveOpen(false)} variant="secondary">Batal</Button>
        <Button loading={archiving} onClick={() => void archive()}>Arsipkan</Button>
      </div>
    </Dialog>
    </>
  );
}
