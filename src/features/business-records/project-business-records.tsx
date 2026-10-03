"use client";

import { useEffect, useState } from "react";
import { Alert, DataTable } from "@/components/ui";
import { apiMessage, authenticatedApiRequest } from "@/lib/api";
import type { BusinessProjectRecordOverview } from "@/lib/contracts";

export function ProjectBusinessRecords({ projectId }: Readonly<{ projectId: string }>) {
  const [data, setData] = useState<BusinessProjectRecordOverview | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    authenticatedApiRequest<BusinessProjectRecordOverview>(`/api/v1/business/projects/${encodeURIComponent(projectId)}/records`, { signal: controller.signal })
      .then(result => { if (!controller.signal.aborted) setData(result); })
      .catch(caught => { if (!controller.signal.aborted) setError(apiMessage(caught)); });
    return () => controller.abort();
  }, [projectId]);
  if (error) return <Alert variant="danger" message={error} />;
  if (!data) return <p>Memuat catatan bisnis terkait…</p>;
  if (!data.items.length) return <p>Belum ada catatan bisnis terkait yang dapat dibaca dalam ruang kerja aktif.</p>;
  return <DataTable rows={data.items} getRowKey={row => `${row.domain}:${row.resource}:${row.record_id}`} columns={[
    { key: "label", header: "Catatan Bisnis", render: row => row.label },
    { key: "status", header: "Status", render: row => row.status },
  ]} />;
}
