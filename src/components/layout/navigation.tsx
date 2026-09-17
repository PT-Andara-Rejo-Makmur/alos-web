"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/business", label: "Business" },
  { href: "/ara", label: "ARA" },
  { href: "/genesis", label: "GENESIS" },
  { href: "/director", label: "Director" },
  { href: "/giivepro", label: "GIIVEPRO" },
] as const;

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="nav" aria-label="Navigasi pengalaman">
      {items.map((item) => (
        <Link
          aria-current={pathname === item.href ? "page" : undefined}
          className={pathname === item.href ? "nav-link nav-link--active" : "nav-link"}
          href={item.href}
          key={item.href}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
