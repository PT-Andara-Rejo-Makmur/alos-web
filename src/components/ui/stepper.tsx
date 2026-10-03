import styles from "./ui.module.css";

export function Stepper({ steps, current }: Readonly<{ steps: readonly string[]; current: number }>) {
  return <ol className={styles.stepper} aria-label="Langkah pengisian">{steps.map((label, index) => <li key={label} aria-current={index === current ? "step" : undefined} data-complete={index < current}><span>{index < current ? "✓" : index + 1}</span>{label}</li>)}</ol>;
}
