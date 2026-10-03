"use client";

import { useState, type ReactNode } from "react";
import { PageHeader, Tabs } from "@/components/ui";
import type { SessionProjection } from "@/features/session";
import type { Resource } from "./resource";
import { RecordPanel } from "./record-panel";
import styles from "@/features/property/property.module.css";

export function BusinessDataPage({ title, description, resources, session, children, renderSummary, afterRecords }: Readonly<{
  title: string; description: string; resources: readonly Resource[]; session: SessionProjection; children?: ReactNode;
  renderSummary?: (resource: Resource, rows: readonly object[]) => ReactNode;
  afterRecords?: ReactNode;
}>) {
  const [tab, setTab] = useState(resources[0].key);
  const active = session.principal && "actor" in session.principal ? session.principal.active_workspace : null;
  const resource = resources.find((item) => item.key === tab) ?? resources[0];
  return <div className={styles.page}>
    <PageHeader title={title} description={description} metadata={`Ruang kerja: ${active?.workspace.workspace_name ?? "—"}`} />
    {children}
    <Tabs ariaLabel={`Navigasi ${title}`} items={resources.map((item) => ({ id: item.key, label: item.title }))} value={tab} onValueChange={setTab} />
    <RecordPanel key={`${session.principal && "actor" in session.principal ? session.principal.actor.actor_id : "unknown"}-${active?.workspace.workspace_id ?? "unknown"}-${resource.domain}-${resource.key}`} resource={resource} session={session} renderSummary={renderSummary ? rows => renderSummary(resource, rows) : undefined} />
    {afterRecords}
  </div>;
}
