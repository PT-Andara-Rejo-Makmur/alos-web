import type { ReactNode } from "react";

import styles from "./ui.module.css";

export type StatusVariant = "success" | "warning" | "danger" | "info" | "neutral";

export interface StatusProps {
  readonly icon?: ReactNode;
  readonly label: ReactNode;
  readonly variant?: StatusVariant;
}

export function Status({ icon, label, variant = "neutral" }: StatusProps) {
  return (
    <span aria-label={typeof label === "string" ? label : undefined} className={[styles.status, styles[`status${capitalize(variant)}`]].join(" ")} role="status">
      {icon ? <span aria-hidden="true" className={styles.statusIcon}>{icon}</span> : null}
      <span>{label}</span>
    </span>
  );
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
