import Link from "next/link";
import type { FinanceAgentSupportItem } from "./types";
import styles from "./finance-dashboard.module.css";

interface FinanceAgentSupportProps {
  readonly agents: readonly FinanceAgentSupportItem[];
}

export function FinanceAgentSupport({ agents }: FinanceAgentSupportProps) {
  return (
    <article className={styles.aiCard} aria-label="ARA dan Dukungan Agen Keuangan">
      <div className={styles.aiEyebrow}>ARA &amp; AGENT SUPPORT</div>
      <h3 className={styles.aiTitle}>Finance Intelligence</h3>

      <div className={styles.agentList} role="list">
        {agents.map((agent) => (
          <div className={styles.agentRow} key={agent.code} role="listitem">
            <div className={styles.agentRowLeft}>
              <span className={styles.agentDot} aria-hidden="true" />
              <span className={styles.agentName}>{agent.name}</span>
            </div>
            <span className={styles.agentCapabilityText} data-testid={`agent-status-${agent.code}`}>
              {agent.status}
            </span>
          </div>
        ))}
      </div>

      <Link href="/ara" className={styles.aiAskButton}>
        Tanyakan ARA tentang Finance
      </Link>
    </article>
  );
}
