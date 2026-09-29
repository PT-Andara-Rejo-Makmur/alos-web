"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui";

import { QuickViewDrawer } from "../shared/drawers/quick-view-drawer";
import drawerStyles from "../shared/drawers/drawer-layout.module.css";
import relationshipStyles from "../shared/relationship/relationship.module.css";
import { FindingSeverityBadge, FindingStatusBadge } from "./finding-status";
import type { WorkFinding } from "./finding-types";
import styles from "./findings.module.css";

interface FindingDrawerProps {
  readonly finding: WorkFinding | null;
  readonly isConnected?: boolean;
  readonly onClose: () => void;
  readonly open: boolean;
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

export function FindingDrawer({
  finding,
  isConnected = true,
  onClose,
  open,
  workspaceKey,
}: FindingDrawerProps) {
  const router = useRouter();

  if (!finding) return null;

  const detailPath = workspaceKey
    ? `/workspace/${workspaceKey}/findings/${finding.id}`
    : "/workspace";

  const relatedItems = [
    { key: "tasks", label: "Tindak Lanjut / Tugas", count: finding.tasksCount },
    { key: "evidence", label: "Bukti", count: finding.evidenceCount },
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
      title={<span>{finding.title}</span>}
    >
      <dl className={drawerStyles.definitionList}>
        <dt className={drawerStyles.definitionTerm}>Status</dt>
        <dd className={drawerStyles.definitionDetail}>
          <FindingStatusBadge status={finding.status} />
        </dd>

        <dt className={drawerStyles.definitionTerm}>Tingkat Keparahan</dt>
        <dd className={drawerStyles.definitionDetail}>
          <FindingSeverityBadge severity={finding.severity} />
        </dd>

        <dt className={drawerStyles.definitionTerm}>Sumber</dt>
        <dd className={drawerStyles.definitionDetail}>{finding.sourceType}</dd>

        <dt className={drawerStyles.definitionTerm}>Kategori</dt>
        <dd className={drawerStyles.definitionDetail}>{finding.category ?? "—"}</dd>

        <dt className={drawerStyles.definitionTerm}>Proyek</dt>
        <dd className={drawerStyles.definitionDetail}>
          {finding.projectName ?? (finding.projectId ? "Proyek terkait" : "—")}
        </dd>

        <dt className={drawerStyles.definitionTerm}>Pemilik / PIC</dt>
        <dd className={drawerStyles.definitionDetail}>{finding.ownerName ?? "—"}</dd>

        <dt className={drawerStyles.definitionTerm}>Workspace</dt>
        <dd className={drawerStyles.definitionDetail}>{finding.workspaceName ?? "—"}</dd>

        <dt className={drawerStyles.definitionTerm}>Ditemukan</dt>
        <dd className={drawerStyles.definitionDetail}>{formatDate(finding.identifiedAt)}</dd>

        <dt className={drawerStyles.definitionTerm}>Tenggat</dt>
        <dd className={drawerStyles.definitionDetail}>{formatDate(finding.dueDate)}</dd>
      </dl>

      {finding.description ? (
        <div className={drawerStyles.drawerSection}>
          <h4 className={drawerStyles.drawerSectionTitle}>Deskripsi Masalah</h4>
          <p style={{ margin: 0, fontSize: "14px", color: "var(--alos-text-secondary)", lineHeight: "1.5" }}>
            {finding.description}
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
