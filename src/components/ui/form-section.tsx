import type { ReactNode } from "react";
import styles from "./ui.module.css";

export function FormSection({ title, description, children }: Readonly<{ title: string; description?: string; children: ReactNode }>) {
  return <fieldset className={styles.formSection}><legend>{title}</legend>{description ? <p>{description}</p> : null}<div className={styles.formSectionFields}>{children}</div></fieldset>;
}
