import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

import styles from "./ui.module.css";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly iconAfter?: ReactNode;
  readonly iconBefore?: ReactNode;
  readonly loading?: boolean;
  readonly loadingLabel?: string;
  readonly size?: ButtonSize;
  readonly variant?: ButtonVariant;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    children,
    className,
    disabled,
    iconAfter,
    iconBefore,
    loading = false,
    loadingLabel,
    size = "md",
    type = "button",
    variant = "primary",
    ...props
  },
  ref,
) {
  const content = loading && loadingLabel ? loadingLabel : children;
  const classes = [styles.button, styles[`button${capitalize(variant)}`], styles[`button${capitalize(size)}`], className]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      {...props}
      aria-busy={loading || undefined}
      className={classes}
      disabled={disabled || loading}
      ref={ref}
      type={type}
    >
      {loading ? <span aria-hidden="true" className={styles.buttonLoadingMark} /> : iconBefore}
      <span>{content}</span>
      {!loading ? iconAfter : null}
    </button>
  );
});

Button.displayName = "Button";

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
