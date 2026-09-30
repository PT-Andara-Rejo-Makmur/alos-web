import type { Metadata } from "next";

import { ForgotPasswordPage } from "@/features/session";

export const metadata: Metadata = {
  title: "Lupa Kata Sandi ALOS",
  description: "Pemulihan kata sandi akun ALOS PT Andara Rejo Makmur.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return <ForgotPasswordPage />;
}
