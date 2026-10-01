"use client";
import { LegalCanonicalPage } from "../canonical-page";
import { legalResources } from "../resources";
export function LegalObligationsPage({ workspaceKey }: Readonly<{ workspaceKey?: string }>) {
  return <LegalCanonicalPage workspaceKey={workspaceKey} title="Kewajiban & Tenggat" description="Rekaman internal Legal dalam scope aktif; status tercatat tidak menyatakan validitas atau keputusan hukum final." resources={[legalResources.expiries, legalResources.privacy_requests]} unavailable={["Kepatuhan Regulasi Otomatis"]} />;
}
