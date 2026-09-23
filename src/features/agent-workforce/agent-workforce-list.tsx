import { AgentWorkforceCard } from "./agent-workforce-card";
import type { AgentWorkforceStatus, BusinessAgentWorkforceItem } from "./types";
import styles from "./agent-workforce.module.css";

interface AgentWorkforceListProps {
  readonly workspaceName: string;
  readonly items: readonly BusinessAgentWorkforceItem[];
  readonly status: AgentWorkforceStatus;
  readonly errorMessage?: string | null;
  readonly onUseViaAra?: (agent: BusinessAgentWorkforceItem) => void;
}

export function AgentWorkforceList({
  workspaceName,
  items,
  status,
  errorMessage,
  onUseViaAra,
}: AgentWorkforceListProps) {
  return (
    <section className={styles.workforceSection} aria-labelledby="workforce-title">
      <div className={styles.sectionHeader}>
        <span className={styles.sectionEyebrow}>WORKFORCE TERSEDIA</span>
        <h3 id="workforce-title" className={styles.sectionTitle}>
          Capability untuk {workspaceName}
        </h3>
        <p className={styles.sectionSubtitle}>
          Daftar capability aktif hasil verifikasi Backend untuk workspace ini.
        </p>
      </div>

      {status === "LOADING" && (
        <div className={styles.emptyState} role="status">
          <p className={styles.emptyStateTitle}>Memuat Agent Workforce…</p>
          <p className={styles.emptyStateText}>
            Memverifikasi capability yang diotorisasi untuk workspace aktif.
          </p>
        </div>
      )}

      {status === "ERROR" && (
        <div className={styles.emptyState} role="alert">
          <p className={styles.emptyStateTitle}>Gagal Memuat Capability</p>
          <p className={styles.emptyStateText}>
            {errorMessage ||
              "Agent Workforce belum dapat diverifikasi. Capability tidak akan ditampilkan dari data lokal."}
          </p>
        </div>
      )}

      {status !== "LOADING" && status !== "ERROR" && items.length === 0 && (
        <div className={styles.emptyState} role="status">
          <p className={styles.emptyStateTitle}>Belum Ada Capability AI</p>
          <p className={styles.emptyStateText}>
            Belum ada capability AI yang tersedia untuk workspace ini. Hubungi owner workspace atau IT untuk penambahan capability.
          </p>
        </div>
      )}

      {status !== "LOADING" && status !== "ERROR" && items.length > 0 && (
        <div className={styles.agentList} role="list" aria-label={`Daftar agent untuk ${workspaceName}`}>
          {items.map((item) => (
            <AgentWorkforceCard
              key={item.agentKey}
              item={item}
              onUseViaAra={onUseViaAra}
            />
          ))}
        </div>
      )}

      <p className={styles.workforceFootnote}>
        Tidak ada tombol RUN / ACTIVATE / RELEASE untuk user bisnis.
      </p>
    </section>
  );
}
