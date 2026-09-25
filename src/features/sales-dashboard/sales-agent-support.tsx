import Link from "next/link";
import { Sparkles } from "lucide-react";

import type { SalesAgentSupportItem } from "./types";
import styles from "./sales-dashboard.module.css";

export function SalesAgentSupport({
  agents,
}: {
  readonly agents: readonly SalesAgentSupportItem[];
}) {
  return (
    <article aria-label="Sales and Marketing Intelligence" className={styles.obsidianCard}>
      <span className={styles.obsidianEyebrow}>ALOS AI Workforce</span>
      <h2 className={styles.obsidianTitle}>Sales &amp; Marketing Intelligence</h2>
      <p className={styles.obsidianSubtitle}>
        Asistensi otomasi prospek, scoring, dan konten kampanye
      </p>

      <div className={styles.agentList}>
        {agents.map((agent) => (
          <div className={styles.agentItem} key={agent.agentId}>
            <div className={styles.agentInfo}>
              <div className={styles.agentHeader}>
                <span className={styles.agentId}>{agent.agentId}</span>
                <span className={styles.agentRole}>{agent.roleName}</span>
              </div>
              <p className={styles.agentDescription}>{agent.taskDescription}</p>
            </div>
            <span className={styles.agentBadge}>{agent.status}</span>
          </div>
        ))}
      </div>

      <Link className={styles.obsidianCtaButton} href="/workspace/sales/ara">
        <Sparkles size={16} strokeWidth={2.2} />
        <span>Tanyakan ARA tentang Sales</span>
      </Link>
    </article>
  );
}
