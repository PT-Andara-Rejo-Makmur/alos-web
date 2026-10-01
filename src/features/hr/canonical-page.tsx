"use client";
import { BusinessDataPage } from "@/features/business-records/data-page";
import { EmptyState, Section } from "@/components/ui";
import type { Resource } from "@/features/business-records/resource";
import { HrLayout } from "./hr-layout";

export function HrCanonicalPage({ title, description, resources, unavailable = [], workspaceKey }: Readonly<{
  title: string; description: string; resources: readonly Resource[]; unavailable?: readonly string[]; workspaceKey?: string;
}>) {
  return <HrLayout workspaceKey={workspaceKey}>{(session) => <BusinessDataPage title={title} description={description} resources={resources} session={session}>
    {unavailable.length ? <Section title="Capability yang Belum Tersedia">{unavailable.map((label) => <EmptyState key={label} title={label} description="Sumber atau kewenangan canonical belum tersedia." />)}</Section> : null}
  </BusinessDataPage>}</HrLayout>;
}
