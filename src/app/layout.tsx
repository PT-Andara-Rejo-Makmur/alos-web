import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/app-shell";

import "@/features/mvp1/styles/mvp1-base.css";
import "@/features/mvp1/styles/genesis.css";
import "@/features/mvp1/styles/governance.css";
import "@/features/mvp1/styles/portfolio.css";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "ALOS Workspace", template: "%s | ALOS" },
  description: "Unified workspace for ALOS, ARA, GENESIS, Director, and GIIVEPRO.",
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
