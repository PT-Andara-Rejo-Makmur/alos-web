"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const navigationItems = [
  { href: "/business", label: "Business Workspace" },
  { href: "/ara", label: "ARA" },
  { href: "/genesis", label: "GENESIS" },
  { href: "/agents", label: "Agents / Capabilities" },
  { href: "/research", label: "R&D" },
  { href: "/governance", label: "Governance" },
  { href: "/director", label: "Director" },
  { href: "/giivepro", label: "GIIVEPRO" },
] as const;

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="nav" aria-label="Navigasi pengalaman">
      {navigationItems.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
        <Link
          aria-current={active ? "page" : undefined}
          className={active ? "nav-link nav-link--active" : "nav-link"}
          href={item.href}
          key={item.href}
        >
          {item.label}
        </Link>
        );
      })}
    </nav>
  );
}
