"use client";
import { LegalCanonicalPage } from "../canonical-page";
import { legalResources } from "../resources";
export function LegalContractsPage({ workspaceKey }: Readonly<{ workspaceKey?: string }>) {
  return <LegalCanonicalPage workspaceKey={workspaceKey} title="Kontrak & Perjanjian" description="Rekaman internal Legal dalam scope aktif; status tercatat tidak menyatakan validitas atau keputusan hukum final." resources={[legalResources.contracts, legalResources.contract_revisions]} unavailable={["Signing dan Eksekusi Legal Final", "Signing Revisi Kontrak"]} />;
}
