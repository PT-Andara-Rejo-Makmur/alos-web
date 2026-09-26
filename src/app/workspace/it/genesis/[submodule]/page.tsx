"use client";

import { use, type ComponentType } from "react";
import { notFound, redirect } from "next/navigation";
import { ProtectedDomainWorkspace } from "@/features/workspace-shell";
import {
  AgentsWorkspace,
  ModelsToolsWorkspace,
  ResearchWorkspace,
  SkillsWorkspace,
} from "@/modules/it/genesis";
import {
  isKnownGenesisSubmodule,
  normalizeCanonicalModuleSegment,
} from "@/features/workspace-routing";

const SUBMODULE_COMPONENTS: Record<string, ComponentType> = {
  agents: AgentsWorkspace,
  skills: SkillsWorkspace,
  research: ResearchWorkspace,
  "models-tools": ModelsToolsWorkspace,
};

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

  const Component = SUBMODULE_COMPONENTS[submodule];
  if (!Component) {
    notFound();
  }

  return (
    <ProtectedDomainWorkspace
      activeNavKey={submodule === "models-tools" ? "models" : submodule}
      deniedTitle="Bukan Otoritas IT / GENESIS"
      divisionCodes={["IT", "TECHNOLOGY"]}
      loadingLabel="Memuat Modul GENESIS IT…"
      workspaceKeys={["it", "technology"]}
    >
      {() => <Component />}
    </ProtectedDomainWorkspace>
  );
}
