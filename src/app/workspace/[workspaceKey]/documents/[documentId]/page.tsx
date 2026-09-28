"use client";

import { use, useEffect, useState } from "react";

import { navigationForSession } from "@/app/navigation";
import { AppShell } from "@/components/app-shell/app-shell";
import { hasExecutiveContext } from "@/features/executive";
import {
  DocumentDetailView,
  fetchDocumentDetail,
  type WorkDocument,
} from "@/features/shared-work/documents";
import { WorkErrorState } from "@/features/shared-work/shared/errors/work-error-state";
import { WorkLoading } from "@/features/shared-work/shared/loading/work-loading";
import type { SessionProjection } from "@/features/session";
import { sessionApiRequest } from "@/lib/api";

export default function WorkspaceDocumentDetailPageRoute({
  params,
}: {
  readonly params: Promise<{ documentId: string; workspaceKey: string }>;
}) {
  const { documentId, workspaceKey } = use(params);

  const [session, setSession] = useState<SessionProjection | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [document, setDocument] = useState<WorkDocument | null>(null);
  const [documentLoading, setDocumentLoading] = useState(true);
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

        const docResp = await fetchDocumentDetail(documentId);
        if (cancelled) return;
        setConnected(docResp.connected);
        setDocument(docResp.data);
        setDocumentLoading(false);
      } catch (err) {
        if (!cancelled) {
          setError(err);
          setSessionLoading(false);
          setDocumentLoading(false);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [documentId]);

  if (sessionLoading || documentLoading) {
    return <WorkLoading label="Memuat rincian dokumen…" />;
  }

  if (error || !session) {
    return <WorkErrorState error={error} title="Gagal Memuat Dokumen" />;
  }

  const canOpenExecutive = hasExecutiveContext(session);

  return (
    <AppShell
      navigationSections={navigationForSession(canOpenExecutive, workspaceKey, false, session)}
      session={session}
    >
      {document ? (
        <DocumentDetailView
          document={document}
          isConnected={connected}
          workspaceKey={workspaceKey}
        />
      ) : (
        <WorkErrorState
          error={new Error("Data dokumen yang Anda cari tidak ditemukan.")}
          title="Dokumen Tidak Ditemukan"
        />
      )}
    </AppShell>
  );
}
