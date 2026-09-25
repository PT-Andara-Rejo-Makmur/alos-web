"use client";

import { ProtectedDomainWorkspace } from "@/features/workspace-shell";
import { ItReviewProjection } from "@/features/reviews/it-review-projection";

export default function WorkspaceItGovernancePage() {
  return (
    <ProtectedDomainWorkspace
      activeNavKey="governance"
      deniedTitle="Bukan Otoritas IT / Governance"
      divisionCodes={["IT", "TECHNOLOGY"]}
      loadingLabel="Memuat IT Governance Workspace…"
      workspaceKeys={["it", "technology"]}
    >
      {() => (
        <div style={{ padding: "1.5rem" }}>
          <ItReviewProjection />
        </div>
      )}
    </ProtectedDomainWorkspace>
  );
}
