import type { StrategySourceState, StrategyStatus } from "../shared/types";
import { strategyStatusLabel } from "../shared/strategy-constants";
import styles from "./strategy-ui.module.css";

interface StrategyStatusBadgeProps {
  readonly status?: StrategyStatus | StrategySourceState | string | null;
  readonly label?: string;
}

export function StrategyStatusBadge({ status, label }: StrategyStatusBadgeProps) {
  let badgeClass = styles.badgeNotConnected;
  let text = label ?? (status || "—");

  if (!status) {
    badgeClass = styles.badgeNotConnected;
    text = label ?? "—";
  } else if (status === "CONNECTED") {
    badgeClass = styles.badgeConnected;
    text = label ?? "TERHUBUNG";
  } else if (status === "NOT_CONNECTED") {
    badgeClass = styles.badgeNotConnected;
    text = label ?? "BELUM TERHUBUNG";
  } else if (status === "ON_TRACK" || status === "ACHIEVED") {
    badgeClass = styles.badgeOnTrack;
    text = label ?? strategyStatusLabel(status as StrategyStatus);
  } else if (status === "AT_RISK") {
    badgeClass = styles.badgeAtRisk;
    text = label ?? strategyStatusLabel(status as StrategyStatus);
  } else if (status === "BEHIND") {
    badgeClass = styles.badgeBehind;
    text = label ?? strategyStatusLabel(status as StrategyStatus);
  } else if (status === "UNDER_REVIEW" || status === "REVISED") {
    badgeClass = styles.badgeUnderReview;
    text = label ?? strategyStatusLabel(status as StrategyStatus);
  }

  return (
    <span className={`${styles.badge} ${badgeClass}`}>
      {text}
    </span>
  );
}
