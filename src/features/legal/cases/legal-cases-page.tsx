"use client";
import { LegalCanonicalPage } from "../canonical-page";
import { legalResources } from "../resources";
export function LegalCasesPage({ workspaceKey }: Readonly<{ workspaceKey?: string }>) {
  return <LegalCanonicalPage workspaceKey={workspaceKey} title="Sengketa & Klaim" description="Rekaman internal Legal dalam scope aktif; status tercatat tidak menyatakan validitas atau keputusan hukum final." resources={[legalResources.cases, legalResources.claim_reviews]} unavailable={["Putusan Hukum"]} />;
}
