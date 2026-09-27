"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Alert, Button, type TabItem } from "@/components/ui";

import { ActivityTimeline } from "../shared/activity/activity-timeline";
import { DetailPageShell } from "../shared/drawers/detail-page-shell";
import drawerStyles from "../shared/drawers/drawer-layout.module.css";
import { WorkEmptyState } from "../shared/empty-states/work-empty-state";
import { EvidenceList } from "../shared/evidence/evidence-list";
import relationshipStyles from "../shared/relationship/relationship.module.css";
import { DataClassificationBadge } from "../shared/status/work-status";
import { DocumentStatusBadge } from "./document-status";
import type { WorkDocument } from "./document-types";
import styles from "./documents.module.css";

interface DocumentDetailViewProps {
  readonly document: WorkDocument;
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

export function DocumentDetailView({
  document: doc,
  isConnected = true,
  workspaceKey,
}: DocumentDetailViewProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("detail");

  const backUrl = workspaceKey ? `/workspace/${workspaceKey}/documents` : "/workspace/documents";

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

  const headerMetadata = (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
        <span className={styles.versionBadge}>{doc.currentVersion ?? "v1.0"}</span>
        <DataClassificationBadge classification={doc.dataClassification} />
        <DocumentStatusBadge status={doc.status} />
      </div>

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

        {doc.effectiveDate ? (
          <>
            <dt className={drawerStyles.definitionTerm}>Berlaku</dt>
            <dd className={drawerStyles.definitionDetail}>{formatDate(doc.effectiveDate)}</dd>
          </>
        ) : null}

        {doc.expiryDate ? (
          <>
            <dt className={drawerStyles.definitionTerm}>Kedaluwarsa</dt>
            <dd className={drawerStyles.definitionDetail}>{formatDate(doc.expiryDate)}</dd>
          </>
        ) : null}
      </dl>
    </div>
  );

  const tabs: readonly TabItem[] = [
    {
      id: "detail",
      label: "Detail",
      content: (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {doc.description ? (
            <div style={{ padding: "16px", background: "var(--alos-surface)", border: "1px solid var(--alos-border)", borderRadius: "8px" }}>
              <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--alos-text-muted)", textTransform: "uppercase" }}>
                Deskripsi Dokumen
              </span>
              <p style={{ margin: "8px 0 0 0", fontSize: "14px", color: "var(--alos-text-primary)", lineHeight: "1.6" }}>
                {doc.description}
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
      id: "versions",
      label: "Versi",
      content: (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <Alert
            message="Versi dokumen bersifat immutable (tidak dapat diubah setelah terbit). Revisi dokumen dilakukan melalui pembuatan versi baru."
            title="Riwayat Versi Dokumen (Immutable)"
            variant="neutral"
          />

          <div className={styles.versionList}>
            {doc.versions && doc.versions.length > 0 ? (
              doc.versions.map((v) => (
                <div className={styles.versionItem} key={v.version}>
                  <div className={styles.versionHeader}>
                    <span className={styles.versionBadge}>{v.version}</span>
                    <span style={{ fontSize: "12px", color: "var(--alos-text-secondary)" }}>
                      {formatDate(v.createdAt)} oleh {v.creatorName ?? v.createdBy}
                    </span>
                  </div>
                  <div className={styles.versionHash}>Hash Integritas: {v.contentHash}</div>
                </div>
              ))
            ) : (
              <div className={styles.versionItem}>
                <div className={styles.versionHeader}>
                  <span className={styles.versionBadge}>{doc.currentVersion ?? "v1.0"}</span>
                  <span style={{ fontSize: "12px", color: "var(--alos-text-secondary)" }}>
                    {formatDate(doc.createdAt)}
                  </span>
                </div>
                <div className={styles.versionHash}>Hash Integritas: sha256:canonical-initial-version</div>
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      id: "checklist",
      label: "Checklist",
      content: (
        <WorkEmptyState
          description="Checklist kelengkapan dokumen kerja belum tersedia pada sistem."
          module="documents"
          title="Checklist belum tersedia."
        />
      ),
    },
    {
      id: "relations",
      label: "Relasi",
      content: (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <Alert
            message="Relasi instrumen kerja (Proyek, Tugas, dan Temuan) belum terhubung ke sumber data."
            title="Relasi Belum Terhubung"
            variant="neutral"
          />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
            <div style={{ padding: "16px", background: "var(--alos-surface)", border: "1px solid var(--alos-border)", borderRadius: "8px" }}>
              <h4 style={{ margin: "0 0 8px 0", fontSize: "14px", fontWeight: 600 }}>Proyek Terkait</h4>
              <p style={{ margin: 0, fontSize: "13px", color: "var(--alos-text-muted)" }}>
                {doc.projectName ?? "Belum Terhubung"}
              </p>
            </div>
            <div style={{ padding: "16px", background: "var(--alos-surface)", border: "1px solid var(--alos-border)", borderRadius: "8px" }}>
              <h4 style={{ margin: "0 0 8px 0", fontSize: "14px", fontWeight: 600 }}>Tugas Terkait</h4>
              <p style={{ margin: 0, fontSize: "13px", color: "var(--alos-text-muted)" }}>
                Belum Terhubung
              </p>
            </div>
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
      description="Rincian metadata dokumen kerja, klasifikasi keamanan, dan versi dokumen."
      eyebrow="DOKUMEN"
      headerMetadata={headerMetadata}
      onTabChange={setActiveTab}
      tabs={tabs}
      title={doc.title}
    />
  );
}
