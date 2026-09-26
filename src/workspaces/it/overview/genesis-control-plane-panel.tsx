import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { GenesisControlPlaneItem } from "./types";
import styles from "./it-dashboard.module.css";

interface GenesisControlPlanePanelProps {
  readonly items: readonly GenesisControlPlaneItem[];
}

export function GenesisControlPlanePanel({ items }: GenesisControlPlanePanelProps) {
  return (
    <article aria-label="GENESIS Control Plane Operations" className={styles.genesisSection}>
      <header className={styles.genesisHeader}>
        <span className={styles.genesisEyebrow}>GENESIS SUBSYSTEM</span>
        <h2 className={styles.genesisTitle}>Control Plane Operations</h2>
        <p className={styles.genesisSubtitle}>
          Technical AI operations, agent registry &amp; governance portals
        </p>
      </header>

      <div className={styles.genesisList}>
        {items.map((item) => (
          <Link
            className={styles.genesisItem}
            href={item.href}
            key={item.id}
          >
            <div className={styles.genesisItemLeft}>
              <span aria-hidden="true" className={styles.genesisDot} />
              <span className={styles.genesisItemTitle}>{item.title}</span>
            </div>
            <span className={styles.genesisBadge}>{item.badge}</span>
          </Link>
        ))}
      </div>

      <Link
        aria-label="Buka GENESIS Control Plane"
        className={styles.genesisCtaButton}
        href="/workspace/it/genesis"
      >
        <span>Buka GENESIS Control Plane</span>
        <ArrowRight aria-hidden="true" size={14} strokeWidth={2} />
      </Link>
    </article>
  );
}
