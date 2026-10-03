"use client";
import { LegalCanonicalPage } from "../canonical-page";
import { legalResources } from "../resources";
export function LegalContractsPage({ workspaceKey }: Readonly<{ workspaceKey?: string }>) {
  return <LegalCanonicalPage workspaceKey={workspaceKey} title="Kontrak & Perjanjian" description="Kelola perjanjian, pemeriksaan, dan kewajiban perusahaan." resources={[legalResources.contracts, legalResources.contract_revisions]} unavailable={["Signing dan Eksekusi Legal Final", "Signing Revisi Kontrak"]} />;
}
