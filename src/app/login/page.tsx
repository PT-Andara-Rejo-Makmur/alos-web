import type { Metadata } from "next";

import { LoginPage } from "@/features/session";

export const metadata: Metadata = {
  title: "Masuk ke ALOS",
  description: "Halaman autentikasi terpadu ALOS untuk PT Andara Rejo Makmur.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function Page({ searchParams }: { searchParams: Promise<{ activated?: string }> }) {
  const params = await searchParams;
  return <LoginPage activated={params.activated === "1"} />;
}
