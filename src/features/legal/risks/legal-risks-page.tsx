"use client";
import { LegalCanonicalPage } from "../canonical-page";
import { legalResources } from "../resources";
export function LegalRisksPage({ workspaceKey }: Readonly<{ workspaceKey?: string }>) {
  return <LegalCanonicalPage workspaceKey={workspaceKey} title="Risiko & Kepatuhan" description="Rekaman internal Legal dalam scope aktif; status tercatat tidak menyatakan validitas atau keputusan hukum final." resources={[legalResources.risks, legalResources.controls]} unavailable={["Skor Kepatuhan Resmi"]} />;
}
