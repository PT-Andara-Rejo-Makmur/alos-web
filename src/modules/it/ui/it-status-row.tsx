import type { LucideIcon } from "lucide-react";
import { ItStatusBadge, type ItStatusType } from "./it-status-badge";
import styles from "./it-ui.module.css";

export interface ItStatusRowProps {
  readonly icon: LucideIcon;
  readonly label: string;
  readonly status: ItStatusType;
  readonly helper: string;
  readonly detail?: string;
  readonly statusLabel?: string;
}

export function ItStatusRow({
  icon: Icon,
  label,
  status,
  helper,
  detail,
  statusLabel,
}: ItStatusRowProps) {
  return (
    <div className={styles.statusRow}>
      <div className={styles.statusRowIdentity}>
        <Icon aria-hidden={true} className={styles.statusRowIcon} size={19} />
        <div>
          <p className={styles.statusRowLabel}>{label}</p>
          <p className={styles.statusRowHelper}>{helper}</p>
        </div>
      </div>
      <div className={styles.statusRowState}>
        <ItStatusBadge label={statusLabel} status={status} />
        {detail && <code className={styles.statusRowDetail}>{detail}</code>}
      </div>
    </div>
  );
}
