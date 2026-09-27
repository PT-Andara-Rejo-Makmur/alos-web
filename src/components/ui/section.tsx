import type { ReactNode } from "react";

import styles from "./ui.module.css";

export interface SectionProps {
  readonly actions?: ReactNode;
  readonly bordered?: boolean;
  readonly children: ReactNode;
  readonly description?: ReactNode;
  readonly title?: ReactNode;
}

export function Section({ actions, bordered = false, children, description, title }: SectionProps) {
  const classes = [styles.section, bordered ? styles.sectionBordered : ""].filter(Boolean).join(" ");

  return (
    <section className={classes}>
      {title || description || actions ? (
        <header className={styles.sectionHeader}>
          <div>
            {title ? <h2 className={styles.sectionTitle}>{title}</h2> : null}
            {description ? <p className={styles.sectionDescription}>{description}</p> : null}
          </div>
          {actions ? <div className={styles.sectionActions}>{actions}</div> : null}
        </header>
      ) : null}
      {children}
    </section>
  );
}
