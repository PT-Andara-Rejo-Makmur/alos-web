"use client";
import { LegalCanonicalPage } from "../canonical-page";
import { legalResources } from "../resources";
export function LegalObligationsPage({ workspaceKey }: Readonly<{ workspaceKey?: string }>) {
  return <LegalCanonicalPage workspaceKey={workspaceKey} title="Kewajiban & Tenggat" description="Kelola perjanjian, pemeriksaan, dan kewajiban perusahaan." resources={[legalResources.expiries, legalResources.privacy_requests]} unavailable={["Kepatuhan Regulasi Otomatis"]} />;
}
