"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui";

import { QuickViewDrawer } from "../shared/drawers/quick-view-drawer";
import drawerStyles from "../shared/drawers/drawer-layout.module.css";
import relationshipStyles from "../shared/relationship/relationship.module.css";
import { formatTaskDueDate, TaskPriorityBadge, TaskStatusBadge } from "./task-status";
import type { WorkTask } from "./task-types";
import styles from "./tasks.module.css";

interface TaskDrawerProps {
  readonly isConnected?: boolean;
  readonly onClose: () => void;
  readonly open: boolean;
  readonly task: WorkTask | null;
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

export function TaskDrawer({
  isConnected = true,
  onClose,
  open,
  task,
  workspaceKey,
}: TaskDrawerProps) {
  const router = useRouter();

  if (!task) return null;

  const detailPath = workspaceKey
    ? `/workspace/${workspaceKey}/tasks/${task.id}`
    : "/workspace";

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

  const footer = (
    <div className={styles.drawerFooterActions}>
      <Button onClick={onClose} variant="ghost">
        Tutup
      </Button>
      <Button
        onClick={() => {
          onClose();
          router.push(detailPath);
        }}
        variant="primary"
      >
        Buka Halaman Lengkap
      </Button>
    </div>
  );

  return (
    <QuickViewDrawer
      footer={footer}
      onClose={onClose}
      open={open}
      title={<span>{task.title}</span>}
    >
      <dl className={drawerStyles.definitionList}>
        <dt className={drawerStyles.definitionTerm}>Status</dt>
        <dd className={drawerStyles.definitionDetail}>
          <TaskStatusBadge status={task.status} />
        </dd>

        <dt className={drawerStyles.definitionTerm}>Prioritas</dt>
        <dd className={drawerStyles.definitionDetail}>
          <TaskPriorityBadge priority={task.priority} />
        </dd>

        <dt className={drawerStyles.definitionTerm}>Pemilik</dt>
        <dd className={drawerStyles.definitionDetail}>{task.ownerName ?? "—"}</dd>

        <dt className={drawerStyles.definitionTerm}>Proyek</dt>
        <dd className={drawerStyles.definitionDetail}>
          {task.projectName ?? (task.projectId ? "Proyek terkait" : "—")}
        </dd>

        <dt className={drawerStyles.definitionTerm}>Workspace</dt>
        <dd className={drawerStyles.definitionDetail}>{task.workspaceName ?? "—"}</dd>

        <dt className={drawerStyles.definitionTerm}>Pembuat</dt>
        <dd className={drawerStyles.definitionDetail}>{task.creatorName ?? "—"}</dd>

        <dt className={drawerStyles.definitionTerm}>Mulai</dt>
        <dd className={drawerStyles.definitionDetail}>{formatDate(task.startDate)}</dd>

        <dt className={drawerStyles.definitionTerm}>Tenggat</dt>
        <dd className={drawerStyles.definitionDetail}>
          <span className={dueInfo.isOverdue ? styles.overdueDate : styles.normalDate}>
            {dueInfo.text}
            {dueInfo.isOverdue ? " (Terlambat)" : ""}
          </span>
        </dd>

        <dt className={drawerStyles.definitionTerm}>Dependency</dt>
        <dd className={drawerStyles.definitionDetail}>
          {task.blockedByTitles && task.blockedByTitles.length > 0 ? (
            <div className={styles.dependencyList}>
              {task.blockedByTitles.map((dep, idx) => (
                <span className={styles.dependencyItem} key={idx}>
                  Terhambat oleh: {dep}
                </span>
              ))}
            </div>
          ) : (
            "—"
          )}
        </dd>
      </dl>

      {task.description ? (
        <div className={drawerStyles.drawerSection}>
          <h4 className={drawerStyles.drawerSectionTitle}>Deskripsi</h4>
          <p style={{ margin: 0, fontSize: "14px", color: "var(--alos-text-secondary)", lineHeight: "1.5" }}>
            {task.description}
          </p>
        </div>
      ) : null}

      <div className={drawerStyles.drawerSection}>
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
    </QuickViewDrawer>
  );
}
