import React from "react";
import { AlertCircle, AlertTriangle, Info } from "lucide-react";
import styles from "./it-ui.module.css";

export interface ItNoticeProps {
  readonly variant?: "warning" | "neutral" | "info";
  readonly title?: string;
  readonly children: React.ReactNode;
}

export function ItNotice({
  variant = "neutral",
  title,
  children,
}: ItNoticeProps) {
  let styleClass = styles.noticeNeutral;
  let Icon = Info;

  if (variant === "warning") {
    styleClass = styles.noticeWarning;
    Icon = AlertTriangle;
  } else if (variant === "info") {
    styleClass = styles.noticeInfo;
    Icon = AlertCircle;
  }

  return (
    <div className={`${styles.notice} ${styleClass}`} role="status">
      <Icon aria-hidden={true} className={styles.noticeIcon} size={16} strokeWidth={2} />
      <div>
        {title && <strong style={{ display: "block", marginBottom: 2 }}>{title}</strong>}
        <span>{children}</span>
      </div>
    </div>
  );
}
