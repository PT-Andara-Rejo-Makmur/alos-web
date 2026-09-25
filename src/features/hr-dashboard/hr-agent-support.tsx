import Link from "next/link";
import { Sparkles } from "lucide-react";

import type { HrAgentSupportItem } from "./types";
import styles from "./hr-dashboard.module.css";

export function HrAgentSupport({
  agents,
}: {
  readonly agents: readonly HrAgentSupportItem[];
}) {
  return (
    <article aria-label="People Intelligence" className={styles.obsidianCard}>
      <span className={styles.obsidianEyebrow}>ARA &amp; Agent Support</span>
      <h2 className={styles.obsidianTitle}>People Intelligence</h2>
      <p className={styles.obsidianSubtitle}>
        Capability aktif hanya jika registry mengonfirmasi.
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

      <Link className={styles.obsidianCtaButton} href="/workspace/hr/ara">
        <Sparkles size={16} strokeWidth={2.2} />
        <span>Tanyakan ARA tentang People</span>
      </Link>
    </article>
  );
}
