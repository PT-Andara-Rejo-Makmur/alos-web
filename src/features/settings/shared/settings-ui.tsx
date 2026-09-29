"use client";

import type { ReactNode } from "react";

import { Button } from "@/components/ui";

import { settingsSourceLabels, type SettingsSourceState } from "../settings-model";
import styles from "../settings.module.css";

export function SettingsSourceStateView({ children, description, state, title = "Status Data" }: Readonly<{ children?: ReactNode; description: string; state: SettingsSourceState; title?: string }>) {
  return (
    <div className={styles.sourceState} role="status">
      <strong>{title}: {settingsSourceLabels[state]}</strong>
      <span>{description}</span>
      {children}
    </div>
  );
}

export function SettingsUnavailableAction({ label }: Readonly<{ label: string }>) {
  return <Button disabled variant="secondary">{label} belum tersedia</Button>;
}

export function SettingsAccessState({ retry, text, title }: Readonly<{ retry?: () => void; text: string; title: string }>) {
  return (
    <main className={styles.accessState}>
      <div className={styles.accessCard}>
        <p className={styles.accessBrand}>ALOS</p>
        <h1 className={styles.accessTitle}>{title}</h1>
        <p className={styles.accessText}>{text}</p>
        {retry ? <Button onClick={retry} variant="secondary">Coba lagi</Button> : null}
      </div>
    </main>
  );
}
