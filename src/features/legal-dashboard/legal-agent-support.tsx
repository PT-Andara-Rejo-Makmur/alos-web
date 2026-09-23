import Link from "next/link";
import { Sparkles } from "lucide-react";

import type { LegalAgentSupportItem } from "./types";
import styles from "./legal-dashboard.module.css";

interface LegalAgentSupportProps {
  readonly agents: readonly LegalAgentSupportItem[];
}

export function LegalAgentSupport({ agents }: LegalAgentSupportProps) {
  return (
    <article aria-label="Legal Intelligence ARA & Agent Support" className={styles.obsidianCard}>
      <span className={styles.obsidianEyebrow}>ARA & AGENT SUPPORT</span>
      <h2 className={styles.obsidianTitle}>Legal Intelligence</h2>
      <p className={styles.obsidianSubtitle}>
        Capability aktif hanya jika registry mengonfirmasi.
      </p>

      <div className={styles.agentList}>
        {agents.map((agent) => (
          <div className={styles.agentItem} key={agent.agentId}>
            <div className={styles.agentInfo}>
              <div className={styles.agentHeader}>
                <span aria-hidden="true" className={styles.agentDot} />
                <span className={styles.agentRole}>{agent.roleName}</span>
              </div>
            </div>
            <span className={styles.agentBadge}>{agent.status}</span>
          </div>
        ))}
      </div>

      <Link
        aria-label="Tanyakan ARA tentang Legal"
        className={styles.obsidianCtaButton}
        href="/ara"
      >
        <Sparkles aria-hidden="true" size={16} strokeWidth={2} />
        <span>Tanyakan ARA tentang Legal</span>
      </Link>
    </article>
  );
}
