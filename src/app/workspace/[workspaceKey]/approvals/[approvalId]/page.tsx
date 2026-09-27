"use client";

import { use, useEffect, useState } from "react";

import { navigationForSession } from "@/app/navigation";
import { AppShell } from "@/components/app-shell/app-shell";
import { hasExecutiveContext } from "@/features/executive";
import {
  ApprovalDetailView,
  fetchApprovalDetail,
  type WorkApproval,
} from "@/features/shared-work/approvals";
import { WorkErrorState } from "@/features/shared-work/shared/errors/work-error-state";
import { WorkLoading } from "@/features/shared-work/shared/loading/work-loading";
import type { SessionProjection } from "@/features/session";
import { sessionApiRequest } from "@/lib/api";

export default function WorkspaceApprovalDetailPageRoute({
  params,
}: {
  readonly params: Promise<{ approvalId: string; workspaceKey: string }>;
}) {
  const { approvalId, workspaceKey } = use(params);

  const [session, setSession] = useState<SessionProjection | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [approval, setApproval] = useState<WorkApproval | null>(null);
  const [approvalLoading, setApprovalLoading] = useState(true);
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

        const approvalResp = await fetchApprovalDetail(approvalId);
        if (cancelled) return;
        setConnected(approvalResp.connected);
        setApproval(approvalResp.data);
        setApprovalLoading(false);
      } catch (err) {
        if (!cancelled) {
          setError(err);
          setSessionLoading(false);
          setApprovalLoading(false);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [approvalId]);

  if (sessionLoading || approvalLoading) {
    return <WorkLoading label="Memuat rincian persetujuan…" />;
  }

  if (error || !session) {
    return <WorkErrorState error={error} title="Gagal Memuat Persetujuan" />;
  }

  const canOpenExecutive = hasExecutiveContext(session);

  return (
    <AppShell
      navigationSections={navigationForSession(canOpenExecutive, workspaceKey)}
      session={session}
    >
      {approval ? (
        <ApprovalDetailView
          approval={approval}
          isConnected={connected}
          workspaceKey={workspaceKey}
        />
      ) : (
        <WorkErrorState
          error={new Error("Data persetujuan yang Anda cari tidak ditemukan.")}
          title="Persetujuan Tidak Ditemukan"
        />
      )}
    </AppShell>
  );
}
