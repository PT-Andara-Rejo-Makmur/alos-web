"use client";
import { BusinessDataPage } from "@/features/business-records/data-page";
import type { Resource } from "@/features/business-records/resource";
import { LegalLayout } from "./legal-layout";

export function LegalCanonicalPage({ title, description, resources, unavailable = [], workspaceKey }: Readonly<{
  title: string; description: string; resources: readonly Resource[]; unavailable?: readonly string[]; workspaceKey?: string;
}>) {
  return <LegalLayout workspaceKey={workspaceKey}>{(session) => <BusinessDataPage title={title} description={description} resources={resources} session={session} afterRecords={unavailable.length ? <details><summary>Informasi Tambahan</summary><p>Informasi berikut belum tersedia:</p><ul>{unavailable.map(label => <li key={label}>{label}</li>)}</ul></details> : null}>

  </BusinessDataPage>}</LegalLayout>;
}
