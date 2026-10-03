"use client";
import { LegalCanonicalPage } from "../canonical-page";
import { legalResources } from "../resources";
export function LegalRisksPage({ workspaceKey }: Readonly<{ workspaceKey?: string }>) {
  return <LegalCanonicalPage workspaceKey={workspaceKey} title="Risiko & Kepatuhan" description="Kelola perjanjian, pemeriksaan, dan kewajiban perusahaan." resources={[legalResources.risks, legalResources.controls]} unavailable={["Skor Kepatuhan Resmi"]} />;
}
