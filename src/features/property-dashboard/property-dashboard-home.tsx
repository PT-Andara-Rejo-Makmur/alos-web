"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import type { SessionActor } from "@/features/mvp1/lib/governance";
import type { PropertyDashboardSnapshot } from "./types";
import { PropertyDataReadiness } from "./property-data-readiness";
import { PropertyMetricGrid } from "./property-metric-grid";
import { PropertyProgressPanel } from "./property-progress-panel";
import { PropertyMilestonePanel } from "./property-milestone-panel";
import { PropertyRiskPanel } from "./property-risk-panel";
import { ConstructionControlCadence } from "./construction-control-cadence";
import { PropertyAgentSupport } from "./property-agent-support";
import { PropertyOperationsDrawer } from "./property-operations-drawer";
import styles from "./property-dashboard.module.css";

interface PropertyDashboardHomeProps {
  readonly snapshot: PropertyDashboardSnapshot;
  readonly actor?: SessionActor | null;
  readonly selectedProjectName?: string;
  readonly onOpenProjectSwitcher?: () => void;
  readonly onDataReload?: () => void;
  readonly activeWorkspaceId?: string | null;
}

export function PropertyDashboardHome({
  snapshot,
  actor,
  selectedProjectName,
  onOpenProjectSwitcher,
  onDataReload,
  activeWorkspaceId,
}: PropertyDashboardHomeProps) {
  const [isOperationsOpen, setIsOperationsOpen] = useState(false);

  const activeProjectLabel =
    selectedProjectName ||
    snapshot.portfolio.projects[0]?.name ||
    "Semua Proyek Property";

  const earliestMilestone = snapshot.portfolio.milestones[0];
  const earliestMilestoneDate = earliestMilestone
    ? new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "short",
        timeZone: "UTC",
      }).format(new Date(`${earliestMilestone.due_date}T00:00:00Z`))
    : "—";

  return (
    <div className={styles.dashboardWrapper}>
      {/* Context Bar */}
      <section aria-label="Konteks Command Center" className={styles.contextBar}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <p className={styles.breadcrumbs}>ALOS / PROPERTY / OVERVIEW</p>
            <h1 className={styles.pageTitle}>Property &amp; Project Command Center</h1>
            <p className={styles.subtitle}>
              Pantau progres, milestone, risiko, biaya proyek, dan kontrol lapangan dalam satu workspace.
            </p>
          </div>

          {/* Quick Operations Button (Desktop) */}
          <button
            aria-label="Buka operasi proyek"
            className={styles.desktopOnly}
            onClick={() => setIsOperationsOpen(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 14px",
              background: "#ffffff",
              border: "1px solid #d0d7d2",
              borderRadius: "8px",
              color: "#07533e",
              fontWeight: 600,
              fontSize: "0.8rem",
              cursor: "pointer",
              boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
            }}
            type="button"
          >
            <Plus size={16} />
            <span>Operasi Proyek</span>
          </button>
        </div>
      </section>

      {/* Mobile-Only Project Context Card */}
      <section aria-label="Project Context Mobile" className={styles.mobileProjectContextCard}>
        <div>
          <p className={styles.mobileContextEyebrow}>PROJECT CONTEXT</p>
          <p className={styles.mobileContextActive}>{activeProjectLabel}</p>
        </div>
        <button
          className={styles.mobileContextAction}
          onClick={onOpenProjectSwitcher}
          style={{ background: "none", border: "none", cursor: "pointer" }}
          type="button"
        >
          Ganti ‖
        </button>
      </section>

      {/* Property Data Readiness Indicator Card */}
      <PropertyDataReadiness readiness={snapshot.readiness} />

      {/* Top 4 KPI Metrics Grid */}
      <PropertyMetricGrid metrics={snapshot.portfolio.metrics} />

      {/* Mobile-Only: Compact Project Control Card */}
      <section aria-label="Project Control Mobile" className={styles.mobileCompactCard}>
        <p className={styles.panelEyebrow}>MILESTONES &amp; RISK</p>
        <h2 className={styles.mobileCompactTitle}>Project Control</h2>
        <div className={styles.mobileCompactRow}>
          <div className={styles.mobileCompactLeft}>
            <span aria-hidden="true" className={`${styles.dot} ${styles.dotGreen}`} />
            <span>Milestone terdekat</span>
          </div>
          <span className={styles.mobileCompactRight}>{earliestMilestoneDate}</span>
        </div>
        <div className={styles.mobileCompactRow}>
          <div className={styles.mobileCompactLeft}>
            <span aria-hidden="true" className={`${styles.dot} ${styles.dotAmber}`} />
            <span>At Risk</span>
          </div>
          <span className={styles.mobileCompactRight}>
            {snapshot.portfolio.metrics.at_risk}
          </span>
        </div>
        <div className={styles.mobileCompactRow}>
          <div className={styles.mobileCompactLeft}>
            <span aria-hidden="true" className={`${styles.dot} ${styles.dotRed}`} />
            <span>Critical</span>
          </div>
          <span className={styles.mobileCompactRight}>
            {snapshot.portfolio.metrics.critical}
          </span>
        </div>
      </section>

      {/* Mobile-Only: Compact Control Cadence Card */}
      <section aria-label="Control Cadence Mobile" className={styles.mobileCompactCard}>
        <p className={styles.panelEyebrow}>CONSTRUCTION CONTROL</p>
        <h2 className={styles.mobileCompactTitle}>Control Cadence</h2>
        <div className={styles.mobileCompactRow}>
          <span>Progress &amp; opname</span>
          <span style={{ color: "#8a928c" }}>—</span>
        </div>
        <div className={styles.mobileCompactRow}>
          <span>K3 / PPE</span>
          <span style={{ color: "#8a928c" }}>—</span>
        </div>
        <div className={styles.mobileCompactRow}>
          <span>Baseline progress</span>
          <span style={{ color: "#0b9952", fontWeight: 700 }}>LIVE</span>
        </div>
        <div className={styles.mobileCompactRow}>
          <span>Hold-point</span>
          <span style={{ color: "#8a928c" }}>—</span>
        </div>
        <div className={styles.mobileCompactRow}>
          <span>NCR closure</span>
          <span style={{ color: "#f09a0b", fontWeight: 700 }}>PARTIAL</span>
        </div>
        <div className={styles.mobileCompactRow}>
          <span>Handover</span>
          <span style={{ color: "#8a928c" }}>—</span>
        </div>
      </section>

      {/* Middle 3-Column Grid (Desktop) */}
      <section aria-label="Detail Portofolio dan Milestone" className={`${styles.middle3Grid} ${styles.desktopOnly}`}>
        <PropertyProgressPanel progress={snapshot.portfolio.progress} />
        <PropertyMilestonePanel milestones={snapshot.portfolio.milestones} />
        <PropertyRiskPanel
          distribution={snapshot.portfolio.distribution}
          metrics={snapshot.portfolio.metrics}
        />
      </section>

      {/* Bottom 2-Column Grid (Desktop & Mobile Adaptive) */}
      <section aria-label="Kontrol Konstruksi dan AI" className={styles.bottom2Grid}>
        <div className={styles.desktopOnly}>
          <ConstructionControlCadence cadence={snapshot.cadence} />
        </div>
        <PropertyAgentSupport agents={snapshot.agents} />
      </section>

      {/* Operations Drawer */}
      <PropertyOperationsDrawer
        activeWorkspaceId={activeWorkspaceId}
        actor={actor}
        isOpen={isOperationsOpen}
        onClose={() => setIsOperationsOpen(false)}
        onDataChanged={() => {
          if (onDataReload) onDataReload();
        }}
        projects={snapshot.portfolio.projects}
      />
    </div>
  );
}
