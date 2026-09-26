import type { ReactNode } from "react";
import { AlertTriangle, Info } from "lucide-react";
import styles from "./strategy-ui.module.css";

interface StrategyNoticeProps {
  readonly children?: ReactNode;
  readonly message?: ReactNode;
  readonly variant?: "warning" | "neutral" | "info";
  readonly title?: string;
}

export function StrategyNotice({
  children,
  message,
  variant = "neutral",
  title,
}: StrategyNoticeProps) {
  const isWarning = variant === "warning";
  const Icon = isWarning ? AlertTriangle : Info;
  const content = children ?? message;

  return (
    <aside
      aria-label={title ?? "Catatan Strategi"}
      className={`${styles.notice} ${isWarning ? styles.noticeWarning : styles.noticeNeutral}`}
      role="note"
    >
      <Icon aria-hidden={true} size={18} style={{ flexShrink: 0, marginTop: 2 }} />
      <div>
        {title ? (
          <strong style={{ display: "block", marginBottom: 2 }}>{title}</strong>
        ) : null}
        <div>{content}</div>
      </div>
    </aside>
  );
}
