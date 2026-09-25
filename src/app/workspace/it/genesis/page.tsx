"use client";

import { ProtectedDomainWorkspace } from "@/features/workspace-shell";
import { FactoryWorkspace } from "@/features/factory";
import { ItReviewProjection } from "@/features/reviews/it-review-projection";
import { GenesisWorkspace, GenesisRdGovernanceView } from "@/experiences/genesis";

export default function WorkspaceItGenesisPage() {
  return (
    <ProtectedDomainWorkspace
      activeNavKey="control-plane"
      deniedTitle="Bukan Otoritas IT / GENESIS"
      divisionCodes={["IT", "TECHNOLOGY"]}
      loadingLabel="Memuat GENESIS Control Plane…"
      workspaceKeys={["it", "technology"]}
    >
      {() => (
        <div style={{ padding: "1.5rem" }}>
          <FactoryWorkspace />
          <ItReviewProjection />
          <GenesisRdGovernanceView />
          <GenesisWorkspace />
        </div>
      )}
    </ProtectedDomainWorkspace>
  );
}
