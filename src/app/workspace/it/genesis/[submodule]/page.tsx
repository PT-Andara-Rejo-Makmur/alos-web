"use client";

import { use } from "react";
import { notFound, redirect } from "next/navigation";
import { ProtectedDomainWorkspace } from "@/features/workspace-shell";
import { ItUnavailableSurface } from "@/modules/it/ui";
import {
  getModuleReadiness,
  isKnownGenesisSubmodule,
  normalizeCanonicalModuleSegment,
} from "@/features/workspace-routing";

export default function WorkspaceItGenesisSubmodulePage({
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
    redirect(`/workspace/it/genesis/${submodule}`);
  }

  if (!isKnownGenesisSubmodule(submodule)) {
    notFound();
  }

  return (
    <ProtectedDomainWorkspace
      activeNavKey={submodule}
      deniedTitle="Bukan Otoritas IT / GENESIS"
      divisionCodes={["IT", "TECHNOLOGY"]}
      loadingLabel="Memuat Modul GENESIS IT…"
      workspaceKeys={["it", "technology"]}
    >
      {() => {
        const readiness = getModuleReadiness(submodule);
        return (
          <ItUnavailableSurface
            backHref="/workspace/it/genesis"
            backLabel="← Kembali ke GENESIS Control Plane"
            description={`Modul teknis ini belum tersedia pada sistem (${readiness.blockReason ?? "BACKEND_NOT_CONNECTED"}).`}
            eyebrow={`ALOS / IT / GENESIS / ${submodule.toUpperCase()}`}
            readiness={readiness}
            title={`GENESIS: ${submodule.replace(/-/g, " ").toUpperCase()}`}
          />
        );
      }}
    </ProtectedDomainWorkspace>
  );
}
