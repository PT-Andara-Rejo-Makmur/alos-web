"use client";

import { useEffect, useState, type ReactNode } from "react";

import { navigationForSession } from "@/app/navigation";
import { AppShell } from "@/components/app-shell/app-shell";
import { hasExecutiveContext } from "@/features/executive";
import { resolveWorkspaceDomain, type SessionProjection } from "@/features/session";
import { sessionApiRequest } from "@/lib/api";

import { WorkErrorState } from "./errors/work-error-state";
import { WorkLoading } from "./loading/work-loading";

interface DetailResponse<T> {
  readonly connected: boolean;
  readonly data: T | null;
}

export interface SharedWorkDetailRouteProps<T> {
  readonly fetchDetail: (id: string) => Promise<DetailResponse<T>>;
  readonly id: string;
  readonly notFoundTitle: string;
  readonly title: string;
  readonly workspaceKey: string;
  readonly loadingLabel: string;
  readonly renderDetail: (detail: T, connected: boolean, workspaceKey: string, session: SessionProjection) => ReactNode;
}

/** Shared shell/access boundary for every universal Shared Work detail route. */
export function SharedWorkDetailRoute<T>({
  fetchDetail,
  id,
  loadingLabel,
  notFoundTitle,
  renderDetail,
  title,
  workspaceKey,
}: SharedWorkDetailRouteProps<T>) {
  const [session, setSession] = useState<SessionProjection | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [detail, setDetail] = useState<T | null>(null);
  const [detailLoading, setDetailLoading] = useState(true);
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

        if (!resolveWorkspaceDomain(nextSession, workspaceKey).valid) {
          setError(new Error("Workspace route tidak sesuai dengan active workspace."));
          setDetailLoading(false);
          return;
        }

        const response = await fetchDetail(id);
        if (cancelled) return;
        setConnected(response.connected);
        setDetail(response.data);
        setDetailLoading(false);
      } catch (caught) {
        if (!cancelled) {
          setError(caught);
          setSessionLoading(false);
          setDetailLoading(false);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [fetchDetail, id, workspaceKey]);

  if (sessionLoading || detailLoading) return <WorkLoading label={loadingLabel} />;
  if (error || !session) return <WorkErrorState error={error} title={`Gagal Memuat ${title}`} />;

  const resolution = resolveWorkspaceDomain(session, workspaceKey);
  if (!resolution.valid || !resolution.activeWorkspaceKey) {
    return <WorkErrorState error={new Error("Workspace route tidak sesuai dengan active workspace.")} title="Akses Ditolak" />;
  }

  return (
    <AppShell
      navigationSections={navigationForSession(hasExecutiveContext(session), resolution.activeWorkspaceKey, false, session)}
      session={session}
    >
      {detail
        ? renderDetail(detail, connected, resolution.activeWorkspaceKey, session)
        : <WorkErrorState error={new Error("Data yang Anda cari tidak ditemukan.")} title={notFoundTitle} />}
    </AppShell>
  );
}
