"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button, type TabItem } from "@/components/ui";

import { ActivityTimeline } from "../shared/activity/activity-timeline";
import { DetailPageShell } from "../shared/drawers/detail-page-shell";
import drawerStyles from "../shared/drawers/drawer-layout.module.css";
import { EvidenceList } from "../shared/evidence/evidence-list";
import relationshipStyles from "../shared/relationship/relationship.module.css";
import { ReportStatusBadge } from "./report-status";
import type { WorkReportResult } from "./report-types";

interface ReportDetailViewProps {
  readonly isConnected?: boolean;
  readonly report: WorkReportResult;
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

export function ReportDetailView({
  isConnected = true,
  report,
  workspaceKey,
}: ReportDetailViewProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("detail");

  const backUrl = workspaceKey ? `/workspace/${workspaceKey}/reports` : "/workspace/reports";

  const periodDisplay =
    report.periodStart || report.periodEnd
      ? `${formatDate(report.periodStart)} s/d ${formatDate(report.periodEnd)}`
      : "—";

  const relatedItems = [
    { key: "evidence", label: "Bukti", count: report.evidenceCount },
    { key: "comments", label: "Komentar", count: report.commentsCount },
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
        <ReportStatusBadge status={report.status} />
      </div>

      <dl className={drawerStyles.definitionList}>
        <dt className={drawerStyles.definitionTerm}>Status</dt>
        <dd className={drawerStyles.definitionDetail}>
          <ReportStatusBadge status={report.status} />
        </dd>

        <dt className={drawerStyles.definitionTerm}>Jenis Laporan</dt>
        <dd className={drawerStyles.definitionDetail}>{report.reportType}</dd>

        <dt className={drawerStyles.definitionTerm}>Periode</dt>
        <dd className={drawerStyles.definitionDetail}>{periodDisplay}</dd>

        <dt className={drawerStyles.definitionTerm}>Lingkup</dt>
        <dd className={drawerStyles.definitionDetail}>{report.scope ?? "—"}</dd>

        <dt className={drawerStyles.definitionTerm}>Pemilik</dt>
        <dd className={drawerStyles.definitionDetail}>{report.ownerName ?? "—"}</dd>

        <dt className={drawerStyles.definitionTerm}>Workspace</dt>
        <dd className={drawerStyles.definitionDetail}>{report.workspaceName ?? "—"}</dd>

        <dt className={drawerStyles.definitionTerm}>Dibuat</dt>
        <dd className={drawerStyles.definitionDetail}>{formatDate(report.createdAt)}</dd>

        <dt className={drawerStyles.definitionTerm}>Diterbitkan</dt>
        <dd className={drawerStyles.definitionDetail}>{formatDate(report.publishedAt)}</dd>
      </dl>
    </div>
  );

  const tabs: readonly TabItem[] = [
    {
      id: "detail",
      label: "Detail",
      content: (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {report.description ? (
            <div style={{ padding: "16px", background: "var(--alos-surface)", border: "1px solid var(--alos-border)", borderRadius: "8px" }}>
              <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--alos-text-muted)", textTransform: "uppercase" }}>
                Ringkasan Laporan
              </span>
              <p style={{ margin: "8px 0 0 0", fontSize: "14px", color: "var(--alos-text-primary)", lineHeight: "1.6" }}>
                {report.description}
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
          Kembali ke Laporan
        </Button>
      }
      activeTab={activeTab}
      eyebrow="PEKERJAAN / LAPORAN"
      headerMetadata={headerMetadata}
      onTabChange={setActiveTab}
      tabs={tabs}
      title={report.title}
    />
  );
}
