"use client";

import { Fragment, useEffect, useState } from "react";
import { PageHeader, Section } from "@/components/ui";
import { authenticatedApiRequest } from "@/lib/api";
import { SourceStateView, sourceFailure } from "./record-panel";
import type { Resource, SourceState } from "./resource";

export function RecordDetail({ resource, recordId }: Readonly<{ resource: Resource; recordId?: string }>) {
  const [record, setRecord] = useState<Record<string, unknown> | null>(null);
  const [state, setState] = useState<SourceState>("loading");
  useEffect(() => {
    if (!recordId) return;
    let current = true;
    const controller = new AbortController();
    void authenticatedApiRequest<Record<string, unknown>>(`/api/v1/${resource.domain}/${resource.key.replaceAll("_", "-")}/${encodeURIComponent(recordId)}`, { signal: controller.signal })
      .then((data) => { if (current) { setRecord(data); setState("CONNECTED"); } })
      .catch((error: unknown) => { if (current) { setRecord(null); setState(sourceFailure(error)); } });
    return () => { current = false; controller.abort(); };
  }, [resource, recordId]);
  return <div><PageHeader title={`Detail ${resource.title}`} description="Identitas pada URL tetap diperiksa terhadap scope aktif oleh Backend." />
    <SourceStateView state={recordId ? state : "UNAVAILABLE"} />
    {record && state === "CONNECTED" ? <Section title="Rekaman Tersimpan"><dl>{Object.entries(record).filter(([key]) => !["tenant_id", "organization_id", "workspace_id", "allowed_transitions"].includes(key)).map(([key, value]) => <Fragment key={key}><dt>{resource.columns.find((column) => column.name === key)?.label ?? key}</dt><dd>{value == null ? "—" : String(value)}</dd></Fragment>)}</dl></Section> : null}
  </div>;
}
