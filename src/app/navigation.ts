import { House, LayoutDashboard } from "lucide-react";

import type { AppNavigationSection } from "@/components/app-shell/app-shell";

export function navigationForSession(includeExecutive: boolean): readonly AppNavigationSection[] {
  return [
    {
      items: [
        { href: "/workspace", icon: House, label: "Beranda" },
        ...(includeExecutive
          ? [{ href: "/workspace/executive", icon: LayoutDashboard, label: "Pusat Kendali" }]
          : []),
      ],
      label: "UTAMA",
    },
  ];
}
