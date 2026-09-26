"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Blocks,
  Bot,
  BrainCircuit,
  ChevronRight,
  Fingerprint,
  FlaskConical,
  SearchCheck,
  ShieldCheck,
} from "lucide-react";

import { FactoryWorkspace } from "@/features/factory";
import { ItReviewProjection } from "@/features/reviews/it-review-projection";
import { GenesisWorkspace, GenesisRdGovernanceView } from "@/experiences/genesis";
import styles from "./genesis-control-plane.module.css";

interface TechnicalAreaItem {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly route: string;
  readonly readiness: "READY" | "BLOCKED";
  readonly icon: React.ComponentType<{ size?: number; className?: string; "aria-hidden"?: boolean }>;
}

const TECHNICAL_AREAS: readonly TechnicalAreaItem[] = [
  {
    id: "agents",
    title: "Agent Workforce & Factory",
    description: "Technical agent design, capability draft, and execution runtime",
    route: "/workspace/it/genesis/agents",
    readiness: "READY",
    icon: Bot,
  },
  {
    id: "skills",
    title: "Skill Registry & Tools",
    description: "Standard operational toolchain and modular skill definitions",
    route: "/workspace/it/genesis/skills",
    readiness: "BLOCKED",
    icon: Blocks,
  },
  {
    id: "research",
    title: "R&D Domain Governance",
    description: "Autonomous domain research boundary and access control",
    route: "/workspace/it/genesis/research",
    readiness: "READY",
    icon: SearchCheck,
  },
  {
    id: "models-tools",
    title: "Models & Tools Registry",
    description: "Model routing, token limits, and integration interfaces",
    route: "/workspace/it/genesis/models-tools",
    readiness: "BLOCKED",
    icon: BrainCircuit,
  },
];

interface GovernanceItem {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly route: string;
  readonly icon: React.ComponentType<{ size?: number; className?: string; "aria-hidden"?: boolean }>;
}

const GOVERNANCE_ITEMS: readonly GovernanceItem[] = [
  {
    id: "evidence",
    title: "Evidence Chain & Logs",
    description: "Immutable evidence verification and audit trace",
    route: "/workspace/it/governance/evidence",
    icon: Fingerprint,
  },
  {
    id: "uat",
    title: "UAT Gates & Verification",
    description: "Automated test gates and release checklists",
    route: "/workspace/it/governance/uat",
    icon: FlaskConical,
  },
  {
    id: "decisions",
    title: "Operational Decisions",
    description: "Governed human approvals and system sign-offs",
    route: "/workspace/it/governance/decisions",
    icon: BadgeCheck,
  },
];

type SubsystemTabKey = "factory" | "assurance" | "rd-gov" | "platform-gov" | "all";

