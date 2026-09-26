import { Activity, Bot, DatabaseBackup, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ItStatusBadge } from "@/modules/it/ui";
import type { ItSourceReadinessItem, ItSourceReadinessKey } from "./types";
import styles from "./it-dashboard.module.css";

interface ItDataReadinessProps {
  readonly items: readonly ItSourceReadinessItem[];
}

const READINESS_ICONS: Record<ItSourceReadinessKey, LucideIcon> = {
  GENESIS: Bot,
  GOVERNANCE: ShieldCheck,
  MONITORING: Activity,
  BACKUP: DatabaseBackup,
  SECURITY: ShieldCheck,
};

export function ItDataReadiness({ items }: ItDataReadinessProps) {
  return (
    <section aria-labelledby="operational-readiness-title" className={styles.readinessSection}>
      <h2 className={styles.readinessTitle} id="operational-readiness-title">
        Operational Readiness
      </h2>
      <div className={styles.readinessStrip}>
        {items.map((item) => {
          const Icon = READINESS_ICONS[item.key];
          return (
            <div className={styles.readinessItem} key={item.key}>
              <Icon aria-hidden={true} className={styles.readinessIcon} size={18} />
              <div className={styles.readinessText}>
                <span className={styles.readinessLabel}>{item.label}</span>
                <span className={styles.readinessHelper}>{item.context}</span>
              </div>
              <ItStatusBadge status={item.state} />
            </div>
          );
        })}
      </div>
    </section>
  );
}
