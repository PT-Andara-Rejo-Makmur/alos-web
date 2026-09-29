"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui";

import { QuickViewDrawer } from "../shared/drawers/quick-view-drawer";
import drawerStyles from "../shared/drawers/drawer-layout.module.css";
import relationshipStyles from "../shared/relationship/relationship.module.css";
import { ReportFrequencyBadge, ReportStatusBadge } from "./report-status";
import type { WorkReportDefinition, WorkReportResult } from "./report-types";
import styles from "./reports.module.css";

interface ReportDrawerProps {
  readonly definition?: WorkReportDefinition | null;
  readonly isConnected?: boolean;
  readonly onClose: () => void;
  readonly open: boolean;
  readonly report?: WorkReportResult | null;
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

export function ReportDrawer({
  definition,
  isConnected = true,
  onClose,
  open,
  report,
  workspaceKey,
}: ReportDrawerProps) {
  const router = useRouter();

  if (!report && !definition) return null;

  if (report) {
    const detailPath = workspaceKey
      ? `/workspace/${workspaceKey}/reports/${report.id}`
      : "/workspace";

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

    const periodDisplay =
      report.periodStart || report.periodEnd
        ? `${formatDate(report.periodStart)} s/d ${formatDate(report.periodEnd)}`
        : "—";

    return (
      <QuickViewDrawer
        footer={footer}
        onClose={onClose}
        open={open}
        title={<span>{report.title}</span>}
      >
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

        {report.description ? (
          <div className={drawerStyles.drawerSection}>
            <h4 className={drawerStyles.drawerSectionTitle}>Deskripsi</h4>
            <p style={{ margin: 0, fontSize: "14px", color: "var(--alos-text-secondary)", lineHeight: "1.5" }}>
              {report.description}
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

  // Definition quick view
  const footer = (
    <div className={styles.drawerFooterActions}>
      <Button onClick={onClose} variant="ghost">
        Tutup
      </Button>
    </div>
  );

  return (
    <QuickViewDrawer
      footer={footer}
      onClose={onClose}
      open={open}
      title={<span>{definition?.name}</span>}
    >
      <dl className={drawerStyles.definitionList}>
        <dt className={drawerStyles.definitionTerm}>Jenis Laporan</dt>
        <dd className={drawerStyles.definitionDetail}>{definition?.reportType ?? "—"}</dd>

        <dt className={drawerStyles.definitionTerm}>Frekuensi</dt>
        <dd className={drawerStyles.definitionDetail}>
          <ReportFrequencyBadge frequency={definition?.frequency} />
        </dd>

        <dt className={drawerStyles.definitionTerm}>Lingkup</dt>
        <dd className={drawerStyles.definitionDetail}>{definition?.scope ?? "—"}</dd>

        <dt className={drawerStyles.definitionTerm}>Pemilik</dt>
        <dd className={drawerStyles.definitionDetail}>{definition?.ownerName ?? "—"}</dd>

        <dt className={drawerStyles.definitionTerm}>Workspace</dt>
        <dd className={drawerStyles.definitionDetail}>{definition?.workspaceName ?? "—"}</dd>

        <dt className={drawerStyles.definitionTerm}>Review Wajib</dt>
        <dd className={drawerStyles.definitionDetail}>
          {definition?.reviewRequired ? "Diperlukan" : "Tidak Diperlukan"}
        </dd>
      </dl>

      {definition?.recipients && definition.recipients.length > 0 ? (
        <div className={drawerStyles.drawerSection}>
          <h4 className={drawerStyles.drawerSectionTitle}>Penerima</h4>
          <div className={styles.recipientList}>
            {definition.recipients.map((rec) => (
              <span className={styles.recipientTag} key={rec}>
                {rec}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {definition?.dataSources && definition.dataSources.length > 0 ? (
        <div className={drawerStyles.drawerSection}>
          <h4 className={drawerStyles.drawerSectionTitle}>Sumber Data</h4>
          <div className={styles.recipientList}>
            {definition.dataSources.map((ds) => (
              <span className={styles.recipientTag} key={ds}>
                {ds}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </QuickViewDrawer>
  );
}
