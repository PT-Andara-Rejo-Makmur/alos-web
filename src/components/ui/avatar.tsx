import Image from "next/image";

import styles from "./ui.module.css";

export type AvatarSize = "sm" | "md" | "lg";

export interface AvatarProps {
  readonly alt?: string;
  readonly initials?: string;
  readonly size?: AvatarSize;
  readonly src?: string | null;
}

export function Avatar({ alt = "Avatar", initials = "?", size = "md", src }: AvatarProps) {
  const safeInitials = initials.trim() || "?";
  const classes = [styles.avatar, styles[`avatar${capitalize(size)}`]].join(" ");

  return (
    <span aria-label={src ? alt : `${alt}: ${safeInitials}`} className={classes} role="img">
      {src ? <Image alt={alt} fill sizes="40px" src={src} /> : <span aria-hidden="true">{safeInitials}</span>}
    </span>
  );
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
