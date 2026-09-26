"use client";

import React from "react";
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from "lucide-react";
import styles from "./work-ui.module.css";

interface WorkNoticeProps {
  readonly variant?: "success" | "error" | "info" | "warning";
  readonly title?: string;
  readonly message: string;
}

export const WorkNotice: React.FC<WorkNoticeProps> = ({
  variant = "info",
  title,
  message,
}) => {
  const isError = variant === "error";
  const isSuccess = variant === "success";

  return (
    <div
      className={isError ? styles.bannerError : isSuccess ? styles.bannerSuccess : styles.bannerSuccess}
      style={
        variant === "info"
          ? { background: "#f0f9ff", borderColor: "#bae6fd", color: "#0369a1" }
          : variant === "warning"
            ? { background: "#fffbeb", borderColor: "#fde68a", color: "#b45309" }
            : undefined
      }
      role={isError ? "alert" : "status"}
    >
      {isError && <AlertCircle size={15} aria-hidden="true" />}
      {isSuccess && <CheckCircle2 size={15} aria-hidden="true" />}
      {variant === "info" && <Info size={15} aria-hidden="true" />}
      {variant === "warning" && <AlertTriangle size={15} aria-hidden="true" />}
      <div>
        {title && <strong style={{ display: "block", marginBottom: "2px" }}>{title}</strong>}
        <span>{message}</span>
      </div>
    </div>
  );
};
