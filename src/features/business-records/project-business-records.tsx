"use client";

import { useEffect, useState } from "react";
import { Alert, DataTable } from "@/components/ui";
import { statusLabel } from "@/lib/presentation";
import { apiMessage, authenticatedApiRequest } from "@/lib/api";
import type { BusinessProjectRecordOverview } from "@/lib/contracts";

export function ProjectBusinessRecords({ projectId, resourceFilter }: Readonly<{ projectId: string; resourceFilter?: string }>) {
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
  const items = data.items.filter(item => !resourceFilter || item.resource === resourceFilter);
  if (!items.length) return <p>{resourceFilter ? "Belum ada milestone yang dapat dibaca dalam ruang kerja aktif." : "Belum ada catatan bisnis terkait yang dapat dibaca dalam ruang kerja aktif."}</p>;
  return <DataTable rows={items} getRowKey={row => `${row.domain}:${row.resource}:${row.record_id}`} columns={[
    { key: "label", header: "Catatan Bisnis", render: row => row.label },
    { key: "status", header: "Status", render: row => row.status ? statusLabel(row.status) : "Belum tersedia" },
  ]} />;
}
