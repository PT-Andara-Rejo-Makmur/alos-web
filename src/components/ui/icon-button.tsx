import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

import type { ButtonVariant } from "./button";
import styles from "./ui.module.css";

export type IconButtonSize = "sm" | "md" | "lg";

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly icon: ReactNode;
  readonly label: string;
  readonly size?: IconButtonSize;
  readonly variant?: ButtonVariant;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  {
    className,
    icon,
    label,
    size = "md",
    type = "button",
    variant = "ghost",
    ...props
  },
  ref,
) {
  const classes = [styles.iconButton, styles[`iconButton${capitalize(variant)}`], styles[`iconButton${capitalize(size)}`], className]
    .filter(Boolean)
    .join(" ");

  return (
    <button {...props} aria-label={label} className={classes} ref={ref} title={label} type={type}>
      {icon}
    </button>
  );
});

IconButton.displayName = "IconButton";

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
