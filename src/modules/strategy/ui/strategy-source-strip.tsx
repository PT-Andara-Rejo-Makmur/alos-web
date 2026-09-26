import { Server } from "lucide-react";
import type { StrategySourceState } from "../shared/types";
import { STRATEGY_SOURCE_HELPERS } from "../shared/strategy-constants";
import { StrategyStatusBadge } from "./strategy-status-badge";
import styles from "./strategy-ui.module.css";

interface StrategySourceStripProps {
  readonly state?: StrategySourceState;
  readonly sourceState?: StrategySourceState;
  readonly label?: string;
  readonly helperText?: string;
}

export function StrategySourceStrip({
  state,
  sourceState,
  label = "Sumber Strategi & KPI",
  helperText,
}: StrategySourceStripProps) {
  const resolvedState = state ?? sourceState ?? "NOT_CONNECTED";
  const helper = helperText ?? STRATEGY_SOURCE_HELPERS[resolvedState];

  return (
    <section aria-label="Status Sumber Strategi" className={styles.sourceStrip} role="region">
      <div className={styles.sourceLeft}>
        <Server aria-hidden={true} className={styles.sourceIcon} size={18} />
        <div>
          <div className={styles.sourceTitle}>{label}</div>
          <div className={styles.sourceHelper}>{helper}</div>
        </div>
      </div>
      <StrategyStatusBadge status={resolvedState} />
    </section>
  );
}
