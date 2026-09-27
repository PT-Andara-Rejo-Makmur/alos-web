import { House, LayoutDashboard } from "lucide-react";

import type { AppNavigationSection } from "@/components/app-shell/app-shell";

export const executiveNavigation: readonly AppNavigationSection[] = [
  {
    items: [
      { href: "/workspace", icon: House, label: "Beranda" },
      { href: "/workspace/executive", icon: LayoutDashboard, label: "Pusat Kendali" },
    ],
    label: "UTAMA",
  },
];
