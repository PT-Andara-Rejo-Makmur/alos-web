"use client";

import { use, useEffect, useState } from "react";

import { navigationForSession } from "@/app/navigation";
import { AppShell } from "@/components/app-shell/app-shell";
import { hasExecutiveContext } from "@/features/executive";
import {
  FindingDetailView,
  fetchFindingDetail,
  type WorkFinding,
} from "@/features/shared-work/findings";
import { WorkErrorState } from "@/features/shared-work/shared/errors/work-error-state";
import { WorkLoading } from "@/features/shared-work/shared/loading/work-loading";
import type { SessionProjection } from "@/features/session";
import { sessionApiRequest } from "@/lib/api";

export default function GlobalFindingDetailPageRoute({
  params,
}: {
  readonly params: Promise<{ findingId: string }>;
}) {
  const { findingId } = use(params);

  const [session, setSession] = useState<SessionProjection | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [finding, setFinding] = useState<WorkFinding | null>(null);
  const [findingLoading, setFindingLoading] = useState(true);
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

        const findResp = await fetchFindingDetail(findingId);
        if (cancelled) return;
        setConnected(findResp.connected);
        setFinding(findResp.data);
        setFindingLoading(false);
      } catch (err) {
        if (!cancelled) {
          setError(err);
          setSessionLoading(false);
          setFindingLoading(false);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [findingId]);

  if (sessionLoading || findingLoading) {
    return <WorkLoading label="Memuat rincian temuan…" />;
  }

  if (error || !session) {
    return <WorkErrorState error={error} title="Gagal Memuat Temuan" />;
  }

  const canOpenExecutive = hasExecutiveContext(session);

  return (
    <AppShell
      navigationSections={navigationForSession(canOpenExecutive, null)}
      session={session}
    >
      {finding ? (
        <FindingDetailView
          finding={finding}
          isConnected={connected}
          workspaceKey={null}
        />
      ) : (
        <WorkErrorState
          error={new Error("Data temuan yang Anda cari tidak ditemukan.")}
          title="Temuan Tidak Ditemukan"
        />
      )}
    </AppShell>
  );
}
