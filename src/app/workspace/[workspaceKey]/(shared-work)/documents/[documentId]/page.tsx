"use client";

import { use } from "react";

import {
  DocumentDetailView,
  SharedWorkDetailRoute,
  fetchDocumentDetail,
  type WorkDocument,
} from "@/features/shared-work";

export default function WorkspaceDocumentDetailPageRoute({
  params,
}: Readonly<{ params: Promise<{ documentId: string; workspaceKey: string }> }>) {
  const { documentId, workspaceKey } = use(params);
  return (
    <SharedWorkDetailRoute<WorkDocument>
      fetchDetail={fetchDocumentDetail}
      id={documentId}
      loadingLabel="Memuat rincian dokumen…"
      notFoundTitle="Dokumen Tidak Ditemukan"
      renderDetail={(document, connected, key) => <DocumentDetailView document={document} isConnected={connected} workspaceKey={key} />}
      title="Dokumen"
      workspaceKey={workspaceKey}
    />
  );
}
