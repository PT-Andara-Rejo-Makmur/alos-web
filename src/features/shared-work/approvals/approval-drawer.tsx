"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui";

import { QuickViewDrawer } from "../shared/drawers/quick-view-drawer";
import drawerStyles from "../shared/drawers/drawer-layout.module.css";
import relationshipStyles from "../shared/relationship/relationship.module.css";
import { ApprovalStatusBadge, ApprovalSubjectBadge } from "./approval-status";
import type { WorkApproval } from "./approval-types";
import styles from "./approvals.module.css";

interface ApprovalDrawerProps {
  readonly approval: WorkApproval | null;
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

export function ApprovalDrawer({
  approval,
  isConnected = true,
  onClose,
  open,
  workspaceKey,
}: ApprovalDrawerProps) {
  const router = useRouter();

  if (!approval) return null;

  const detailPath = workspaceKey
    ? `/workspace/${workspaceKey}/approvals/${approval.id}`
    : "/workspace";

  const relatedItems = [
    { key: "documents", label: "Dokumen", count: approval.documentsCount },
    { key: "evidence", label: "Bukti", count: approval.evidenceCount },
    { key: "comments", label: "Komentar", count: approval.commentsCount },
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
      title={<span>{approval.subjectTitle ?? "Permintaan Persetujuan"}</span>}
    >
      <dl className={drawerStyles.definitionList}>
        <dt className={drawerStyles.definitionTerm}>Status</dt>
        <dd className={drawerStyles.definitionDetail}>
          <ApprovalStatusBadge status={approval.status} />
        </dd>

        <dt className={drawerStyles.definitionTerm}>Jenis</dt>
        <dd className={drawerStyles.definitionDetail}>
          <ApprovalSubjectBadge subjectType={approval.subjectType} />
        </dd>

        <dt className={drawerStyles.definitionTerm}>Pengusul</dt>
        <dd className={drawerStyles.definitionDetail}>{approval.requesterName ?? "—"}</dd>

        <dt className={drawerStyles.definitionTerm}>Approver</dt>
        <dd className={drawerStyles.definitionDetail}>{approval.approverName ?? "—"}</dd>

        <dt className={drawerStyles.definitionTerm}>Ruang Kerja</dt>
        <dd className={drawerStyles.definitionDetail}>{approval.workspaceName ?? "—"}</dd>

        <dt className={drawerStyles.definitionTerm}>Diajukan</dt>
        <dd className={drawerStyles.definitionDetail}>{formatDate(approval.requestedAt)}</dd>

        <dt className={drawerStyles.definitionTerm}>Diputuskan</dt>
        <dd className={drawerStyles.definitionDetail}>{formatDate(approval.decidedAt)}</dd>

        {approval.materialityValue ? (
          <>
            <dt className={drawerStyles.definitionTerm}>Materialitas / Nilai</dt>
            <dd className={drawerStyles.definitionDetail}>{approval.materialityValue}</dd>
          </>
        ) : null}
      </dl>

      {approval.reason ? (
        <div className={drawerStyles.drawerSection}>
          <h4 className={drawerStyles.drawerSectionTitle}>Alasan / Keterangan</h4>
          <p style={{ margin: 0, fontSize: "14px", color: "var(--alos-text-secondary)", lineHeight: "1.5" }}>
            {approval.reason}
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
