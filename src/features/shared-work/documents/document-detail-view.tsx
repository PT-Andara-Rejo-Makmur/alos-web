"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Alert, Button, type TabItem } from "@/components/ui";
import type { SessionProjection } from "@/features/session";
import { apiMessage } from "@/lib/api";

import { DetailPageShell } from "../shared/drawers/detail-page-shell";
import { SharedWorkActivityPanel, SharedWorkChecklistPanel, SharedWorkCommentsPanel, SharedWorkEvidencePanel, SharedWorkRelationsPanel } from "../shared/shared-work-relations";
import drawerStyles from "../shared/drawers/drawer-layout.module.css";
import { hasWorkPermission } from "../shared/permissions/authority";
import relationshipStyles from "../shared/relationship/relationship.module.css";
import { DataClassificationBadge } from "../shared/status/work-status";
import { approveDocument, retireDocument, reviewDocument } from "./document-model";
import { DocumentStatusBadge } from "./document-status";
import { DocumentVersionDialog } from "./document-version-dialog";
import type { WorkDocument } from "./document-types";
import styles from "./documents.module.css";

interface DocumentDetailViewProps {
  readonly document: WorkDocument;
  readonly isConnected?: boolean;
  readonly workspaceKey?: string | null;
  readonly session?: SessionProjection | null;
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
  document: initialDoc,
  isConnected = true,
  workspaceKey,
  session,
}: DocumentDetailViewProps) {
  const router = useRouter();
  const [doc, setDoc] = useState(initialDoc);
  const [activeTab, setActiveTab] = useState("detail");
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [versionOpen, setVersionOpen] = useState(false);

  const backUrl = workspaceKey ? `/workspace/${workspaceKey}/documents` : "/workspace/documents";

  const currentActorId =
    session?.principal && "actor" in session.principal
      ? session.principal.actor.actor_id
      : null;
  const isOwner = Boolean(currentActorId && doc.ownerActorId === currentActorId);
  const hasReviewPerm = hasWorkPermission(session, "document.review");
  const hasApprovePerm = hasWorkPermission(session, "document.approve");
  const hasRetirePerm = hasWorkPermission(session, "document.retire");
  const hasVersionPerm = hasWorkPermission(session, "document.version");
  const hasVersions = Boolean(doc.versions && doc.versions.length > 0);

  async function handleReview() {
    if (submitting || !hasVersions) return;
    setSubmitting(true);
    setActionError(null);
    try {
      const updated = await reviewDocument(doc.id);
      setDoc((prev) => ({
        ...prev,
        ...updated,
        versions: prev.versions,
        currentVersion: prev.currentVersion,
      }));
    } catch (caught) {
      setActionError(apiMessage(caught));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleApprove() {
    if (submitting || isOwner) return;
    setSubmitting(true);
    setActionError(null);
    try {
      const updated = await approveDocument(doc.id);
      setDoc((prev) => ({
        ...prev,
        ...updated,
        versions: prev.versions,
        currentVersion: prev.currentVersion,
      }));
    } catch (caught) {
      setActionError(apiMessage(caught));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRetire() {
    if (submitting) return;
    setSubmitting(true);
    setActionError(null);
    try {
      const updated = await retireDocument(doc.id);
      setDoc((prev) => ({
        ...prev,
        ...updated,
        versions: prev.versions,
        currentVersion: prev.currentVersion,
      }));
    } catch (caught) {
      setActionError(apiMessage(caught));
    } finally {
      setSubmitting(false);
    }
  }

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

  let lifecycleAction: React.ReactNode = null;
  if (doc.status === "DRAFT" && hasReviewPerm) {
    lifecycleAction = (
      <Button
        disabled={!hasVersions || submitting}
        loading={submitting}
        loadingLabel="Mengajukan…"
        onClick={handleReview}
        title={!hasVersions ? "Dokumen wajib memiliki minimal satu versi sebelum dapat diajukan untuk review." : undefined}
        variant="primary"
      >
        Ajukan Review
      </Button>
    );
  } else if (doc.status === "IN_REVIEW" && hasApprovePerm && !isOwner) {
    lifecycleAction = (
      <Button
        disabled={submitting}
        loading={submitting}
        loadingLabel="Menyetujui…"
        onClick={handleApprove}
        variant="primary"
      >
        Setujui
      </Button>
    );
  } else if (doc.status === "APPROVED" && hasRetirePerm) {
    lifecycleAction = (
      <Button
        disabled={submitting}
        loading={submitting}
        loadingLabel="Mengarsipkan…"
        onClick={handleRetire}
        variant="secondary"
      >
        Tidak Berlaku / Arsipkan
      </Button>
    );
  }

  const headerMetadata = (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
        <span className={styles.versionBadge}>{doc.currentVersion ?? "—"}</span>
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
          {actionError ? (
            <Alert
              message={actionError}
              title="Gagal Memperbarui Status Dokumen"
              variant="danger"
            />
          ) : null}

          {doc.status === "DRAFT" && hasReviewPerm && !hasVersions ? (
            <Alert
              message="Minimal satu versi authoritative diperlukan sebelum dokumen dapat diajukan untuk review."
              title="Versi Diperlukan"
              variant="neutral"
            />
          ) : null}

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

          {doc.status !== "DRAFT" ? (
            <Alert
              message="Penambahan versi dokumen dibekukan setelah dokumen diajukan untuk review atau disetujui."
              title="Versi Dibekukan"
              variant="neutral"
            />
          ) : null}

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
                  <p>{v.sourceTitle ?? v.sourceId} · sumber versi {v.sourceVersion}</p>
                  <div className={styles.versionHash}>Hash Integritas: {v.contentHash}</div>
                </div>
              ))
            ) : <p>Belum ada versi dokumen yang tercatat.</p>}
          </div>
          {doc.status === "DRAFT" && hasVersionPerm ? (
            <Button onClick={() => setVersionOpen(true)} variant="secondary">Tambah Versi</Button>
          ) : null}
        </div>
      ),
    },
    {
      id: "checklist",
      label: "Checklist",
      content: <SharedWorkChecklistPanel entityType="DOCUMENT" entityId={doc.id} session={session} />,
    },
    {
      id: "relations",
      label: "Relasi",
      content: <SharedWorkRelationsPanel entityType="DOCUMENT" entityId={doc.id} session={session} workspaceKey={workspaceKey} />,
    },
    {
      id: "evidence",
      label: "Bukti",
      content: <SharedWorkEvidencePanel entityType="DOCUMENT" entityId={doc.id} session={session} />,
    },
    {
      id: "activity",
      label: "Aktivitas",
      content: <SharedWorkActivityPanel entityType="DOCUMENT" entityId={doc.id} session={session} />,
    },
    {
      id: "comments",
      label: "Komentar",
      content: <SharedWorkCommentsPanel entityType="DOCUMENT" entityId={doc.id} session={session} />,
    },
  ];

  return <>
    <DetailPageShell
      actions={
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Button
            iconBefore={<ArrowLeft size={16} strokeWidth={2} />}
            onClick={() => router.push(backUrl)}
            variant="secondary"
          >
            Kembali ke Daftar
          </Button>
          {lifecycleAction}
        </div>
      }
      activeTab={activeTab}
      description="Rincian metadata dokumen kerja, klasifikasi keamanan, dan versi dokumen."
      eyebrow="DOKUMEN"
      headerMetadata={headerMetadata}
      onTabChange={setActiveTab}
      tabs={tabs}
      title={doc.title}
    />
    {versionOpen ? <DocumentVersionDialog
      documentId={doc.id}
      onClose={() => setVersionOpen(false)}
      onCreated={(created) => setDoc((previous) => ({
        ...previous, currentVersion: created.version,
        versions: [created, ...(previous.versions ?? [])],
      }))}
    /> : null}
  </>;
}