export function GenesisControlPlaneWorkspace() {
  const [activeTab, setActiveTab] = useState<SubsystemTabKey>("factory");

  return (
    <div className={styles.genesisWrapper}>
      {/* Header */}
      <header className={styles.headerRow}>
        <div className={styles.contextBar}>
          <span className={styles.breadcrumbs}>ALOS / IT / GENESIS</span>
          <h1 className={styles.pageTitle}>GENESIS Control Plane</h1>
          <p className={styles.subtitle}>
            Technical AI operations, agent registry, capability controls, research and governance.
          </p>
        </div>
      </header>

      {/* B. Control Plane Status Strip */}
      <section aria-label="Status Control Plane" className={styles.statusStrip}>
        <div className={styles.statusLeft}>
          <span aria-hidden="true" className={styles.statusIcon}>
            <ShieldCheck aria-hidden={true} size={18} />
          </span>
          <div className={styles.statusText}>
            <span className={styles.statusTitle}>Control Plane Status: PARTIAL</span>
            <span className={styles.statusContext}>
              Configuration &amp; governance models active; autonomous telemetry awaiting backend connector.
            </span>
          </div>
        </div>
      </section>

      {/* C & D. Technical Areas & Governance Cross-Reference */}
      <div className={styles.registryGrid}>
        {/* C. Technical Areas */}
        <section aria-label="Area Teknis GENESIS" className={styles.consoleSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionEyebrow}>CORE REGISTRY</span>
            <h2 className={styles.sectionTitle}>Technical Areas</h2>
          </div>

          <div className={styles.registryList}>
            {TECHNICAL_AREAS.map((area) => {
              const Icon = area.icon;
              return (
                <Link className={styles.registryRow} href={area.route} key={area.id}>
                  <div className={styles.rowLeft}>
                    <span aria-hidden="true" className={styles.rowIcon}>
                      <Icon aria-hidden={true} size={18} />
                    </span>
                    <div className={styles.rowMeta}>
                      <span className={styles.rowTitle}>{area.title}</span>
                      <span className={styles.rowDesc}>{area.description}</span>
                    </div>
                  </div>
                  <div className={styles.rowRight}>
                    <span
                      className={
                        area.readiness === "READY"
                          ? styles.badgeReady
                          : styles.badgeBlocked
                      }
                    >
                      {area.readiness === "READY" ? "READY" : "BLOCKED"}
                    </span>
                    <ChevronRight aria-hidden={true} className={styles.arrowIcon} size={14} />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* D. Governance Cross-Reference */}
        <section aria-label="Koneksi Tata Kelola" className={styles.consoleSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionEyebrow}>GOVERNANCE INTEGRATION</span>
            <h2 className={styles.sectionTitle}>Audit &amp; Decision Portals</h2>
          </div>

          <div className={styles.registryList}>
            {GOVERNANCE_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <Link className={styles.registryRow} href={item.route} key={item.id}>
                  <div className={styles.rowLeft}>
                    <span aria-hidden="true" className={styles.rowIcon}>
                      <Icon aria-hidden={true} size={18} />
                    </span>
                    <div className={styles.rowMeta}>
                      <span className={styles.rowTitle}>{item.title}</span>
                      <span className={styles.rowDesc}>{item.description}</span>
                    </div>
                  </div>
                  <div className={styles.rowRight}>
                    <ArrowRight aria-hidden={true} className={styles.arrowIcon} size={14} />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </div>

      {/* E. Existing Workspaces with Clear Boundaries */}
      <section aria-label="Operasi Sub-sistem GENESIS" className={styles.subsystemContainer}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionEyebrow}>SUBSYSTEM WORKSPACES</span>
          <h2 className={styles.sectionTitle}>Capability &amp; Assurance Workspaces</h2>
        </div>

        {/* Tab Navigation */}
        <div aria-label="Tab Sub-sistem" className={styles.tabNav} role="tablist">
          <button
            className={`${styles.tabButton} ${activeTab === "factory" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("factory")}
            role="tab"
            type="button"
          >
            Capability Factory
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === "assurance" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("assurance")}
            role="tab"
            type="button"
          >
            Assurance Structure
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === "rd-gov" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("rd-gov")}
            role="tab"
            type="button"
          >
            R&amp;D Domain Access
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === "platform-gov" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("platform-gov")}
            role="tab"
            type="button"
          >
            Platform Governance
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === "all" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("all")}
            role="tab"
            type="button"
          >
            Show All
          </button>
        </div>

        {/* Tab Contents */}
        <div className={styles.subsystemPanel}>
          {(activeTab === "factory" || activeTab === "all") && (
            <div className={styles.subsystemSection}>
              <div className={styles.subsystemHeader}>
                <span className={styles.subsystemTitle}>Capability Factory</span>
                <span className={styles.subsystemTag}>GENESIS-FACTORY-V1</span>
              </div>
              <FactoryWorkspace />
            </div>
          )}

          {(activeTab === "assurance" || activeTab === "all") && (
            <div className={styles.subsystemSection}>
              <div className={styles.subsystemHeader}>
                <span className={styles.subsystemTitle}>Review Package &amp; Assurance</span>
                <span className={styles.subsystemTag}>IT-REVIEW-PROJECTION</span>
              </div>
              <ItReviewProjection />
            </div>
          )}

          {(activeTab === "rd-gov" || activeTab === "all") && (
            <div className={styles.subsystemSection}>
              <div className={styles.subsystemHeader}>
                <span className={styles.subsystemTitle}>R&amp;D Domain Governance</span>
                <span className={styles.subsystemTag}>RD-GOVERNANCE-4DOMAINS</span>
              </div>
              <GenesisRdGovernanceView />
            </div>
          )}

          {(activeTab === "platform-gov" || activeTab === "all") && (
            <div className={styles.subsystemSection}>
              <div className={styles.subsystemHeader}>
                <span className={styles.subsystemTitle}>Platform Assurance Dashboard</span>
                <span className={styles.subsystemTag}>GENESIS-GOVERNANCE-CORE</span>
              </div>
              <GenesisWorkspace />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
