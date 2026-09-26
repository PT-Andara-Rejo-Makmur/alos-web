"use client";

import React, { use } from "react";
import { notFound, redirect } from "next/navigation";
import { ProtectedDomainWorkspace } from "@/features/workspace-shell";
import { WORKSPACE_AUTHORITY_CONFIG } from "@/features/workspace-shell/contextual-workspace-module-page";
import type { CanonicalWorkspaceKey } from "@/features/workspace-routing";
import {
  isKnownStrategySubmodule,
  normalizeCanonicalModuleSegment,
} from "@/features/workspace-routing";
import { StrategyOverviewWorkspace } from "../overview/strategy-overview-workspace";
import { ObjectivesWorkspace } from "../objectives/objectives-workspace";
import { KpisWorkspace } from "../kpis/kpis-workspace";
import { InitiativesWorkspace } from "../initiatives/initiatives-workspace";
import { PerformanceReviewsWorkspace } from "../performance-reviews/performance-reviews-workspace";
import { TargetRevisionsWorkspace } from "../target-revisions/target-revisions-workspace";
import { StrategicSourcesWorkspace } from "../sources/strategic-sources-workspace";
import type { StrategyContext } from "./types";

interface StrategySubmoduleRunnerProps {
  readonly workspaceKey: CanonicalWorkspaceKey;
  readonly params?: Promise<{ submodule: string }> | { submodule: string };
  readonly directSubmodule?: string;
}

export function StrategySubmoduleRunner({
  workspaceKey,
  params,
  directSubmodule,
}: StrategySubmoduleRunnerProps) {
  let resolvedSubmodule: string | undefined = directSubmodule;

  if (params) {
    const p =
      typeof (params as Promise<unknown>)?.then === "function"
        ? use(params as Promise<{ submodule: string }>)
        : (params as { submodule: string });
    resolvedSubmodule = p.submodule;
  }

  const rawSubmodule = resolvedSubmodule ? normalizeCanonicalModuleSegment(resolvedSubmodule) : undefined;

  if (resolvedSubmodule && resolvedSubmodule !== rawSubmodule) {
    redirect(`/workspace/${workspaceKey}/strategy/${rawSubmodule}`);
  }

  if (rawSubmodule && !isKnownStrategySubmodule(rawSubmodule)) {
    notFound();
  }

  const config = WORKSPACE_AUTHORITY_CONFIG[workspaceKey];
  if (!config) {
    notFound();
  }

  return (
    <ProtectedDomainWorkspace
      activeNavKey={rawSubmodule ?? "strategy"}
      deniedTitle={config.deniedTitle}
      divisionCodes={config.divisionCodes}
      loadingLabel={config.loadingLabel}
      workspaceKeys={config.workspaceKeys}
    >
      {({ identity }) => {
        const context: StrategyContext = {
          workspaceKey,
          workspaceLabel: identity.workspaceLabel,
          divisionCode: identity.divisionCode,
          isCompanyWide: workspaceKey === "executive",
        };

        switch (rawSubmodule) {
          case "objectives":
            return <ObjectivesWorkspace context={context} />;
          case "kpis":
            return <KpisWorkspace context={context} />;
          case "initiatives":
            return <InitiativesWorkspace context={context} />;
          case "reviews":
            return <PerformanceReviewsWorkspace context={context} />;
          case "revisions":
            return <TargetRevisionsWorkspace context={context} />;
          case "sources":
            return <StrategicSourcesWorkspace context={context} />;
          default:
            return <StrategyOverviewWorkspace context={context} />;
        }
      }}
    </ProtectedDomainWorkspace>
  );
}
