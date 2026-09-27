"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui";

import { QuickViewDrawer } from "../shared/drawers/quick-view-drawer";
import drawerStyles from "../shared/drawers/drawer-layout.module.css";
import relationshipStyles from "../shared/relationship/relationship.module.css";
import { DataClassificationBadge } from "../shared/status/work-status";
import { DocumentStatusBadge } from "./document-status";
import type { WorkDocument } from "./document-types";
import styles from "./documents.module.css";

interface DocumentDrawerProps {
  readonly document: WorkDocument | null;
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

export function DocumentDrawer({
  document: doc,
  isConnected = true,
  onClose,
  open,
  workspaceKey,
}: DocumentDrawerProps) {
  const router = useRouter();

  if (!doc) return null;

  const detailPath = workspaceKey
    ? `/workspace/${workspaceKey}/documents/${doc.id}`
    : `/workspace/documents/${doc.id}`;

  const relatedItems = [
    { key: "tasks", label: "Tugas", count: doc.tasksCount },
    { key: "approvals", label: "Persetujuan", count: doc.approvalsCount },
    { key: "evidence", label: "Bukti", count: doc.evidenceCount },
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
      title={<span>{doc.title}</span>}
    >
      <dl className={drawerStyles.definitionList}>
        <dt className={drawerStyles.definitionTerm}>Status</dt>
        <dd className={drawerStyles.definitionDetail}>
          <DocumentStatusBadge status={doc.status} />
        </dd>

        <dt className={drawerStyles.definitionTerm}>Klasifikasi</dt>
        <dd className={drawerStyles.definitionDetail}>
          <DataClassificationBadge classification={doc.dataClassification} />
        </dd>

        <dt className={drawerStyles.definitionTerm}>Kategori</dt>
        <dd className={drawerStyles.definitionDetail}>{doc.category}</dd>

        <dt className={drawerStyles.definitionTerm}>Versi Aktif</dt>
        <dd className={drawerStyles.definitionDetail}>
          <span className={styles.versionBadge}>{doc.currentVersion ?? "—"}</span>
        </dd>

        <dt className={drawerStyles.definitionTerm}>Pemilik</dt>
        <dd className={drawerStyles.definitionDetail}>{doc.ownerName ?? "—"}</dd>

        <dt className={drawerStyles.definitionTerm}>Workspace</dt>
        <dd className={drawerStyles.definitionDetail}>{doc.workspaceName ?? "—"}</dd>

        <dt className={drawerStyles.definitionTerm}>Proyek</dt>
        <dd className={drawerStyles.definitionDetail}>
          {doc.projectName ?? (doc.projectId ? "Proyek terkait" : "—")}
        </dd>

        <dt className={drawerStyles.definitionTerm}>Dibuat</dt>
        <dd className={drawerStyles.definitionDetail}>{formatDate(doc.createdAt)}</dd>
      </dl>

      {doc.description ? (
        <div className={drawerStyles.drawerSection}>
          <h4 className={drawerStyles.drawerSectionTitle}>Deskripsi</h4>
          <p style={{ margin: 0, fontSize: "14px", color: "var(--alos-text-secondary)", lineHeight: "1.5" }}>
            {doc.description}
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
