import styles from "./ui.module.css";

export type LoadingStateVariant = "page" | "section" | "table";

export interface LoadingStateProps {
  readonly label?: string;
  readonly variant?: LoadingStateVariant;
}

export function LoadingState({ label = "Memuat data", variant = "section" }: LoadingStateProps) {
  const rows = variant === "table" ? 4 : variant === "page" ? 6 : 3;
  return (
    <div aria-label={label} aria-live="polite" className={[styles.loadingState, styles[`loadingState${capitalize(variant)}`]].join(" ")} role="status">
      <span aria-hidden="true" className={styles.loadingStateLabel}>{label}</span>
      <div aria-hidden="true" className={styles.loadingRows}>
        {Array.from({ length: rows }, (_, index) => (
          <span className={styles.loadingRow} key={index} />
        ))}
      </div>
    </div>
  );
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
