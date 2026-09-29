"use client";

import Link from "next/link";
import { Bot, Settings } from "lucide-react";
import { usePathname } from "next/navigation";

import styles from "./app-shell.module.css";

interface GlobalUserNavigationProps {
  readonly collapsed?: boolean;
  readonly onNavigate?: () => void;
}

export function GlobalUserNavigation({ collapsed = false, onNavigate }: GlobalUserNavigationProps) {
  const pathname = usePathname() ?? "";
  const items = [
    { href: "/workspace", icon: Bot, label: "AI Workspace" },
    { href: "/settings/profile", icon: Settings, label: "Pengaturan" },
  ] as const;

  return (
    <div className={styles.navigationSection}>
      <p className={styles.sectionLabel}>GLOBAL</p>
      {items.map((item) => {
        const active = item.href === "/settings/profile"
          ? pathname === "/settings" || pathname.startsWith("/settings/")
          : pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            aria-current={active ? "page" : undefined}
            aria-label={item.label}
            className={[styles.navigationItem, active ? styles.navigationItemActive : ""].filter(Boolean).join(" ")}
            href={item.href}
            key={item.href}
            onClick={onNavigate}
            title={collapsed ? item.label : undefined}
          >
            <Icon aria-hidden="true" size={18} strokeWidth={1.9} />
            <span className={styles.navigationItemLabel}>{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
