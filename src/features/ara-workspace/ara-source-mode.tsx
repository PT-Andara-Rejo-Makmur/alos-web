"use client";

import type { AraSourceMode } from "./types";
import styles from "./ara-workspace.module.css";

interface AraSourceModeProps {
  readonly mode: AraSourceMode;
  readonly onChange: (nextMode: AraSourceMode) => void;
  readonly disabled?: boolean;
}

const MODES: readonly { key: AraSourceMode; label: string; ariaLabel: string }[] = [
  { key: "AUTO", label: "AUTO", ariaLabel: "Mode otomatis" },
  { key: "INTERNAL", label: "INTERNAL", ariaLabel: "Mode dokumen internal" },
  { key: "EXTERNAL", label: "EXTERNAL", ariaLabel: "Mode sumber eksternal" },
  { key: "GABUNGAN", label: "GABUNGAN", ariaLabel: "Mode gabungan internal dan eksternal" },
];

export function AraSourceModeSelector({
  mode,
  onChange,
  disabled = false,
}: AraSourceModeProps) {
  return (
    <div
      className={styles.sourceModeContainer}
      role="group"
      aria-label="Pilihan mode sumber data ARA"
    >
      {MODES.map((item) => {
        const isActive = mode === item.key;
        return (
          <button
            key={item.key}
            type="button"
            className={`${styles.sourcePill} ${isActive ? styles.sourcePillActive : ""}`}
            onClick={() => onChange(item.key)}
            aria-pressed={isActive}
            aria-label={item.ariaLabel}
            disabled={disabled}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
