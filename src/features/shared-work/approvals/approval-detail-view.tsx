"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Alert, Button, type TabItem } from "@/components/ui";

import { ActivityTimeline } from "../shared/activity/activity-timeline";
import { DetailPageShell } from "../shared/drawers/detail-page-shell";
import drawerStyles from "../shared/drawers/drawer-layout.module.css";
import { EvidenceList } from "../shared/evidence/evidence-list";
import relationshipStyles from "../shared/relationship/relationship.module.css";
import { ApprovalStageBadge, ApprovalStatusBadge, ApprovalSubjectBadge } from "./approval-status";
import type { WorkApproval } from "./approval-types";
import styles from "./approvals.module.css";

interface ApprovalDetailViewProps {
  readonly approval: WorkApproval;
  readonly isConnected?: boolean;
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

export function ApprovalDetailView({
  approval,
  isConnected = true,
  workspaceKey,
}: ApprovalDetailViewProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");

  const backUrl = workspaceKey ? `/workspace/${workspaceKey}/approvals` : "/workspace/approvals";

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

  const headerMetadata = (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
        <ApprovalSubjectBadge subjectType={approval.subjectType} />
        <ApprovalStatusBadge status={approval.status} />
        <ApprovalStageBadge stage={approval.stage ?? (approval.status === "APPROVED" || approval.status === "REJECTED" ? "COMPLETED" : "APPROVAL")} />
      </div>

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

        <dt className={drawerStyles.definitionTerm}>Workspace</dt>
        <dd className={drawerStyles.definitionDetail}>{approval.workspaceName ?? "—"}</dd>

        <dt className={drawerStyles.definitionTerm}>Diajukan</dt>
        <dd className={drawerStyles.definitionDetail}>{formatDate(approval.requestedAt)}</dd>

        <dt className={drawerStyles.definitionTerm}>Diputuskan</dt>
        <dd className={drawerStyles.definitionDetail}>{formatDate(approval.decidedAt)}</dd>

        {approval.materialityValue ? (
          <>
            <dt className={drawerStyles.definitionTerm}>Materialitas</dt>
            <dd className={drawerStyles.definitionDetail}>{approval.materialityValue}</dd>
          </>
        ) : null}
      </dl>
    </div>
  );

  const tabs: readonly TabItem[] = [
    {
      id: "overview",
      label: "Ringkasan",
      content: (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Separation of Duties (SoD) Pipeline */}
          <div style={{ padding: "16px", background: "var(--alos-surface)", border: "1px solid var(--alos-border)", borderRadius: "8px" }}>
            <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--alos-text-muted)", textTransform: "uppercase" }}>
              Alur Kewenangan & Pemisahan Tugas (Separation of Duties)
            </span>
            <div className={styles.sodPipeline} style={{ marginTop: "12px" }}>
              <div className={styles.sodStep}>
                <span className={styles.sodStepRole}>Pengusul</span>
                <span className={styles.sodStepActor}>{approval.requesterName ?? "Aktor Pengusul"}</span>
              </div>
              <span className={styles.sodArrow}>→</span>
              <div className={styles.sodStep}>
                <span className={styles.sodStepRole}>Peninjau (Reviewer)</span>
                <span className={styles.sodStepActor}>—</span>
              </div>
              <span className={styles.sodArrow}>→</span>
              <div className={styles.sodStep}>
                <span className={styles.sodStepRole}>Pengambil Keputusan (Approver)</span>
                <span className={styles.sodStepActor}>{approval.approverName ?? "Aktor Berwenang"}</span>
              </div>
            </div>
          </div>

          {approval.reason ? (
            <div style={{ padding: "16px", background: "var(--alos-surface)", border: "1px solid var(--alos-border)", borderRadius: "8px" }}>
              <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--alos-text-muted)", textTransform: "uppercase" }}>
                Alasan / Latar Belakang Permintaan
              </span>
              <p style={{ margin: "8px 0 0 0", fontSize: "14px", color: "var(--alos-text-primary)", lineHeight: "1.6" }}>
                {approval.reason}
              </p>
            </div>
          ) : null}

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
      id: "subject",
      label: "Objek Terkait",
      content: (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <Alert
            message="Rincian objek bisnis yang dimintakan persetujuan akan ditampilkan dari sumber data terkait."
            title="Objek Permintaan"
            variant="neutral"
          />
          <div style={{ padding: "16px", background: "var(--alos-surface)", border: "1px solid var(--alos-border)", borderRadius: "8px" }}>
            <h4 style={{ margin: "0 0 8px 0", fontSize: "14px", fontWeight: 600 }}>
              {approval.subjectTitle ?? "Objek Terkait"}
            </h4>
            <p style={{ margin: 0, fontSize: "13px", color: "var(--alos-text-muted)" }}>
              ID Objek: {approval.subjectId}
            </p>
          </div>
        </div>
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
    <DetailPageShell
      actions={
        <Button
          iconBefore={<ArrowLeft size={16} strokeWidth={2} />}
          onClick={() => router.push(backUrl)}
          variant="secondary"
        >
          Kembali ke Daftar
        </Button>
      }
      activeTab={activeTab}
      description="Rincian permohonan persetujuan dan riwayat keputusan."
      eyebrow="PERSETUJUAN"
      headerMetadata={headerMetadata}
      onTabChange={setActiveTab}
      tabs={tabs}
      title={approval.subjectTitle ?? "Permintaan Persetujuan"}
    />
  );
}
