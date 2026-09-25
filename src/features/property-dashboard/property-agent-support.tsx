"use client";

import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import type { PropertyAgentSupportItem } from "./types";
import styles from "./property-dashboard.module.css";

interface PropertyAgentSupportProps {
  readonly agents: readonly PropertyAgentSupportItem[];
  readonly onOpenAra?: () => void;
}

export function PropertyAgentSupport({ agents, onOpenAra }: PropertyAgentSupportProps) {
  const router = useRouter();

  function handleAskAra() {
    if (onOpenAra) {
      onOpenAra();
    } else {
      router.push("/workspace/property/ara");
    }
  }

  return (
    <article
      aria-label="Dukungan Kecerdasan Buatan dan Agen Proyek"
      className={styles.intelligenceCard}
    >
      <p className={styles.intelligenceEyebrow}>ARA &amp; AGENT SUPPORT</p>
      <h2 className={styles.intelligenceTitle}>Property Intelligence</h2>
      <p className={styles.intelligenceSubtitle}>
        Capability aktif hanya jika registry mengonfirmasi.
      </p>

      <div className={styles.agentList}>
        {agents.map((agent) => (
          <div className={styles.agentItem} key={agent.id}>
            <div className={styles.agentItemLeft}>
              <span aria-hidden="true" className={styles.agentDot} />
              <span className={styles.agentName}>{agent.name}</span>
            </div>
            <span className={styles.agentStatusBadge}>{agent.status}</span>
          </div>
        ))}
      </div>

      <button
        aria-label="Tanyakan ARA tentang proyek ini"
        className={styles.araButton}
        onClick={handleAskAra}
        type="button"
      >
        <Sparkles size={16} strokeWidth={2} />
        <span>Tanyakan ARA tentang proyek ini</span>
      </button>
    </article>
  );
}
