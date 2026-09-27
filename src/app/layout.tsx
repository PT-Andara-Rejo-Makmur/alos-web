import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "ALOS — Andara Lean Operating System | PT Andara Rejo Makmur",
    template: "%s | ALOS",
  },
  description:
    "ALOS adalah Andara Lean Operating System, platform terpadu PT Andara Rejo Makmur.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="id">
      <body className={inter.variable}>{children}</body>
    </html>
  );
}
