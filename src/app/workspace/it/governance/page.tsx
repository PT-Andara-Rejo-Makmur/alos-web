"use client";

import { ProtectedDomainWorkspace } from "@/features/workspace-shell";
import { getModuleReadiness } from "@/features/workspace-routing";
import { ItUnavailableSurface } from "@/modules/it/ui";

export default function WorkspaceItGovernancePage() {
  const readiness = getModuleReadiness("governance");

  return (
    <ProtectedDomainWorkspace
      activeNavKey="governance"
      deniedTitle="Bukan Otoritas IT / Tata Kelola"
      divisionCodes={["IT", "TECHNOLOGY"]}
      loadingLabel="Memuat Tata Kelola IT…"
      workspaceKeys={["it", "technology"]}
    >
      {() => (
        <ItUnavailableSurface
          backHref="/workspace/it"
          backLabel="← Kembali ke Ringkasan IT"
          description={`Integrasi operasional Backend belum terhubung (${readiness.blockReason ?? "BACKEND_NOT_CONNECTED"}). Modul tata kelola IT belum memiliki konektor operasional aktif.`}
          eyebrow="ALOS / IT / TATA KELOLA"
          readiness={readiness}
          title="Tata Kelola IT"
        />
      )}
    </ProtectedDomainWorkspace>
  );
}
