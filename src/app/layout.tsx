import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/app-shell";

import "@/features/mvp1/styles/mvp1-base.css";
import "@/features/mvp1/styles/genesis.css";
import "@/features/mvp1/styles/governance.css";
import "@/features/mvp1/styles/portfolio.css";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-display",
  display: "swap",
});

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
    <html lang="id" className={`${manrope.variable} ${cormorantGaramond.variable}`}>
      <body className={manrope.className}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
