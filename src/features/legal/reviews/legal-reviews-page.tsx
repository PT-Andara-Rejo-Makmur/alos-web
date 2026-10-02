"use client";
import { LegalCanonicalPage } from "../canonical-page";
import { legalResources } from "../resources";
export function LegalReviewsPage({ workspaceKey }: Readonly<{ workspaceKey?: string }>) {
  return <LegalCanonicalPage workspaceKey={workspaceKey} title="Review Legal" description="Rekaman internal Legal dalam scope aktif; status tercatat tidak menyatakan validitas atau keputusan hukum final." resources={[legalResources.legal_reviews, legalResources.due_diligences, legalResources.due_diligence_items, legalResources.claim_reviews]} unavailable={["Keputusan Legal Material", "Telaah ARA"]} />;
}
