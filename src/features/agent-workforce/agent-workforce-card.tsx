import Link from "next/link";

import type { BusinessAgentWorkforceItem } from "./types";
import styles from "./agent-workforce.module.css";

interface AgentWorkforceCardProps {
  readonly item: BusinessAgentWorkforceItem;
  readonly onUseViaAra?: (agent: BusinessAgentWorkforceItem) => void;
  readonly araHref?: string;
}

export function AgentWorkforceCard({
  item,
  onUseViaAra,
  araHref = "/workspace",
}: AgentWorkforceCardProps) {
  const headingId = `agent-title-${item.agentKey}`;

  // Safe capability display label
  const capabilityLabel =
    item.capabilityKeys.length > 0
      ? item.capabilityKeys[0].replace(/_/g, " ").toLowerCase()
      : "Target capability";

  return (
    <article className={styles.agentCard} aria-labelledby={headingId}>
      <div className={styles.agentCardLeft}>
        <div className={styles.avatarBadge} aria-hidden="true">
          AI
        </div>
        <div className={styles.agentDetails}>
          <h4 id={headingId} className={styles.agentName}>
            {item.name}
          </h4>
          <p className={styles.agentPurpose}>{item.purpose}</p>
        </div>
      </div>

      <div className={styles.agentCardRight}>
        <span className={styles.capabilityBadge} title={item.capabilityKeys.join(", ")}>
          {capabilityLabel}
        </span>

        <span className={styles.humanReviewNote}>
          {item.humanReviewRequired ? "Human review required" : "Governed workflow"}
        </span>

        {onUseViaAra ? (
          <button
            type="button"
            className={styles.useAraButton}
            onClick={() => onUseViaAra(item)}
            aria-label={`Gunakan kapabilitas ${item.name} via ARA`}
          >
            Gunakan via ARA
          </button>
        ) : (
          <Link
            href={araHref}
            className={styles.useAraButton}
            aria-label={`Gunakan kapabilitas ${item.name} via ARA`}
          >
            Gunakan via ARA
          </Link>
        )}
      </div>
    </article>
  );
}
