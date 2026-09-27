"use client";

import { ArrowLeft, CheckCircle2, ListTodo } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Alert, Button, type TabItem } from "@/components/ui";

import { ActivityTimeline } from "../shared/activity/activity-timeline";
import { DetailPageShell } from "../shared/drawers/detail-page-shell";
import drawerStyles from "../shared/drawers/drawer-layout.module.css";
import { EvidenceList } from "../shared/evidence/evidence-list";
import relationshipStyles from "../shared/relationship/relationship.module.css";
import { FindingSeverityBadge, FindingStatusBadge } from "./finding-status";
import type { WorkFinding } from "./finding-types";
import styles from "./findings.module.css";

interface FindingDetailViewProps {
  readonly finding: WorkFinding;
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

export function FindingDetailView({
  finding,
  isConnected = true,
  workspaceKey,
}: FindingDetailViewProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("detail");

  const backUrl = workspaceKey ? `/workspace/${workspaceKey}/findings` : "/workspace/findings";

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

  const headerMetadata = (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
        <FindingStatusBadge status={finding.status} />
        <FindingSeverityBadge severity={finding.severity} />
      </div>

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

        <dt className={drawerStyles.definitionTerm}>Pemilik / PIC</dt>
        <dd className={drawerStyles.definitionDetail}>{finding.ownerName ?? "—"}</dd>

        <dt className={drawerStyles.definitionTerm}>Verifier</dt>
        <dd className={drawerStyles.definitionDetail}>{finding.verifierName ?? "—"}</dd>

        <dt className={drawerStyles.definitionTerm}>Proyek</dt>
        <dd className={drawerStyles.definitionDetail}>
          {finding.projectName ?? (finding.projectId ? "Proyek terkait" : "—")}
        </dd>

        <dt className={drawerStyles.definitionTerm}>Workspace</dt>
        <dd className={drawerStyles.definitionDetail}>{finding.workspaceName ?? "—"}</dd>

        <dt className={drawerStyles.definitionTerm}>Ditemukan</dt>
        <dd className={drawerStyles.definitionDetail}>{formatDate(finding.identifiedAt)}</dd>

        <dt className={drawerStyles.definitionTerm}>Tenggat</dt>
        <dd className={drawerStyles.definitionDetail}>{formatDate(finding.dueDate)}</dd>
      </dl>
    </div>
  );

  const tabs: readonly TabItem[] = [
    {
      id: "detail",
      label: "Detail",
      content: (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {finding.description ? (
            <div style={{ padding: "16px", background: "var(--alos-surface)", border: "1px solid var(--alos-border)", borderRadius: "8px" }}>
              <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--alos-text-muted)", textTransform: "uppercase" }}>
                Deskripsi Temuan
              </span>
              <p style={{ margin: "8px 0 0 0", fontSize: "14px", color: "var(--alos-text-primary)", lineHeight: "1.6" }}>
                {finding.description}
              </p>
            </div>
          ) : null}

          {finding.impact ? (
            <div style={{ padding: "16px", background: "var(--alos-surface)", border: "1px solid var(--alos-border)", borderRadius: "8px" }}>
              <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--alos-text-muted)", textTransform: "uppercase" }}>
                Dampak
              </span>
              <p style={{ margin: "8px 0 0 0", fontSize: "14px", color: "var(--alos-text-primary)", lineHeight: "1.6" }}>
                {finding.impact}
              </p>
            </div>
          ) : null}

          {finding.rootCause ? (
            <div style={{ padding: "16px", background: "var(--alos-surface)", border: "1px solid var(--alos-border)", borderRadius: "8px" }}>
              <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--alos-text-muted)", textTransform: "uppercase" }}>
                Penyebab Utama (Root Cause)
              </span>
              <p style={{ margin: "8px 0 0 0", fontSize: "14px", color: "var(--alos-text-primary)", lineHeight: "1.6" }}>
                {finding.rootCause}
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
      id: "corrective_action",
      label: "Tindak Lanjut",
      content: (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <Alert
            icon={<CheckCircle2 size={16} />}
            message="Setiap temuan ditindaklanjuti melalui relasi tugas terstruktur: Temuan → Tindak Lanjut (Tugas) → Bukti Verifikasi → Penutupan Temuan."
            title="Alur Tindak Lanjut & Perbaikan"
            variant="neutral"
          />

          {finding.correctiveActionTaskId ? (
            <div className={styles.correctiveActionBox}>
              <span className={styles.correctiveActionTitle}>Tugas Perbaikan Terhubung</span>
              <div className={styles.taskLinkBox}>
                <ListTodo size={16} />
                <Link
                  href={
                    workspaceKey
                      ? `/workspace/${workspaceKey}/tasks/${finding.correctiveActionTaskId}`
                      : `/workspace/tasks/${finding.correctiveActionTaskId}`
                  }
                  style={{ color: "var(--alos-primary)", textDecoration: "underline", fontWeight: 500 }}
                >
                  {finding.correctiveActionTaskTitle ?? "Lihat Tugas Perbaikan"}
                </Link>
              </div>
            </div>
          ) : (
            <div className={styles.correctiveActionBox}>
              <span className={styles.correctiveActionTitle}>Belum Ada Tugas Perbaikan Terhubung</span>
              <p className={styles.correctiveActionDesc}>
                Tindak lanjut dapat dibuat melalui tugas terstruktur setelah tindakan perbaikan disepakati oleh penanggung jawab.
              </p>
            </div>
          )}
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
          iconBefore={<ArrowLeft size={16} />}
          onClick={() => router.push(backUrl)}
          size="sm"
          variant="ghost"
        >
          Kembali ke Temuan
        </Button>
      }
      activeTab={activeTab}
      eyebrow="PEKERJAAN / TEMUAN"
      headerMetadata={headerMetadata}
      onTabChange={setActiveTab}
      tabs={tabs}
      title={finding.title}
    />
  );
}
