import type { Metadata } from "next";

import { ResetPasswordPage } from "@/features/session";

export const metadata: Metadata = {
  title: "Atur Ulang Kata Sandi ALOS",
  description: "Atur ulang kata sandi akun ALOS PT Andara Rejo Makmur.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return <ResetPasswordPage />;
}
