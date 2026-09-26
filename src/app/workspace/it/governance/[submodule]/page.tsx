"use client";

import { use } from "react";
import { notFound, redirect } from "next/navigation";
import { ProtectedDomainWorkspace } from "@/features/workspace-shell";
import { ItUnavailableSurface } from "@/modules/it/ui";
import {
  getModuleReadiness,
  isKnownGovernanceSubmodule,
  normalizeCanonicalModuleSegment,
} from "@/features/workspace-routing";

export default function WorkspaceItGovernanceSubmodulePage({
  params,
}: {
  readonly params: Promise<{ submodule: string }> | { submodule: string };
}) {
  const resolvedParams =
    typeof (params as Promise<unknown>)?.then === "function"
      ? use(params as Promise<{ submodule: string }>)
      : (params as { submodule: string });
  const { submodule: rawSubmodule } = resolvedParams;
  const submodule = normalizeCanonicalModuleSegment(rawSubmodule);

  if (rawSubmodule !== submodule) {
    redirect(`/workspace/it/governance/${submodule}`);
  }

  if (!isKnownGovernanceSubmodule(submodule)) {
    notFound();
  }

  return (
    <ProtectedDomainWorkspace
      activeNavKey={submodule}
      deniedTitle="Bukan Otoritas IT / Governance"
      divisionCodes={["IT", "TECHNOLOGY"]}
      loadingLabel="Memuat Modul Governance IT…"
      workspaceKeys={["it", "technology"]}
    >
      {() => {
        const readiness = getModuleReadiness(submodule);
        return (
          <ItUnavailableSurface
            backHref="/workspace/it/governance"
            backLabel="← Kembali ke IT Governance"
            description={`Modul tata kelola ini belum tersedia pada sistem (${readiness.blockReason ?? "BACKEND_NOT_CONNECTED"}).`}
            eyebrow={`ALOS / IT / GOVERNANCE / ${submodule.toUpperCase()}`}
            readiness={readiness}
            title={`IT Governance: ${submodule.replace(/-/g, " ").toUpperCase()}`}
          />
        );
      }}
    </ProtectedDomainWorkspace>
  );
}
