"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { DataTable, Section } from "@/components/ui";
import { authenticatedApiRequest } from "@/lib/api";
import type { SharedWorkProjectProjection } from "@/lib/contracts";
import type { SourceState } from "./resource";
import { SourceStateView, sourceFailure } from "./record-panel";

export function ProjectReferences({ workspaceKey }: Readonly<{ workspaceKey: string }>) {
  const [rows, setRows] = useState<readonly SharedWorkProjectProjection[]>([]);
  const [state, setState] = useState<SourceState>("loading");
  useEffect(() => {
    let current = true; const controller = new AbortController();
    void authenticatedApiRequest<readonly SharedWorkProjectProjection[]>("/api/v1/projects", { signal: controller.signal }).then((data) => {
      if (current) { setRows(data); setState(data.length ? "CONNECTED" : "CONNECTED_EMPTY"); }
    }).catch((error: unknown) => { if (current) { setRows([]); setState(sourceFailure(error)); } });
    return () => { current = false; controller.abort(); };
  }, [workspaceKey]);
  return <Section title="Proyek Shared Work" description="Project tetap dimiliki Shared Work; lifecycle dan visibility berasal dari sumber tersebut.">
    <SourceStateView state={state} />
    {state === "CONNECTED" ? <DataTable caption="Proyek Property yang terlihat" rows={rows} getRowKey={(row) => row.project_id} columns={[
      { key: "code", header: "Kode", render: (row) => row.code }, { key: "name", header: "Proyek", render: (row) => row.name },
      { key: "status", header: "Status", render: (row) => row.status }, { key: "updated", header: "Pembaruan Sumber", render: (row) => row.updated_at },
    ]} rowAction={(row) => <Link href={`/workspace/${encodeURIComponent(workspaceKey)}/projects/${encodeURIComponent(row.project_id)}`}>Buka Proyek</Link>} /> : null}
  </Section>;
}
