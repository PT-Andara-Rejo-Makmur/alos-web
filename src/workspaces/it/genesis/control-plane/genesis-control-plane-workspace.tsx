"use client";

import React from "react";
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

import { getModuleReadiness } from "@/features/workspace-routing";
import styles from "./genesis-control-plane.module.css";

interface TechnicalAreaItem {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly route: string;
  readonly icon: React.ComponentType<{ size?: number; className?: string; "aria-hidden"?: boolean }>;
}

const TECHNICAL_AREAS: readonly TechnicalAreaItem[] = [
  {
    id: "agents",
    title: "Agent Workforce & Factory",
    description: "Technical agent design, capability draft, and execution runtime",
    route: "/workspace/it/genesis/agents",
    icon: Bot,
  },
  {
    id: "skills",
    title: "Skill Registry & Tools",
    description: "Standard operational toolchain and modular skill definitions",
    route: "/workspace/it/genesis/skills",
    icon: Blocks,
  },
  {
    id: "research",
    title: "R&D Domain Governance",
    description: "Autonomous domain research boundary and access control",
    route: "/workspace/it/genesis/research",
    icon: SearchCheck,
  },
  {
    id: "models-tools",
    title: "Models & Tools Registry",
    description: "Model routing, token limits, and integration interfaces",
    route: "/workspace/it/genesis/models-tools",
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

export function GenesisControlPlaneWorkspace() {
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
              const readiness = getModuleReadiness(area.id);
              const isReady = readiness.availability === "READY";

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
                        isReady
                          ? styles.badgeReady
                          : styles.badgeBlocked
                      }
                    >
                      {isReady ? "READY" : "BLOCKED"}
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
    </div>
  );
}
