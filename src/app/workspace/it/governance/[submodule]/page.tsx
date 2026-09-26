"use client";

import { use, type ComponentType } from "react";
import { notFound, redirect } from "next/navigation";
import { ProtectedDomainWorkspace } from "@/features/workspace-shell";
import {
  DecisionsWorkspace,
  EvidenceWorkspace,
  UatWorkspace,
} from "@/modules/it/governance";
import {
  isKnownGovernanceSubmodule,
  normalizeCanonicalModuleSegment,
} from "@/features/workspace-routing";

const SUBMODULE_COMPONENTS: Record<string, ComponentType> = {
  evidence: EvidenceWorkspace,
  uat: UatWorkspace,
  decisions: DecisionsWorkspace,
};

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

  const Component = SUBMODULE_COMPONENTS[submodule];
  if (!Component) {
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
      {() => <Component />}
    </ProtectedDomainWorkspace>
  );
}

