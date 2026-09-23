"use client";

import { useEffect, useState } from "react";

import { AgentWorkforceActivity } from "./agent-workforce-activity";
import { AgentWorkforceAuthority } from "./agent-workforce-authority";
import { AgentWorkforceBanner } from "./agent-workforce-banner";
import { AgentWorkforceList } from "./agent-workforce-list";
import {
  loadBusinessAgentWorkforce,
  loadScopedRunSummary,
} from "./agent-workforce-projection";
import { AgentWorkforceSummary } from "./agent-workforce-summary";
import type {
  AgentWorkforceProps,
  AgentWorkforceRunSummary,
  AgentWorkforceStatus,
  BusinessAgentWorkforceItem,
} from "./types";
import styles from "./agent-workforce.module.css";

const INITIAL_RUN_SUMMARY: AgentWorkforceRunSummary = {
  latestRunAt: null,
  succeededCount: 0,
  blockedCount: 0,
  failedCount: 0,
  totalCount: 0,
};

export function AgentWorkforce({
  actor,
  activeWorkspace,
  onUseViaAra,
}: AgentWorkforceProps) {
  const [agents, setAgents] = useState<BusinessAgentWorkforceItem[]>([]);
  const [status, setStatus] = useState<AgentWorkforceStatus>("LOADING");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [runSummary, setRunSummary] = useState<AgentWorkforceRunSummary>(INITIAL_RUN_SUMMARY);

  const workspaceId = activeWorkspace.workspaceId;

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      if (!workspaceId) {
        setStatus("EMPTY");
        return;
      }

      setStatus("LOADING");
      setErrorMessage(null);

      try {
        const [loadedAgents, loadedRuns] = await Promise.all([
          loadBusinessAgentWorkforce(workspaceId),
          loadScopedRunSummary(workspaceId),
        ]);

        if (!isMounted) return;

        setAgents(loadedAgents);
        setRunSummary(loadedRuns);
        setStatus(loadedAgents.length > 0 ? "AVAILABLE" : "EMPTY");
      } catch (err) {
        if (!isMounted) return;
        setStatus("ERROR");
        setErrorMessage(
          err instanceof Error
            ? err.message
            : "Agent Workforce belum dapat diverifikasi. Capability tidak akan ditampilkan dari data lokal.",
        );
      }
    }

    void fetchData();

    return () => {
      isMounted = false;
    };
  }, [workspaceId]);

  const divisionBreadcrumb = (
    activeWorkspace.divisionCode ||
    activeWorkspace.workspaceKey ||
    "WORKSPACE"
  ).toUpperCase();

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.pageHeader}>
        <span className={styles.breadcrumb}>
          ALOS / {divisionBreadcrumb} / AGENT WORKFORCE
        </span>
        <h1 className={styles.pageTitle}>Agent Workforce</h1>
        <p className={styles.pageSubtitle}>
          Lihat capability AI yang tersedia untuk workspace aktif, statusnya, dan aktivitas terbaru—tanpa membuka control plane.
        </p>
      </header>

      {/* Business-facing Boundary Banner */}
      <AgentWorkforceBanner />

      {/* 4-Card Status Summary */}
      <AgentWorkforceSummary />

      {/* Main 2-Column Content Grid */}
      <div className={styles.mainGrid}>
        {/* Left Column: Available Capabilities */}
        <AgentWorkforceList
          workspaceName={activeWorkspace.workspaceLabel}
          items={agents}
          status={status}
          errorMessage={errorMessage}
          onUseViaAra={onUseViaAra}
        />

        {/* Right Column: Scoped Activity & Authority Boundary */}
        <aside className={styles.sidebarColumn} aria-label="Aktivitas dan Batasan Otoritas">
          <AgentWorkforceActivity summary={runSummary} />
          <AgentWorkforceAuthority actorRoles={actor.roles} />
        </aside>
      </div>
    </div>
  );
}
