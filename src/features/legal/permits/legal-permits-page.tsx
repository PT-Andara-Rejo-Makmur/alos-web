"use client";
import { LegalCanonicalPage } from "../canonical-page";
import { legalResources } from "../resources";
export function LegalPermitsPage({ workspaceKey }: Readonly<{ workspaceKey?: string }>) {
  return <LegalCanonicalPage workspaceKey={workspaceKey} title="Perizinan" description="Kelola perjanjian, pemeriksaan, dan kewajiban perusahaan." resources={[legalResources.permits]} unavailable={["Verifikasi Izin Eksternal"]} />;
}
