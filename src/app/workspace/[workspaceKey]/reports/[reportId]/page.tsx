"use client";

import { use, useEffect, useState } from "react";

import { navigationForSession } from "@/app/navigation";
import { AppShell } from "@/components/app-shell/app-shell";
import { hasExecutiveContext } from "@/features/executive";
import {
  ReportDetailView,
  fetchReportDetail,
  type WorkReportResult,
} from "@/features/shared-work/reports";
import { WorkErrorState } from "@/features/shared-work/shared/errors/work-error-state";
import { WorkLoading } from "@/features/shared-work/shared/loading/work-loading";
import type { SessionProjection } from "@/features/session";
import { sessionApiRequest } from "@/lib/api";

export default function WorkspaceReportDetailPageRoute({
  params,
}: {
  readonly params: Promise<{ reportId: string; workspaceKey: string }>;
}) {
  const { reportId, workspaceKey } = use(params);

  const [session, setSession] = useState<SessionProjection | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [report, setReport] = useState<WorkReportResult | null>(null);
  const [reportLoading, setReportLoading] = useState(true);
  const [connected, setConnected] = useState(true);
  const [error, setError] = useState<unknown | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const nextSession = await sessionApiRequest<SessionProjection>("/");
        if (cancelled) return;
        setSession(nextSession);
        setSessionLoading(false);

        const repResp = await fetchReportDetail(reportId);
        if (cancelled) return;
        setConnected(repResp.connected);
        setReport(repResp.data);
        setReportLoading(false);
      } catch (err) {
        if (!cancelled) {
          setError(err);
          setSessionLoading(false);
          setReportLoading(false);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [reportId]);

  if (sessionLoading || reportLoading) {
    return <WorkLoading label="Memuat rincian laporan…" />;
  }

  if (error || !session) {
    return <WorkErrorState error={error} title="Gagal Memuat Laporan" />;
  }

  const canOpenExecutive = hasExecutiveContext(session);

  return (
    <AppShell
      navigationSections={navigationForSession(canOpenExecutive, workspaceKey, false, session)}
      session={session}
    >
      {report ? (
        <ReportDetailView
          isConnected={connected}
          report={report}
          workspaceKey={workspaceKey}
        />
      ) : (
        <WorkErrorState
          error={new Error("Data laporan yang Anda cari tidak ditemukan.")}
          title="Laporan Tidak Ditemukan"
        />
      )}
    </AppShell>
  );
}
