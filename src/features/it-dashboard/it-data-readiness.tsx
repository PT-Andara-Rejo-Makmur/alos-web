import React from "react";
import { Activity, Bot, DatabaseBackup, Lock, ShieldCheck } from "lucide-react";
import type { ItSourceReadinessItem, ItSourceReadinessKey } from "./types";
import styles from "./it-dashboard.module.css";

interface ItDataReadinessProps {
  readonly items: readonly ItSourceReadinessItem[];
}

const READINESS_ICONS: Record<ItSourceReadinessKey, React.ComponentType<{ size?: number; className?: string; "aria-hidden"?: boolean }>> = {
  GENESIS: Bot,
  GOVERNANCE: ShieldCheck,
  MONITORING: Activity,
  BACKUP: DatabaseBackup,
  SECURITY: Lock,
  INCIDENTS: Activity,
  ACCESS_REVIEW: ShieldCheck,
  RECOVERY: DatabaseBackup,
};

export function ItDataReadiness({ items }: ItDataReadinessProps) {
  return (
    <section aria-label="Kesiapan Data IT & Telemetri" className={styles.readinessStrip}>
      <div className={styles.readinessHeader}>
        <span className={styles.readinessEyebrow}>IT Operational Readiness</span>
      </div>

      <div className={styles.readinessItems}>
        {items.map((item) => {
          const isLive = item.state === "LIVE";
          const isPartial = item.state === "PARTIAL";
          const Icon = READINESS_ICONS[item.key] ?? Activity;

          return (
            <div className={styles.readinessItem} key={item.key} title={item.context}>
              <span aria-hidden="true" className={styles.readinessIcon}>
                <Icon aria-hidden={true} size={15} />
              </span>
              <span className={styles.readinessLabel}>{item.label}</span>
              <span
                className={`${styles.readinessState} ${
                  isLive
                    ? styles.stateLive
                    : isPartial
                      ? styles.statePartial
                      : styles.stateNotConnected
                }`}
              >
                <span aria-hidden="true" className={styles.dot} />
                <span>{isLive ? "LIVE" : isPartial ? "PARTIAL" : "NOT CONNECTED"}</span>
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
