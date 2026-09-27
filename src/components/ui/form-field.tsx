import { cloneElement, isValidElement, useId, type ReactElement, type ReactNode } from "react";

import styles from "./ui.module.css";

interface ControlProps {
  readonly "aria-describedby"?: string;
  readonly "aria-invalid"?: boolean;
  readonly "aria-required"?: boolean;
  readonly className?: string;
  readonly id?: string;
}

export interface FormFieldProps {
  readonly children: ReactNode;
  readonly description?: ReactNode;
  readonly error?: ReactNode;
  readonly htmlFor?: string;
  readonly label: ReactNode;
  readonly required?: boolean;
}

export function FormField({ children, description, error, htmlFor, label, required = false }: FormFieldProps) {
  const generatedId = `alos-field-${useId().replaceAll(":", "")}`;
  const childId = getChildId(children);
  const controlId = htmlFor ?? childId ?? generatedId;
  const descriptionId = description ? `${generatedId}-description` : undefined;
  const errorId = error ? `${generatedId}-error` : undefined;
  const control = injectControlProps(children, {
    "aria-describedby": [descriptionId, errorId].filter(Boolean).join(" ") || undefined,
    "aria-invalid": error ? true : undefined,
    "aria-required": required || undefined,
    className: "alos-form-control",
    id: controlId,
  });

  return (
    <div className={styles.formField}>
      <label className={styles.formLabel} htmlFor={controlId}>
        <span>{label}</span>
        {required ? <span aria-hidden="true" className={styles.requiredMarker}>*</span> : null}
      </label>
      {control}
      {description ? <p className={styles.formDescription} id={descriptionId}>{description}</p> : null}
      {error ? <p className={styles.formError} id={errorId} role="alert">{error}</p> : null}
    </div>
  );
}

function injectControlProps(children: ReactNode, props: ControlProps): ReactNode {
  if (!isValidElement(children)) return children;
  const element = children as ReactElement<ControlProps>;
  return cloneElement(element, {
    ...props,
    className: [element.props.className, "alos-form-control"].filter(Boolean).join(" "),
    id: element.props.id ?? props.id,
    "aria-describedby": [element.props["aria-describedby"], props["aria-describedby"]]
      .filter(Boolean)
      .join(" ") || undefined,
  });
}

function getChildId(children: ReactNode): string | undefined {
  if (!isValidElement(children)) return undefined;
  const element = children as ReactElement<ControlProps>;
  return element.props.id;
}
