"use client";

import { ProtectedDomainWorkspace } from "@/features/workspace-shell";
import { getModuleReadiness } from "@/features/workspace-routing";
import { ItUnavailableSurface } from "@/modules/it/ui";

export default function WorkspaceItGovernancePage() {
  const readiness = getModuleReadiness("governance");

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
          description={`Backend operational integration belum terhubung (${readiness.blockReason ?? "BACKEND_NOT_CONNECTED"}). Modul tata kelola IT belum memiliki konektor operasional aktif.`}
          eyebrow="ALOS / IT / GOVERNANCE"
          readiness={readiness}
          title="IT Governance"
        />
      )}
    </ProtectedDomainWorkspace>
  );
}
