import type { ReactNode } from "react";
import { statusLabel } from "@/lib/presentation";

import styles from "./ui.module.css";

export type StatusVariant = "success" | "warning" | "danger" | "info" | "neutral";

export interface StatusProps {
  readonly icon?: ReactNode;
  readonly label: ReactNode;
  readonly variant?: StatusVariant;
}

export function Status({ icon, label, variant = "neutral" }: StatusProps) {
  const display = typeof label === "string" ? statusLabel(label) : label;
  return (
    <span aria-label={typeof display === "string" ? display : undefined} className={[styles.status, styles[`status${capitalize(variant)}`]].join(" ")} role="status">
      {icon ? <span aria-hidden="true" className={styles.statusIcon}>{icon}</span> : null}
      <span>{display}</span>
    </span>
  );
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
