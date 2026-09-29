"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui";

import { QuickViewDrawer } from "../shared/drawers/quick-view-drawer";
import drawerStyles from "../shared/drawers/drawer-layout.module.css";
import { RelationshipSummary } from "../shared/relationship/relationship-summary";
import { ProjectStatusBadge } from "../shared/status/project-status";
import { RiskBadge } from "../shared/status/work-status";
import type { WorkProject } from "./project-types";
import styles from "./projects.module.css";

interface ProjectDrawerProps {
  readonly isConnected?: boolean;
  readonly onClose: () => void;
  readonly open: boolean;
  readonly project: WorkProject | null;
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

export function ProjectDrawer({
  isConnected = true,
  onClose,
  open,
  project,
  workspaceKey,
}: ProjectDrawerProps) {
  const router = useRouter();

  if (!project) return null;

  const detailPath = workspaceKey
    ? `/workspace/${workspaceKey}/projects/${project.id}`
    : "/workspace";

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
      title={
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span className={styles.projectCodeBadge}>{project.code}</span>
          <span>{project.name}</span>
        </div>
      }
    >
      <dl className={drawerStyles.definitionList}>
        <dt className={drawerStyles.definitionTerm}>Pemilik</dt>
        <dd className={drawerStyles.definitionDetail}>{project.ownerName ?? "—"}</dd>

        <dt className={drawerStyles.definitionTerm}>Mulai</dt>
        <dd className={drawerStyles.definitionDetail}>{formatDate(project.startDate)}</dd>

        <dt className={drawerStyles.definitionTerm}>Target Selesai</dt>
        <dd className={drawerStyles.definitionDetail}>{formatDate(project.targetEndDate)}</dd>

        <dt className={drawerStyles.definitionTerm}>Status</dt>
        <dd className={drawerStyles.definitionDetail}>
          <ProjectStatusBadge status={project.status} />
        </dd>

        <dt className={drawerStyles.definitionTerm}>Workspace</dt>
        <dd className={drawerStyles.definitionDetail}>{project.workspaceName ?? "—"}</dd>

        <dt className={drawerStyles.definitionTerm}>Risiko</dt>
        <dd className={drawerStyles.definitionDetail}>
          <RiskBadge level={project.riskLevel} />
        </dd>

        <dt className={drawerStyles.definitionTerm}>Progres</dt>
        <dd className={drawerStyles.definitionDetail}>
          {project.progressPercentage !== null && project.progressPercentage !== undefined
            ? `${project.progressPercentage}%`
            : "—"}
        </dd>
      </dl>

      {project.description ? (
        <div className={drawerStyles.drawerSection}>
          <h4 className={drawerStyles.drawerSectionTitle}>Deskripsi</h4>
          <p style={{ margin: 0, fontSize: "14px", color: "var(--alos-text-secondary)" }}>
            {project.description}
          </p>
        </div>
      ) : null}

      <div className={drawerStyles.drawerSection}>
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
    </QuickViewDrawer>
  );
}
