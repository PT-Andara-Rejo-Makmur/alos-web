"use client";

import { ProtectedDomainWorkspace } from "@/features/workspace-shell";
import { ItUnavailableSurface } from "@/modules/it/ui";

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
        <ItUnavailableSurface
          backHref="/workspace/it"
          backLabel="← Kembali ke IT Overview"
          description="Backend operational integration belum terhubung. Modul tata kelola IT belum memiliki konektor operasional aktif."
          eyebrow="ALOS / IT / GOVERNANCE"
          readiness={{ availability: "BLOCKED", blockReason: "BACKEND_NOT_CONNECTED" }}
          title="IT Governance"
        />
      )}
    </ProtectedDomainWorkspace>
  );
}
