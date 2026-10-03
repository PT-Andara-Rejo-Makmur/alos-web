"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button, Dialog, type TabItem } from "@/components/ui";
import type { SessionProjection } from "@/features/session";
import { apiMessage } from "@/lib/api";

import { DetailPageShell } from "../shared/drawers/detail-page-shell";
import { SharedWorkActivityPanel, SharedWorkChecklistPanel, SharedWorkCommentsPanel, SharedWorkEvidencePanel, SharedWorkRelationsPanel } from "../shared/shared-work-relations";
import drawerStyles from "../shared/drawers/drawer-layout.module.css";
import relationshipStyles from "../shared/relationship/relationship.module.css";
import { canAssignTask, canCompleteTask, canUpdateTask } from "../shared/permissions/authority";
import { TaskAssignDialog } from "./task-assign-dialog";
import { TaskDependencyDialog } from "./task-dependency-dialog";
import { TaskEditDialog } from "./task-edit-dialog";
import { completeTask } from "./task-model";
import { formatTaskDueDate, TaskPriorityBadge, TaskStatusBadge } from "./task-status";
import type { WorkTask } from "./task-types";
import styles from "./tasks.module.css";

interface TaskDetailViewProps {
  readonly isConnected?: boolean;
  readonly task: WorkTask;
  readonly session?: SessionProjection | null;
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

export function TaskDetailView({
  isConnected = true,
  task: initialTask,
  session,
  workspaceKey,
}: TaskDetailViewProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [task, setTask] = useState(initialTask);
  const [editOpen, setEditOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [dependencyOpen, setDependencyOpen] = useState(false);
  const [completeOpen, setCompleteOpen] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  async function complete() {
    if (completing) return;
    setCompleting(true);
    setActionError(null);
    try {
      setTask(await completeTask(task.id));
      setCompleteOpen(false);
    } catch (caught) {
      setActionError(apiMessage(caught));
    } finally {
      setCompleting(false);
    }
  }

  const backUrl = workspaceKey ? `/workspace/${workspaceKey}/tasks` : "/workspace/tasks";
  const dueInfo = formatTaskDueDate(task.dueAt, task.status);

  const relatedItems = [
    { key: "documents", label: "Dokumen", count: task.documentsCount },
    { key: "findings", label: "Temuan", count: task.findingsCount },
    { key: "evidence", label: "Bukti", count: task.evidenceCount },
    { key: "comments", label: "Komentar", count: task.commentsCount },
  ];

  function formatCount(value: number | null | undefined) {
    if (!isConnected) return <span className={relationshipStyles.itemValueUnconnected}>Belum Terhubung</span>;
    if (value === null || value === undefined) {
      return <span className={relationshipStyles.itemValueUnconnected}>—</span>;
    }
    return value;
  }

  const headerMetadata = (
    <div>
      <div className={styles.metaRow} style={{ marginBottom: "16px" }}>
        {task.projectName ? (
          <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--alos-text-secondary)" }}>
            Proyek: {task.projectName}
          </span>
        ) : null}
        <TaskPriorityBadge priority={task.priority} />
        <TaskStatusBadge status={task.status} />
      </div>

      <dl className={drawerStyles.definitionList}>
        <dt className={drawerStyles.definitionTerm}>Status</dt>
        <dd className={drawerStyles.definitionDetail}>
          <TaskStatusBadge status={task.status} />
        </dd>

        <dt className={drawerStyles.definitionTerm}>Prioritas</dt>
        <dd className={drawerStyles.definitionDetail}>
          <TaskPriorityBadge priority={task.priority} />
        </dd>

        <dt className={drawerStyles.definitionTerm}>Proyek</dt>
        <dd className={drawerStyles.definitionDetail}>
          {task.projectName ?? (task.projectId ? "Proyek terkait" : "—")}
        </dd>

        <dt className={drawerStyles.definitionTerm}>Pemilik</dt>
        <dd className={drawerStyles.definitionDetail}>{task.ownerName ?? "—"}</dd>

        <dt className={drawerStyles.definitionTerm}>Pembuat</dt>
        <dd className={drawerStyles.definitionDetail}>{task.creatorName ?? "—"}</dd>

        <dt className={drawerStyles.definitionTerm}>Ruang Kerja</dt>
        <dd className={drawerStyles.definitionDetail}>{task.workspaceName ?? "—"}</dd>

        <dt className={drawerStyles.definitionTerm}>Mulai</dt>
        <dd className={drawerStyles.definitionDetail}>{formatDate(task.startDate)}</dd>

        <dt className={drawerStyles.definitionTerm}>Tenggat</dt>
        <dd className={drawerStyles.definitionDetail}>
          <span className={dueInfo.isOverdue ? styles.overdueDate : styles.normalDate}>
            {dueInfo.text}
            {dueInfo.isOverdue ? " (Terlambat)" : ""}
          </span>
        </dd>
      </dl>
    </div>
  );

  const tabs: readonly TabItem[] = [
    {
      id: "overview",
      label: "Ringkasan",
      content: (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {task.description ? (
            <div style={{ padding: "16px", background: "var(--alos-surface)", border: "1px solid var(--alos-border)", borderRadius: "8px" }}>
              <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--alos-text-muted)", textTransform: "uppercase" }}>
                Deskripsi
              </span>
              <p style={{ margin: "8px 0 0 0", fontSize: "14px", color: "var(--alos-text-primary)", lineHeight: "1.6" }}>
                {task.description}
              </p>
            </div>
          ) : null}

          <div style={{ padding: "16px", background: "var(--alos-surface)", border: "1px solid var(--alos-border)", borderRadius: "8px" }}>
            <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--alos-text-muted)", textTransform: "uppercase" }}>
              Terhambat oleh
            </span>
            <div style={{ marginTop: "8px" }}>
              {task.blockedByTitles && task.blockedByTitles.length > 0 ? (
                <div className={styles.dependencyList}>
                  {task.blockedByTitles.map((dep, idx) => (
                    <div className={styles.dependencyItem} key={idx}>
                      <span>{dep}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <span style={{ fontSize: "14px", color: "var(--alos-text-secondary)" }}>Belum ada ketergantungan.</span>
              )}
            </div>
          </div>

          <div aria-label="Ringkasan Objek Terkait" className={relationshipStyles.summaryContainer}>
            <h3 className={relationshipStyles.summaryTitle}>Terkait</h3>
            <div className={relationshipStyles.summaryGrid}>
              {relatedItems.map((item) => (
                <div className={relationshipStyles.summaryItem} key={item.key}>
                  <span className={relationshipStyles.itemLabel}>{item.label}</span>
                  <span className={relationshipStyles.itemValue}>{formatCount(item.count)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "checklist",
      label: "Checklist",
      content: <SharedWorkChecklistPanel entityType="TASK" entityId={task.id} session={session} />,
    },
    {
      id: "relations",
      label: "Relasi",
      content: <SharedWorkRelationsPanel entityType="TASK" entityId={task.id} session={session} workspaceKey={workspaceKey} />,
    },
    {
      id: "evidence",
      label: "Bukti",
      content: <SharedWorkEvidencePanel entityType="TASK" entityId={task.id} session={session} />,
    },
    {
      id: "activity",
      label: "Aktivitas",
      content: <SharedWorkActivityPanel entityType="TASK" entityId={task.id} session={session} />,
    },
    {
      id: "comments",
      label: "Komentar",
      content: <SharedWorkCommentsPanel entityType="TASK" entityId={task.id} session={session} />,
    },
  ];

  return (
    <>
    <DetailPageShell
      actions={
        <div className={styles.createActions}>
        {canUpdateTask(session) && task.status !== "COMPLETED" && task.status !== "CANCELLED" ? (
          <Button onClick={() => setEditOpen(true)} variant="secondary">Ubah Tugas</Button>
        ) : null}
        {canAssignTask(session) && task.status !== "COMPLETED" && task.status !== "CANCELLED" ? (
          <Button onClick={() => setAssignOpen(true)} variant="secondary">Tugaskan</Button>
        ) : null}
        {canUpdateTask(session) && task.status !== "COMPLETED" && task.status !== "CANCELLED" ? (
          <Button onClick={() => setDependencyOpen(true)} variant="secondary">Atur Ketergantungan</Button>
        ) : null}
        {canCompleteTask(session) && task.status !== "COMPLETED" && task.status !== "CANCELLED" ? (
          <Button onClick={() => setCompleteOpen(true)} variant="secondary">Selesaikan Tugas</Button>
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
      description="Rincian dan informasi pelaksanaan tugas kerja."
      eyebrow="TUGAS"
      headerMetadata={headerMetadata}
      onTabChange={setActiveTab}
      tabs={tabs}
      title={task.title}
    />
    {editOpen ? <TaskEditDialog onClose={() => setEditOpen(false)} onSaved={setTask} open task={task} /> : null}
    <TaskAssignDialog onAssigned={setTask} onClose={() => setAssignOpen(false)} open={assignOpen} task={task} />
    <TaskDependencyDialog onChanged={setTask} onClose={() => setDependencyOpen(false)} open={dependencyOpen} task={task} />
    <Dialog onClose={() => setCompleteOpen(false)} open={completeOpen} title="Selesaikan Tugas">
      <p>Tugas yang selesai tidak dapat diubah atau ditugaskan kembali.</p>
      {actionError ? <p role="alert">{actionError}</p> : null}
      <div className={styles.createActions}>
        <Button disabled={completing} onClick={() => setCompleteOpen(false)} variant="secondary">Batal</Button>
        <Button loading={completing} onClick={() => void complete()}>Selesaikan</Button>
      </div>
    </Dialog>
    </>
  );
}
