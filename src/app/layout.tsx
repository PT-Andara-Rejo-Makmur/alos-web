import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/app-shell";

import "@/styles/workspace-foundation.css";
import "@/styles/genesis-workspace.css";
import "@/styles/governance.css";
import "@/styles/projects.css";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "ALOS — Andara Lean Operating System | PT Andara Rejo Makmur",
    template: "%s | ALOS",
  },
  description:
    "ALOS adalah Andara Lean Operating System, platform terpadu PT Andara Rejo Makmur untuk menghubungkan operasi, data, tata kelola, proyek, dan kolaborasi manusia dengan AI.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="id">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
