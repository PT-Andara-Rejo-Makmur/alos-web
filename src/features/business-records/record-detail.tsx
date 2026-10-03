"use client";
import { useEffect, useState } from "react";
import { PageHeader, Section } from "@/components/ui";
import { authenticatedApiRequest } from "@/lib/api";
import { SourceStateView, sourceFailure } from "./record-panel";
import { recordFieldValue, type Resource, type SourceState } from "./resource";
import { ProcessRequest } from "./process-request";
import { BusinessRecordContext } from "./record-context";
import styles from "@/components/ui/work-surface.module.css";

export function RecordDetail({ resource, recordId }: Readonly<{ resource: Resource; recordId?: string }>) {
  const [record, setRecord] = useState<Record<string, unknown> | null>(null);
  const [state, setState] = useState<SourceState>("loading");
  useEffect(() => {
    if (!recordId) return;
    const controller = new AbortController();
    void authenticatedApiRequest<Record<string, unknown>>(`/api/v1/${resource.domain}/${resource.key.replaceAll("_", "-")}/${encodeURIComponent(recordId)}`, { signal: controller.signal })
      .then(data => { if (!controller.signal.aborted) { setRecord(data); setState("CONNECTED"); } })
      .catch((error: unknown) => { if (!controller.signal.aborted) { setRecord(null); setState(sourceFailure(error)); } });
    return () => controller.abort();
  }, [resource, recordId]);
  return <div className={styles.stack}><PageHeader title={String(record?.name ?? record?.title ?? record?.code ?? `Detail ${resource.title}`)} description="Informasi pengajuan, pekerjaan terkait, dan tindakan berikutnya." />
    <SourceStateView state={recordId ? state : "UNAVAILABLE"} />
    {record && recordId && state === "CONNECTED" ? <><Section title="Informasi"><dl className={styles.facts}>{resource.columns.filter(field => field.name in record && !/(_id|_ref)$/.test(field.name)).map(field => <div key={field.name}><dt>{field.label}</dt><dd>{recordFieldValue(field, record[field.name])}</dd></div>)}</dl></Section><BusinessRecordContext resource={resource} identity={recordId} record={record} /><ProcessRequest domain={resource.domain} resource={resource.key} identity={recordId} /></> : null}
  </div>;
}
