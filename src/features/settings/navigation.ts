import { Bell, MonitorSmartphone, Settings, ShieldCheck, UserRound } from "lucide-react";

import type { AppNavigationSection } from "@/components/app-shell/app-shell";

export function settingsNavigation(): readonly AppNavigationSection[] {
  return [
    {
      label: "AKUN",
      items: [
        { href: "/settings/profile", icon: UserRound, label: "Profil" },
        { href: "/settings/security", icon: ShieldCheck, label: "Keamanan" },
        { href: "/settings/sessions", icon: MonitorSmartphone, label: "Sesi & Perangkat" },
      ],
    },
    {
      label: "PREFERENSI",
      items: [
        { href: "/settings/notifications", icon: Bell, label: "Notifikasi" },
        { href: "/settings/preferences", icon: Settings, label: "Preferensi" },
      ],
    },
  ];
}
