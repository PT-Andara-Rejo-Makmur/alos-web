"use client";
import { LegalCanonicalPage } from "../canonical-page";
import { legalResources } from "../resources";
export function LegalCasesPage({ workspaceKey }: Readonly<{ workspaceKey?: string }>) {
  return <LegalCanonicalPage workspaceKey={workspaceKey} title="Sengketa & Klaim" description="Kelola perjanjian, pemeriksaan, dan kewajiban perusahaan." resources={[legalResources.cases, legalResources.claim_reviews]} unavailable={["Putusan Hukum"]} />;
}
