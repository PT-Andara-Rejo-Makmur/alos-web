"use client";

import { ProtectedDomainWorkspace } from "@/features/workspace-shell";
import { GenesisControlPlaneWorkspace } from "@/features/genesis-control-plane";

export default function WorkspaceItGenesisPage() {
  return (
    <ProtectedDomainWorkspace
      activeNavKey="control-plane"
      deniedTitle="Bukan Otoritas IT / GENESIS"
      divisionCodes={["IT", "TECHNOLOGY"]}
      loadingLabel="Memuat GENESIS Control Plane…"
      workspaceKeys={["it", "technology"]}
    >
      {() => <GenesisControlPlaneWorkspace />}
    </ProtectedDomainWorkspace>
  );
}
