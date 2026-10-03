"use client";
import { LegalCanonicalPage } from "../canonical-page";
import { legalResources } from "../resources";
export function LegalAssetsPage({ workspaceKey }: Readonly<{ workspaceKey?: string }>) {
  return <LegalCanonicalPage workspaceKey={workspaceKey} title="Legalitas Proyek & Aset" description="Kelola perjanjian, pemeriksaan, dan kewajiban perusahaan." resources={[legalResources.land_documents]} unavailable={["Verifikasi Legalitas Eksternal"]} />;
}
